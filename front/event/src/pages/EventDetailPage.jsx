import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as eventService from '../api/eventService.js';
import { normalizeEvent, isCurrentUserEventCreator } from '../api/normalizeEvent.js';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDateTime } from '../utils/dateFormat.js';

export function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, currentUserId } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  /** null = usar só o que vier da API; true/false = mescla após inscrição/cancelamento */
  const [participationOverride, setParticipationOverride] = useState(null);

  useEffect(() => {
    setParticipationOverride(null);
  }, [id]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const raw = await eventService.getEventById(id);
      setEvent(normalizeEvent(raw));
    } catch (e) {
      setError(e.message ?? 'Evento não encontrado.');
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const userIsParticipating =
    participationOverride != null
      ? participationOverride
      : Boolean(event?.userIsRegistered);

  async function handleRegister() {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }
    setActionLoading(true);
    try {
      await eventService.registerForEvent(id);
      await load();
      setParticipationOverride(true);
      window.alert('Inscrição realizada com sucesso.');
    } catch (e) {
      window.alert(e.message ?? 'Não foi possível concluir a inscrição.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUnregister() {
    setActionLoading(true);
    try {
      await eventService.unregisterFromEvent(id);
      await load();
      setParticipationOverride(false);
      window.alert('Inscrição cancelada.');
    } catch (e) {
      window.alert(e.message ?? 'Não foi possível cancelar a inscrição.');
    } finally {
      setActionLoading(false);
    }
  }

  const canManageEvent =
    Boolean(event) && isCurrentUserEventCreator(event, currentUserId);

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
        <Link to="/" className="btn btn-outline-secondary btn-sm">
          ← Voltar aos eventos
        </Link>
        {isAuthenticated && canManageEvent && id && (
          <Link
            className="btn btn-outline-primary btn-sm"
            to={`/dashboard/${encodeURIComponent(id)}`}
          >
            Editar evento
          </Link>
        )}
      </div>

      {loading && <p className="text-secondary">Carregando…</p>}
      {error && !loading && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {event && !loading && (
        <div className="card bg-body-secondary border-secondary">
          <div className="card-body">
            <h1 className="card-title h3 mb-3">{event.name}</h1>
            <dl className="row mb-0">
              <dt className="col-sm-3">Data e hora</dt>
              <dd className="col-sm-9">{formatDateTime(event.dateTime)}</dd>
              <dt className="col-sm-3">Local</dt>
              <dd className="col-sm-9">{event.location || '—'}</dd>
              <dt className="col-sm-3">Descrição</dt>
              <dd className="col-sm-9" style={{ whiteSpace: 'pre-wrap' }}>
                {event.description || '—'}
              </dd>
            </dl>

            {isAuthenticated && (
              <div className="d-flex flex-wrap gap-2 mt-4">
                {!userIsParticipating ? (
                  <button
                    type="button"
                    className="btn btn-success"
                    disabled={actionLoading}
                    onClick={handleRegister}
                  >
                    {actionLoading ? 'Processando…' : 'Participar'}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline-warning"
                    disabled={actionLoading}
                    onClick={handleUnregister}
                  >
                    {actionLoading ? 'Processando…' : 'Cancelar participação'}
                  </button>
                )}
              </div>
            )}
            {!isAuthenticated && (
              <p className="text-secondary small mt-3 mb-0">
                <Link to="/login" state={{ from: `/events/${id}` }}>
                  Faça login
                </Link>{' '}
                para se inscrever neste evento.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
