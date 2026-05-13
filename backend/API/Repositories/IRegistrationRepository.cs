using RestApi.Models;

namespace RestApi.Repositories;

public interface IRegistrationRepository
{
    Task AddAsync(Registration registration, CancellationToken cancellationToken = default);
    Task<int> DeleteAsync(long eventId, long userId, CancellationToken cancellationToken = default);
}