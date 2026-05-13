using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RestApi.DTOs.Requests;
using RestApi.DTOs.Responses;
using RestApi.Services;

namespace RestApi.Controllers;

[ApiController]
[Route("events")]
public class EventsController : ControllerBase
{
    private readonly IEventService _events;

    public EventsController(IEventService events) => _events = events;

    private static bool TryParseId(string? id, out long value)
    {
        value = 0;
        return !string.IsNullOrEmpty(id) && long.TryParse(id, out value);
    }

    private long GetUserId()
    {
        var claim = User.FindFirst("userId")?.Value ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return long.TryParse(claim, out var id) ? id : 0;
    }

    // GET /events
    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetEvents(CancellationToken cancellationToken)
    {
        var (ok, data, error) = await _events.GetAllAsync(cancellationToken);
        if (!ok)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, error);
        }

        return Ok(data);
    }

    // GET /events/{id}
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetEvent(string id, CancellationToken cancellationToken)
    {
        if (!TryParseId(id, out var eventId))
        {
            return BadRequest(new MessageResponse { message = "Could not parse event id." });
        }

        var (ok, data, error) = await _events.GetByIdAsync(eventId, cancellationToken);
        if (!ok)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, error);
        }

        return Ok(data);
    }

    // POST /events
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreateEvent([FromBody] CreateEventRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new MessageResponse { message = "Could not parse data." });
        }

        var userId = GetUserId();
        var (ok, data, error) = await _events.CreateAsync(userId, request, cancellationToken);
        if (!ok)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, error);
        }

        return StatusCode(StatusCodes.Status201Created, data);
    }

    // PUT /events/{id}
    [HttpPut("{id}")]
    [Authorize]
    public async Task<IActionResult> UpdateEvent(string id, [FromBody] UpdateEventRequest request, CancellationToken cancellationToken)
    {
        if (!TryParseId(id, out var eventId))
        {
            return BadRequest(new MessageResponse { message = "Could not parse event id." });
        }

        if (!ModelState.IsValid)
        {
            return BadRequest(new MessageResponse { message = "Could not parse event id." });
        }

        var userId = GetUserId();
        var (ok, error, status) = await _events.UpdateAsync(userId, eventId, request, cancellationToken);
        if (!ok)
        {
            return StatusCode(status, error);
        }

        return StatusCode(status, error);
    }

    // DELETE /events/{id}
    [HttpDelete("{id}")]
    [Authorize]
    public async Task<IActionResult> DeleteEvent(string id, CancellationToken cancellationToken)
    {
        if (!TryParseId(id, out var eventId))
        {
            return BadRequest(new MessageResponse { message = "Could not parse event id." });
        }

        var userId = GetUserId();
        var (ok, error, status) = await _events.DeleteAsync(userId, eventId, cancellationToken);
        if (!ok)
        {
            return StatusCode(status, error);
        }

        return StatusCode(status, error);
    }

    // POST /events/{id}/register
    [HttpPost("{id}/register")]
    [Authorize]
    public async Task<IActionResult> RegisterForEvent(string id, CancellationToken cancellationToken)
    {
        if (!TryParseId(id, out var eventId))
        {
            return BadRequest(new MessageResponse { message = "Could not parse event id." });
        }

        var userId = GetUserId();
        var (ok, error) = await _events.RegisterAsync(userId, eventId, cancellationToken);
        if (!ok)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, error);
        }

        return StatusCode(StatusCodes.Status201Created, new MessageResponse { message = "Registered." });
    }

    // DELETE /events/{id}/register
    [HttpDelete("{id}/register")]
    [Authorize]
    public async Task<IActionResult> CancelRegistration(string id, CancellationToken cancellationToken)
    {
        if (!TryParseId(id, out var eventId))
        {
            return BadRequest(new MessageResponse { message = "Could not parse event id." });
        }

        var userId = GetUserId();
        var (ok, error) = await _events.CancelRegistrationAsync(userId, eventId, cancellationToken);
        if (!ok)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, error);
        }

        return Ok(new MessageResponse { message = "Registration cancelled." });
    }
}