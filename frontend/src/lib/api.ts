import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken as string;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const accessToken = getAccessToken();
  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      const retry = await fetch(`${API_URL}${path}`, { ...options, headers });
      if (!retry.ok) {
        throw new Error(await retry.text());
      }
      return retry.json();
    }
  }
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json();
}

export async function apiFetchBlob(path: string, options: RequestInit = {}) {
  const accessToken = getAccessToken();
  const headers = new Headers(options.headers || {});
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.blob();
}
