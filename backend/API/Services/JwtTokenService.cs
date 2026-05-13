using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace RestApi.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration) => _configuration = configuration;

    public string GenerateToken(string email, long userId)
    {
        var secret = _configuration["Jwt:SecretKey"] ?? "supersecret";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var hours = double.TryParse(_configuration["Jwt:ExpirationHours"], out var h) ? h : 2d;

        var claims = new[]
        {
            new Claim("email", email),
            new Claim("userId", userId.ToString(System.Globalization.CultureInfo.InvariantCulture))
        };

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(hours),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}