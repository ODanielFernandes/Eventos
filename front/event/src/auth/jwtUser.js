/**
 * Decodifica o payload do JWT (sem validar assinatura) para leitura de claims na UI.
 * O token continua só em memória; isso não substitui validação no servidor.
 */

const CLAIM_NAME_IDENTIFIER =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

export function decodeJwtPayload(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const segment = parts[1];
    const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * Identificador do usuário logado, alinhado ao que o backend costuma gravar em CreatedBy.
 */
export function getUserIdFromToken(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload !== 'object') return null;

  const id =
    payload[CLAIM_NAME_IDENTIFIER] ??
    payload.sub ??
    payload.userId ??
    payload.UserId ??
    payload.nameid ??
    payload.NameIdentifier ??
    payload.uid ??
    payload.Uid ??
    payload.id ??
    payload.Id;

  if (id == null) return null;
  return String(id);
}
