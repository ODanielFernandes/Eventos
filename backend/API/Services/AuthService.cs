using Microsoft.EntityFrameworkCore;
using RestApi.Data;
using RestApi.DTOs.Requests;
using RestApi.DTOs.Responses;
using RestApi.Models;
using RestApi.Repositories;

namespace RestApi.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwt;
    private readonly AppDbContext _db;

    public AuthService(
        IUserRepository users,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwt,
        AppDbContext db)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _jwt = jwt;
        _db = db;
    }

    public async Task<(bool ok, MessageResponse? error)> SignupAsync(
        SignupRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var user = new User
            {
                Email = request.Email,
                Password = _passwordHasher.Hash(request.Password)
            };

            await _users.CreateAsync(user, cancellationToken);
            return (true, null);
        }
        catch (DbUpdateException)
        {
            return (false, new MessageResponse { message = "Could not save user." });
        }
        catch
        {
            return (false, new MessageResponse { message = "Could not save user." });
        }
    }

    public async Task<(bool ok, LoginResponse? success, MessageResponse? error, int statusCode)> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (user is null || !_passwordHasher.Verify(request.Password, user.Password))
        {
            return (false, null, new MessageResponse { message = "Credentials invalid" }, StatusCodes.Status401Unauthorized);
        }

        var token = _jwt.GenerateToken(user.Email, user.Id);
        return (true, new LoginResponse
        {
            message = "Login successful!",
            token = token
        }, null, StatusCodes.Status200OK);
    }
}