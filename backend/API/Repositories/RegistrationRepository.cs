using RestApi.Data;
using RestApi.Models;

namespace RestApi.Repositories;

public class RegistrationRepository : IRegistrationRepository
{
    private readonly AppDbContext _db;

    public RegistrationRepository(AppDbContext db) => _db = db;

    public async Task AddAsync(Registration registration, CancellationToken cancellationToken = default)
    {
        _db.Registrations.Add(registration);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> DeleteAsync(long eventId, long userId, CancellationToken cancellationToken = default)
    {
        var rows = _db.Registrations.Where(r => r.EventId == eventId && r.UserId == userId);
        _db.Registrations.RemoveRange(rows);
        return await _db.SaveChangesAsync(cancellationToken);
    }
}