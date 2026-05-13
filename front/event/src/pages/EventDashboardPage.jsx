import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as eventService from '../api/eventService.js';
import {
  extractEventIdFromLocation,
  isCurrentUserEventCreator,
  normalizeEvent,
} from '../api/normalizeEvent.js';
import { useAuth } from '../context/AuthContext.jsx';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../utils/dateFormat.js';

const emptyForm = {
  name: '',
  description: '',
  location: '',
  dateTimeLocal: '',
};

export function EventDashboardPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { currentUserId } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isEdit) {
      setForm(emptyForm);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const raw = await eventService.getEventById(id);
        const ev = normalizeEvent(raw);
        if (!cancelled && ev) {
          if (!isCurrentUserEventCreator(ev, currentUserId)) {
            window.alert(
              'Apenas quem criou o evento pode editá-lo ou excluí-lo.',
            );
            navigate(`/events/${encodeURIComponent(id)}`, { replace: true });
            return;
          }
          setForm({
            name: ev.name,
            description: ev.description,
            location: ev.location,
            dateTimeLocal: toDatetimeLocalValue(ev.dateTime),
          });
        } else if (!cancelled && !ev) {
          window.alert('Não foi possível interpretar os dados do evento.');
          navigate('/dashboard', { replace: true });
        }
      } catch (e) {
        if (!cancelled) {
          window.alert(e.message ?? 'Não foi possível carregar o evento.');
          navigate('/dashboard', { replace: true });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isEdit, navigate, currentUserId]);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const { name, description, location, dateTimeLocal } = form;
    if (!name.trim() || !location.trim() || !dateTimeLocal) {
      window.alert('Preencha nome, local e data/hora.');
      return;
    }
    const dateTime = fromDatetimeLocalValue(dateTimeLocal);
    if (!dateTime) {
      window.alert('Data/hora inválida.');
      return;
    }
    const payload = {
      name: name.trim(),
      description: description.trim(),
      location: location.trim(),
      dateTime,
    };
    setSaving(true);
    try {
      if (isEdit) {
        await eventService.updateEvent(id, payload);
        window.alert('Evento atualizado.');
      } else {
        const { data: created, location } =
          await eventService.createEvent(payload);
        const ev = normalizeEvent(created);
        const fromHeader = extractEventIdFromLocation(location);
        const newId =
          ev?.id != null ? String(ev.id) : fromHeader != null ? fromHeader : null;

        if (newId) {
          navigate(`/dashboard/${encodeURIComponent(newId)}`, {
            replace: true,
          });
        } else {
          window.alert(
            'Evento criado. Se precisar editar, use "Editar" no cartão do evento na página inicial.',
          );
          navigate('/', { replace: true });
        }
      }
    } catch (err) {
      window.alert(err.message ?? 'Erro ao salvar o evento.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!isEdit) return;
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
    setDeleting(true);
    try {
      await eventService.deleteEvent(id);
      window.alert('Evento excluído.');
      navigate('/', { replace: true });
    } catch (err) {
      window.alert(err.message ?? 'Erro ao excluir o evento.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <h1 className="h3 mb-0">
          {isEdit ? 'Editar evento' : 'Novo evento'}
        </h1>
        <Link to="/" className="btn btn-outline-secondary btn-sm">
          Ver feed
        </Link>
      </div>

      {loading && <p className="text-secondary">Carregando…</p>}

      {!loading && (
        <form
          className="card bg-body-secondary border-secondary"
          onSubmit={handleSubmit}
        >
          <div className="card-body">
            <div className="mb-3">
              <label htmlFor="ev-name" className="form-label">
                Nome
              </label>
              <input
                id="ev-name"
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="ev-desc" className="form-label">
                Descrição
              </label>
              <textarea
                id="ev-desc"
                className="form-control"
                rows={5}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="ev-loc" className="form-label">
                Local
              </label>
              <input
                id="ev-loc"
                type="text"
                className="form-control"
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="ev-dt" className="form-label">
                Data e hora
              </label>
              <input
                id="ev-dt"
                type="datetime-local"
                className="form-control"
                value={form.dateTimeLocal}
                onChange={(e) => updateField('dateTimeLocal', e.target.value)}
                required
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving || deleting}
              >
                {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar evento'}
              </button>
              {isEdit && (
                <button
                  type="button"
                  className="btn btn-outline-danger"
                  disabled={saving || deleting}
                  onClick={handleDelete}
                >
                  {deleting ? 'Excluindo…' : 'Excluir evento'}
                </button>
              )}
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
