namespace RestApi.Services;

public interface IJwtTokenService
{
    string GenerateToken(string email, long userId);
}