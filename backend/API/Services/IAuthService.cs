using RestApi.DTOs.Requests;
using RestApi.DTOs.Responses;

namespace RestApi.Services;

public interface IAuthService
{
    Task<(bool ok, MessageResponse? error)> SignupAsync(SignupRequest request, CancellationToken cancellationToken = default);
    Task<(bool ok, LoginResponse? success, MessageResponse? error, int statusCode)> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken = default);
}