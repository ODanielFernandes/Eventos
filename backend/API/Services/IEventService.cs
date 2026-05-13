using RestApi.DTOs.Requests;
using RestApi.DTOs.Responses;
using RestApi.Models;

namespace RestApi.Services;

public interface IEventService
{
    Task<(bool ok, IReadOnlyList<Event>? data, MessageResponse? error)> GetAllAsync(CancellationToken cancellationToken = default);
    Task<(bool ok, Event? data, MessageResponse? error)> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<(bool ok, CreateEventResponse? data, MessageResponse? error)> CreateAsync(long userId, CreateEventRequest request, CancellationToken cancellationToken = default);
    Task<(bool ok, MessageResponse? error, int status)> UpdateAsync(long userId, long eventId, UpdateEventRequest request, CancellationToken cancellationToken = default);
    Task<(bool ok, MessageResponse? error, int status)> DeleteAsync(long userId, long eventId, CancellationToken cancellationToken = default);
    Task<(bool ok, MessageResponse? error)> RegisterAsync(long userId, long eventId, CancellationToken cancellationToken = default);
    Task<(bool ok, MessageResponse? error)> CancelRegistrationAsync(long userId, long eventId, CancellationToken cancellationToken = default);
}