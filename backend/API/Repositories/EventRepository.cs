using Microsoft.EntityFrameworkCore;
using RestApi.Data;
using RestApi.Models;

namespace RestApi.Repositories;

public class EventRepository : IEventRepository
{
    private readonly AppDbContext _db;

    public EventRepository(AppDbContext db) => _db = db;

    public async Task<IReadOnlyList<Event>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _db.Events.AsNoTracking().OrderBy(e => e.Id).ToListAsync(cancellationToken);

    public Task<Event?> GetByIdAsync(long id, CancellationToken cancellationToken = default) =>
        _db.Events.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id, cancellationToken);

    public async Task<Event> AddAsync(Event entity, CancellationToken cancellationToken = default)
    {
        _db.Events.Add(entity);
        await _db.SaveChangesAsync(cancellationToken);
        return entity;
    }

    public async Task UpdateAsync(Event entity, CancellationToken cancellationToken = default)
    {
        _db.Events.Update(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Event entity, CancellationToken cancellationToken = default)
    {
        _db.Events.Remove(entity);
        await _db.SaveChangesAsync(cancellationToken);
    }
}