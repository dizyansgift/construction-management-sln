using ConstructionManagement.Application.Projects;
using ConstructionManagement.Infrastructure.Persistence;
using ConstructionManagement.Infrastructure.Projects;
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
    if (databaseProvider.Equals("SqlServer", StringComparison.OrdinalIgnoreCase))
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
builder.Services.AddCors(options => options.AddPolicy("Clients", policy =>
    policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Clients");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ConstructionDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
}

app.Run();
