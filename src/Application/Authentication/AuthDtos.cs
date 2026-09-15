namespace ConstructionManagement.Application.Authentication;

public sealed record LoginRequest(string Email, string Password);
public sealed record RegisterRequest(string Email, string Password, string DisplayName);
public sealed record AuthResponse(string AccessToken, DateTime ExpiresUtc, string UserId, string DisplayName);
