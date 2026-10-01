using ConstructionManagement.Application.Projects;
using ConstructionManagement.Application.Finance;
using ConstructionManagement.Application.Inventory;
using ConstructionManagement.Application.Labour;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Projects;
using ConstructionManagement.Infrastructure.Finance;
using ConstructionManagement.Infrastructure.Inventory;
using ConstructionManagement.Infrastructure.Labour;
using ConstructionManagement.Infrastructure.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 20_000_000);
builder.Services.Configure<FormOptions>(options => options.MultipartBodyLengthLimit = 20_000_000);
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddOpenApi();

var postgres = PostgresConnection.Resolve(
    Environment.GetEnvironmentVariable("ConnectionStrings__ConstructionDatabase"),
    Environment.GetEnvironmentVariable("DATABASE_URL"),
    Environment.GetEnvironmentVariable("POSTGRES_URL"),
    builder.Configuration.GetConnectionString("ConstructionDatabase"),
    builder.Configuration["Database:ConnectionString"]);
var databaseHost = PostgresConnection.Host(postgres) ?? "none";
var databaseProvider = builder.Configuration["Database:Provider"];
if (builder.Environment.IsProduction())
{
    databaseProvider = "Postgres";
    if (string.IsNullOrWhiteSpace(postgres) || !PostgresConnection.IsRenderHost(databaseHost))
    {
        throw new InvalidOperationException(
            "Production must use the Render Postgres database. On construction-management-api set ConnectionStrings__ConstructionDatabase from construction-management-db (or DATABASE_URL). Current host: " + databaseHost + ".");
    }
}
else if (string.IsNullOrWhiteSpace(databaseProvider))
{
    databaseProvider = PostgresConnection.LooksLikePostgres(postgres) ? "Postgres" : "Sqlite";
}

builder.Services.AddDbContext<ConstructionDbContext>(options =>
{
    if (databaseProvider.Equals("Postgres", StringComparison.OrdinalIgnoreCase)
        || PostgresConnection.LooksLikePostgres(postgres))
    {
        if (string.IsNullOrWhiteSpace(postgres))
        {
            throw new InvalidOperationException(
                "Database provider is Postgres but no usable connection string was found. Set ConnectionStrings__ConstructionDatabase or DATABASE_URL.");
        }
        options.UseNpgsql(postgres);
    }
    else if (databaseProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServerConstructionDatabase"));
    }
    else
    {
        var configured = builder.Configuration.GetConnectionString("ConstructionDatabase");
        var sqlite = string.IsNullOrWhiteSpace(configured) || PostgresConnection.LooksLikePostgres(configured)
            ? "Data Source=construction.db"
            : configured;
        options.UseSqlite(sqlite);
    }
});
builder.Services.AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireDigit = false;
        options.Password.RequireNonAlphanumeric = false;
        options.Password.RequireUppercase = false;
        options.Password.RequireLowercase = false;
    })
    .AddRoles<IdentityRole<Guid>>()
    .AddEntityFrameworkStores<ConstructionDbContext>();
var jwtKey = builder.Configuration["Authentication:JwtKey"]
    ?? Environment.GetEnvironmentVariable("CONSTRUCTION_JWT_KEY")
    ?? throw new InvalidOperationException("Authentication:JwtKey or CONSTRUCTION_JWT_KEY is required.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true
    };
});
builder.Services.AddAuthorization();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IFinanceService, FinanceService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<ILabourService, LabourService>();
builder.Services.AddCors(options => options.AddPolicy("Clients", policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var databaseEngine = "unknown";

var app = builder.Build();

Console.WriteLine($"[startup] Database provider: {databaseProvider}");
Console.WriteLine($"[startup] Database host: {databaseHost}");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Clients");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    version = "2026-10-01-renderdb",
    database = databaseEngine,
    databaseHost
}));
app.MapGet("/", () => Results.Ok(new
{
    service = "construction-management-api",
    status = "ok",
    version = "2026-10-01-renderdb",
    database = databaseEngine,
    databaseHost,
    commit = Environment.GetEnvironmentVariable("RENDER_GIT_COMMIT"),
    endpoints = new[]
    {
        "/api/projects",
        "/api/projects/{id}",
        "/api/projects/{id}/construction-plan",
        "/api/materials",
        "/api/boq-items",
        "/api/labour",
        "/api/expenses",
        "/api/payments",
        "/api/auth"
    }
}));

app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ConstructionDbContext>();
        databaseEngine = dbContext.Database.IsNpgsql()
            ? "postgres"
            : dbContext.Database.IsSqlite()
                ? "sqlite"
                : dbContext.Database.ProviderName ?? "unknown";
        await dbContext.Database.EnsureCreatedAsync();
        await EnsureConstructionPlanSchemaAsync(dbContext, databaseProvider);
        Console.WriteLine("[startup] database schema ready.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[startup] database setup failed: {ex.Message}");
    }
}

app.Run();

static async Task EnsureConstructionPlanSchemaAsync(ConstructionDbContext dbContext, string databaseProvider)
{
    if (databaseProvider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
    {
        string[] statements =
        [
            """ALTER TABLE IF EXISTS "Projects" ADD COLUMN IF NOT EXISTS "FoundationSystem" text NOT NULL DEFAULT '';""",
            """ALTER TABLE IF EXISTS "Projects" ADD COLUMN IF NOT EXISTS "ConstructionPlanJson" text NULL;""",
            """ALTER TABLE IF EXISTS "Expenses" ADD COLUMN IF NOT EXISTS "ActivityId" text NULL;""",
            """ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS "FoundationSystem" text NOT NULL DEFAULT '';""",
            """ALTER TABLE IF EXISTS projects ADD COLUMN IF NOT EXISTS "ConstructionPlanJson" text NULL;""",
            """ALTER TABLE IF EXISTS expenses ADD COLUMN IF NOT EXISTS "ActivityId" text NULL;""",
        ];
        foreach (var sql in statements)
        {
            try
            {
                await dbContext.Database.ExecuteSqlRawAsync(sql);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[startup] schema statement skipped: {ex.Message}");
            }
        }
        return;
    }

    if (databaseProvider.Equals("Sqlite", StringComparison.OrdinalIgnoreCase))
    {
        try { await dbContext.Database.ExecuteSqlRawAsync("""ALTER TABLE "Projects" ADD COLUMN "FoundationSystem" TEXT NOT NULL DEFAULT '';"""); } catch { /* already exists */ }
        try { await dbContext.Database.ExecuteSqlRawAsync("""ALTER TABLE "Projects" ADD COLUMN "ConstructionPlanJson" TEXT NULL;"""); } catch { /* already exists */ }
        try { await dbContext.Database.ExecuteSqlRawAsync("""ALTER TABLE "Expenses" ADD COLUMN "ActivityId" TEXT NULL;"""); } catch { /* already exists */ }
    }
}
