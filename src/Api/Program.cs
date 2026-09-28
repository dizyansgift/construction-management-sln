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
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddOpenApi();
var databaseProvider = builder.Configuration["Database:Provider"] ?? "Sqlite";
builder.Services.AddDbContext<ConstructionDbContext>(options =>
{
    if (databaseProvider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
    {
        var conn = builder.Configuration.GetConnectionString("ConstructionDatabase");
        if (string.IsNullOrWhiteSpace(conn))
        {
            throw new InvalidOperationException(
                "Database provider is Postgres but ConnectionStrings:ConstructionDatabase is not configured. Set the environment variable ConnectionStrings__ConstructionDatabase or update appsettings.");
        }
        options.UseNpgsql(conn);
    }
    else if (databaseProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
    {
        options.UseSqlServer(builder.Configuration.GetConnectionString("SqlServerConstructionDatabase"));
    }
    else
    {
        options.UseSqlite(builder.Configuration.GetConnectionString("ConstructionDatabase"));
    }
});
builder.Services.AddIdentityCore<ApplicationUser>(options =>
    {
        options.User.RequireUniqueEmail = true;
        options.Password.RequiredLength = 8;
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

var app = builder.Build();

// Log chosen database provider and whether a connection string is present (helpful for deployments)
{
    var dbProvider = builder.Configuration["Database:Provider"] ?? "Sqlite";
    var conn = builder.Configuration.GetConnectionString("ConstructionDatabase");
    var hasConn = !string.IsNullOrWhiteSpace(conn);
    Console.WriteLine($"[startup] Database provider: {dbProvider}");
    Console.WriteLine(hasConn ? "[startup] ConstructionDatabase connection string is present." : "[startup] ConstructionDatabase connection string is NOT present.");
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Clients");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => Results.Ok(new
{
    service = "construction-management-api",
    status = "ok",
    endpoints = new[] { "/api/projects", "/api/auth" }
}));
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ConstructionDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
}

app.Run();
