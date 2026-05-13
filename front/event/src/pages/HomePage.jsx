import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as eventService from '../api/eventService.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  isCurrentUserEventCreator,
  normalizeEventList,
} from '../api/normalizeEvent.js';
import { formatDateTimeShort } from '../utils/dateFormat.js';

export function HomePage() {
  const { isAuthenticated, currentUserId } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await eventService.listEvents();
        if (!cancelled) setEvents(normalizeEventList(data));
      } catch (e) {
        if (!cancelled) {
          setError(e.message ?? 'Não foi possível carregar os eventos.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">Eventos</h1>
          <p className="text-secondary mb-0">
            Explore os eventos disponíveis e veja os detalhes.
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-secondary" role="status">
          Carregando…
        </div>
      )}
      {error && !loading && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {!loading && !error && events.length === 0 && (
        <div className="alert alert-secondary" role="status">
          Nenhum evento cadastrado no momento.
        </div>
      )}

      <div className="row g-4">
        {events.map((ev) => (
          <div className="col-12 col-md-6 col-xl-4" key={ev.id}>
            <div className="card h-100 bg-body-secondary border-secondary">
              <div className="card-body d-flex flex-column">
                <h2 className="card-title h5">{ev.name}</h2>
                <p className="card-text text-secondary small mb-2">
                  <span className="d-block">
                    <strong className="text-body">Data e hora:</strong>{' '}
                    {formatDateTimeShort(ev.dateTime)}
                  </span>
                  <span className="d-block mt-1">
                    <strong className="text-body">Local:</strong> {ev.location || '—'}
                  </span>
                </p>
                <div className="mt-auto pt-2 d-flex flex-wrap gap-2">
                  <Link
                    className="btn btn-primary btn-sm"
                    to={`/events/${encodeURIComponent(ev.id)}`}
                  >
                    Ver detalhes
                  </Link>
                  {isAuthenticated &&
                    isCurrentUserEventCreator(ev, currentUserId) && (
                    <Link
                      className="btn btn-outline-secondary btn-sm"
                      to={`/dashboard/${encodeURIComponent(ev.id)}`}
                    >
                      Editar
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
