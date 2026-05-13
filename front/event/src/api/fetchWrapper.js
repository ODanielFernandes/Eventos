import { getAuthToken } from '../auth/tokenMemory.js';

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

if (import.meta.env.DEV && API_BASE) {
  console.warn(
    '[API] VITE_API_BASE_URL está definido: o browser chama outra origem e o backend precisa enviar CORS. Em desenvolvimento, apague VITE_API_BASE_URL e use só o proxy do Vite (VITE_DEV_PROXY_TARGET). Veja .env.example na raiz do projeto.',
  );
}

function resolveUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE) return p;
  return `${API_BASE}${p}`;
}

async function parseErrorMessage(response) {
  let fallback = `${response.status} ${response.statusText}`;
  try {
    const text = await response.text();
    if (!text) return fallback;
    try {
      const data = JSON.parse(text);
      if (typeof data === 'string') return data;
      return (
        data.message ??
        data.error ??
        data.title ??
        data.detail ??
        (Array.isArray(data.errors) ? data.errors.join(', ') : null) ??
        fallback
      );
    } catch {
      return text;
    }
  } catch {
    return fallback;
  }
}

async function readOkBody(response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  if (!text) return null;

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  return text;
}

/**
 * @param {string} path
 * @param {RequestInit & { skipAuth?: boolean; requireAuth?: boolean }} options
 */
async function request(path, options = {}) {
  const { skipAuth = false, requireAuth = false, headers, ...rest } = options;
  const token = getAuthToken();

  if (requireAuth && !token) {
    const err = new Error('É necessário estar autenticado para esta ação.');
    err.status = 401;
    throw err;
  }

  const mergedHeaders = new Headers(headers ?? {});

  if (!skipAuth && token) {
    mergedHeaders.set('Authorization', token);
  }

  if (
    rest.body != null &&
    !(rest.body instanceof FormData) &&
    !mergedHeaders.has('Content-Type')
  ) {
    mergedHeaders.set('Content-Type', 'application/json');
  }

  const response = await fetch(resolveUrl(path), {
    ...rest,
    headers: mergedHeaders,
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response);
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return response;
}

/**
 * @param {string} path
 * @param {RequestInit & { skipAuth?: boolean; requireAuth?: boolean }} options
 * @returns {Promise<unknown>}
 */
export async function apiFetch(path, options = {}) {
  const response = await request(path, options);
  return readOkBody(response);
}

/**
 * Igual ao apiFetch, mas expõe os headers da resposta (ex.: Location após POST).
 * @returns {Promise<{ data: unknown; headers: Headers }>}
 */
export async function apiFetchWithMeta(path, options = {}) {
  const response = await request(path, options);
  const data = await readOkBody(response);
  return { data, headers: response.headers };
}
