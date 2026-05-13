function unwrapEntity(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const inner =
    raw.data ??
    raw.Data ??
    raw.value ??
    raw.Value ??
    raw.result ??
    raw.Result ??
    raw.event ??
    raw.Event;
  if (inner && typeof inner === 'object') {
    const hasId = inner.id != null || inner.Id != null;
    if (hasId) return inner;
  }
  return raw;
}

function coerceBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const s = v.toLowerCase();
    return s === 'true' || s === '1' || s === 'yes';
  }
  return Boolean(v);
}

function pickRegistered(raw) {
  if (!raw || typeof raw !== 'object') return false;

  const inner = unwrapEntity(raw);
  const candidates = inner && inner !== raw ? [raw, inner] : [raw];

  for (const obj of candidates) {
    const v =
      obj.userIsRegistered ??
      obj.UserIsRegistered ??
      obj.isUserRegistered ??
      obj.IsUserRegistered ??
      obj.isRegistered ??
      obj.IsRegistered ??
      obj.registered ??
      obj.Registered ??
      obj.currentUserIsRegistered ??
      obj.CurrentUserIsRegistered ??
      obj.isCurrentUserRegistered ??
      obj.IsCurrentUserRegistered ??
      obj.hasRegistered ??
      obj.HasRegistered ??
      obj.isAttending ??
      obj.IsAttending ??
      obj.attending ??
      obj.Attending;
    if (v !== undefined && v !== null) return coerceBool(v);
  }
  return false;
}

function pickCreatorFlag(raw) {
  if (!raw || typeof raw !== 'object') return undefined;
  const inner = unwrapEntity(raw);
  const candidates = inner && inner !== raw ? [raw, inner] : [raw];
  for (const obj of candidates) {
    const v =
      obj.isCreator ??
      obj.IsCreator ??
      obj.isOwner ??
      obj.IsOwner ??
      obj.isCreatedByCurrentUser ??
      obj.IsCreatedByCurrentUser ??
      obj.createdByCurrentUser ??
      obj.CreatedByCurrentUser ??
      obj.isOrganizer ??
      obj.IsOrganizer;
    if (v !== undefined && v !== null) return coerceBool(v);
  }
  return undefined;
}

function pickCreatorUserId(e) {
  if (!e || typeof e !== 'object') return null;
  const v =
    e.createdByUserId ??
    e.CreatedByUserId ??
    e.creatorUserId ??
    e.CreatorUserId ??
    e.ownerUserId ??
    e.OwnerUserId ??
    e.organizerUserId ??
    e.OrganizerUserId ??
    e.applicationUserId ??
    e.ApplicationUserId ??
    e.createdBy ??
    e.CreatedBy ??
    e.userId ??
    e.UserId;
  if (v === undefined || v === null || v === '') return null;
  return String(v);
}

/**
 * Indica se o usuário atual pode editar/excluir o evento (criador).
 * Usa flag explícita da API, se existir; senão compara creatorUserId ao id do JWT.
 */
export function isCurrentUserEventCreator(event, currentUserId) {
  if (!event) return false;
  if (typeof event.currentUserOwnsEvent === 'boolean') {
    return event.currentUserOwnsEvent;
  }
  if (!currentUserId) return false;
  if (!event.creatorUserId) return false;
  return String(event.creatorUserId) === String(currentUserId);
}

/**
 * Normaliza payload da API (camelCase ou PascalCase típico de C#).
 */
export function normalizeEvent(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const e = unwrapEntity(raw);
  if (!e || typeof e !== 'object') return null;
  const id = e.id ?? e.Id;
  if (id == null) return null;

  const creatorUserId = pickCreatorUserId(e);
  const creatorFlag = pickCreatorFlag(raw);

  return {
    id,
    name: e.name ?? e.Name ?? '',
    description: e.description ?? e.Description ?? '',
    location: e.location ?? e.Location ?? '',
    dateTime: e.dateTime ?? e.DateTime ?? e.date_time ?? '',
    userIsRegistered: pickRegistered(raw),
    creatorUserId,
    currentUserOwnsEvent:
      typeof creatorFlag === 'boolean' ? creatorFlag : undefined,
  };
}

function unwrapList(raw) {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'object') return [];
  return (
    raw.items ??
    raw.Items ??
    raw.data ??
    raw.Data ??
    raw.value ??
    raw.Value ??
    raw.results ??
    raw.Results ??
    raw.events ??
    raw.Events ??
    []
  );
}

export function normalizeEventList(data) {
  const list = unwrapList(data);
  if (!Array.isArray(list)) return [];
  return list.map(normalizeEvent).filter(Boolean);
}

/** Extrai id numérico ou GUID a partir do header Location. */
export function extractEventIdFromLocation(locationHeader) {
  if (!locationHeader) return null;
  const s = String(locationHeader).trim();
  const m = s.match(/\/events\/([^/?#]+)/i);
  return m ? decodeURIComponent(m[1]) : null;
}
