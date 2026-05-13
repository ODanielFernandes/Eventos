import { apiFetch } from './fetchWrapper.js';

export function login(payload) {
  return apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export function signup(payload) {
  return apiFetch('/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}
