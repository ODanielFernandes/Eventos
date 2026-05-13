namespace RestApi.Services;

public class PasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 14;

    public string Hash(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);

    public bool Verify(string password, string passwordHash) =>
        BCrypt.Net.BCrypt.Verify(password, passwordHash);
}