import { apiFetch, apiFetchWithMeta } from './fetchWrapper.js';

export function listEvents() {
  return apiFetch('/events');
}

export function getEventById(id) {
  return apiFetch(`/events/${encodeURIComponent(id)}`);
}

/**
 * @returns {Promise<{ data: unknown; location: string | null }>}
 */
export async function createEvent(payload) {
  const { data, headers } = await apiFetchWithMeta('/events', {
    method: 'POST',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
  const location =
    headers.get('Location') ?? headers.get('location') ?? null;
  return { data, location };
}

export function updateEvent(id, payload) {
  return apiFetch(`/events/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
    requireAuth: true,
  });
}

export function deleteEvent(id) {
  return apiFetch(`/events/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    requireAuth: true,
  });
}

export function registerForEvent(id) {
  return apiFetch(`/events/${encodeURIComponent(id)}/register`, {
    method: 'POST',
    requireAuth: true,
  });
}

export function unregisterFromEvent(id) {
  return apiFetch(`/events/${encodeURIComponent(id)}/register`, {
    method: 'DELETE',
    requireAuth: true,
  });
}
