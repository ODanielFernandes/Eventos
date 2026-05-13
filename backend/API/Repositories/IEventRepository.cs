using RestApi.Models;

namespace RestApi.Repositories;

public interface IEventRepository
{
    Task<IReadOnlyList<Event>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Event?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task<Event> AddAsync(Event entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(Event entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(Event entity, CancellationToken cancellationToken = default);
}