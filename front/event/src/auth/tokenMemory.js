/**
 * Armazena o JWT apenas em memória (closure), fora de storage persistente.
 * O AuthContext sincroniza este valor após login e limpa no logout.
 */

let cachedToken = null;

export function getAuthToken() {
  return cachedToken;
}

export function setAuthToken(token) {
  cachedToken = typeof token === 'string' && token.length > 0 ? token : null;
}

export function clearAuthToken() {
  cachedToken = null;
}
