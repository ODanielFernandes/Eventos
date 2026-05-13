using Microsoft.AspNetCore.Mvc;
using RestApi.DTOs.Requests;
using RestApi.DTOs.Responses;
using RestApi.Services;

namespace RestApi.Controllers;

[ApiController]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    // POST /signup
    [HttpPost("signup")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Signup([FromBody] SignupRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new MessageResponse { message = "Could not parse data." });
        }

        var (ok, err) = await _auth.SignupAsync(request, cancellationToken);
        if (!ok)
        {
            return StatusCode(StatusCodes.Status500InternalServerError,
                err ?? new MessageResponse { message = "Could not save user." });
        }

        return StatusCode(StatusCodes.Status201Created, new MessageResponse { message = "User created successfully" });
    }

    // POST /login
    [HttpPost("login")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status500InternalServerError)]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new MessageResponse { message = "Could not parse data." });
        }

        var (ok, success, error, status) = await _auth.LoginAsync(request, cancellationToken);
        if (!ok)
        {
            return StatusCode(status, error);
        }

        return Ok(success);
    }
}