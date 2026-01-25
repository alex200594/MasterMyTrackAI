import { useQuery } from '@tanstack/react-query';
import { apiFetch } from './api';
import { clearTokens } from './storage';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => apiFetch('/api/auth/me'),
    retry: false
  });
}

export function logout() {
  clearTokens();
}
