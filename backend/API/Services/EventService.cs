using RestApi.DTOs.Requests;
using RestApi.DTOs.Responses;
using RestApi.Models;
using RestApi.Repositories;

namespace RestApi.Services;

public class EventService : IEventService
{
    private readonly IEventRepository _events;
    private readonly IRegistrationRepository _registrations;

    public EventService(IEventRepository events, IRegistrationRepository registrations)
    {
        _events = events;
        _registrations = registrations;
    }

    public async Task<(bool ok, IReadOnlyList<Event>? data, MessageResponse? error)> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        try
        {
            var list = await _events.GetAllAsync(cancellationToken);
            return (true, list, null);
        }
        catch
        {
            return (false, null, new MessageResponse { message = "Could not fetch events. Try again later" });
        }
    }

    public async Task<(bool ok, Event? data, MessageResponse? error)> GetByIdAsync(
        long id,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var ev = await _events.GetByIdAsync(id, cancellationToken);
            if (ev is null)
            {
                return (false, null, new MessageResponse { message = "Could not fetch event." });
            }

            return (true, ev, null);
        }
        catch
        {
            return (false, null, new MessageResponse { message = "Could not fetch event." });
        }
    }

    public async Task<(bool ok, CreateEventResponse? data, MessageResponse? error)> CreateAsync(
        long userId,
        CreateEventRequest request,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var entity = new Event
            {
                Name = request.Name,
                Description = request.Description,
                Location = request.Location,
                DateTime = request.DateTime,
                UserId = userId
            };

            var saved = await _events.AddAsync(entity, cancellationToken);
            return (true, new CreateEventResponse
            {
                message = "Event created!",
                @event = saved
            }, null);
        }
        catch
        {
            return (false, null, new MessageResponse { message = "Could not create event. Try again later" });
        }
    }

    public async Task<(bool ok, MessageResponse? error, int status)> UpdateAsync(
        long userId,
        long eventId,
        UpdateEventRequest request,
        CancellationToken cancellationToken = default)
    {
        var existing = await _events.GetByIdAsync(eventId, cancellationToken);
        if (existing is null)
        {
            return (false, new MessageResponse { message = "Could not fetch the event." }, StatusCodes.Status500InternalServerError);
        }

        if (existing.UserId != userId)
        {
            return (false, new MessageResponse { message = "Not authorized to update event." }, StatusCodes.Status401Unauthorized);
        }

        try
        {
            existing.Name = request.Name;
            existing.Description = request.Description;
            existing.Location = request.Location;
            existing.DateTime = request.DateTime;

            await _events.UpdateAsync(existing, cancellationToken);
            return (true, new MessageResponse { message = "Event updated succesfully." }, StatusCodes.Status200OK);
        }
        catch
        {
            return (false, new MessageResponse { message = "Could not update event." }, StatusCodes.Status400BadRequest);
        }
    }

    public async Task<(bool ok, MessageResponse? error, int status)> DeleteAsync(
        long userId,
        long eventId,
        CancellationToken cancellationToken = default)
    {
        var existing = await _events.GetByIdAsync(eventId, cancellationToken);
        if (existing is null)
        {
            return (false, new MessageResponse { message = "Could not fetch the event." }, StatusCodes.Status500InternalServerError);
        }

        if (existing.UserId != userId)
        {
            return (false, new MessageResponse { message = "Not authorized to delete event." }, StatusCodes.Status401Unauthorized);
        }

        try
        {
            await _events.DeleteAsync(existing, cancellationToken);
            return (true, new MessageResponse { message = "Event deleted succesfully." }, StatusCodes.Status200OK);
        }
        catch
        {
            return (false, new MessageResponse { message = "Could not delete the event." }, StatusCodes.Status500InternalServerError);
        }
    }

    public async Task<(bool ok, MessageResponse? error)> RegisterAsync(
        long userId,
        long eventId,
        CancellationToken cancellationToken = default)
    {
        var ev = await _events.GetByIdAsync(eventId, cancellationToken);
        if (ev is null)
        {
            return (false, new MessageResponse { message = "Could not fetch event." });
        }

        try
        {
            await _registrations.AddAsync(new Registration
            {
                EventId = ev.Id,
                UserId = userId
            }, cancellationToken);

            return (true, null);
        }
        catch
        {
            return (false, new MessageResponse { message = "Could not register for event." });
        }
    }

    public async Task<(bool ok, MessageResponse? error)> CancelRegistrationAsync(
        long userId,
        long eventId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _registrations.DeleteAsync(eventId, userId, cancellationToken);
            return (true, null);
        }
        catch
        {
            return (false, new MessageResponse { message = "Could not cancel registration for event." });
        }
    }
}