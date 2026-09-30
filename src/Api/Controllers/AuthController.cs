using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ConstructionManagement.Application.Authentication;
using ConstructionManagement.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace ConstructionManagement.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(UserManager<ApplicationUser> userManager, IConfiguration configuration) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.DisplayName))
        {
            return BadRequest(new { message = "Name, email, and password are required." });
        }

        try
        {
            var user = new ApplicationUser { UserName = request.Email.Trim(), Email = request.Email.Trim(), DisplayName = request.DisplayName.Trim() };
            var result = await userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded) return BadRequest(new { message = string.Join(" ", result.Errors.Select(error => error.Description)) });
            return Ok(CreateToken(user));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Could not create the account.", detail = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        try
        {
            var user = await userManager.FindByEmailAsync(request.Email.Trim());
            if (user is null || !await userManager.CheckPasswordAsync(user, request.Password)) return Unauthorized(new { message = "Invalid email or password." });
            return Ok(CreateToken(user));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Could not sign in.", detail = ex.Message });
        }
    }

    private AuthResponse CreateToken(ApplicationUser user)
    {
        var key = configuration["Authentication:JwtKey"] ?? Environment.GetEnvironmentVariable("CONSTRUCTION_JWT_KEY")!;
        var expires = DateTime.UtcNow.AddHours(8);
        var claims = new[] { new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()), new Claim(JwtRegisteredClaimNames.Email, user.Email ?? string.Empty), new Claim(ClaimTypes.Name, user.DisplayName) };
        var credentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)), SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(claims: claims, expires: expires, signingCredentials: credentials);
        return new AuthResponse(new JwtSecurityTokenHandler().WriteToken(token), expires, user.Id.ToString(), user.DisplayName);
    }
}
