import { useState, useEffect, useCallback } from 'react';
const API_BASE = '/api';

function getHeaders(contentType = false): Record<string, string> {
  const token = localStorage.getItem('wellness_token');
  const h: Record<string, string> = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (contentType) h['Content-Type'] = 'application/json';
  return h;
}

export function useAPI(path: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true); setError(null);
    fetch(API_BASE + path, { headers: getHeaders() })
      .then(r => { if (r.status === 401) { localStorage.removeItem('wellness_token'); window.location.reload(); return Promise.reject(new Error('Session expired')); } return r.ok ? r.json() : Promise.reject(new Error('API ' + r.status)); })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [path]);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, isLoading, error, refetch };
}

export function useAPIMutation(path: string) {
  const [isLoading, setIsLoading] = useState(false);
  const post = useCallback(async (body: any) => {
    setIsLoading(true);
    const res = await fetch(API_BASE + path, {
      method: 'POST',
      headers: getHeaders(true),
      body: JSON.stringify(body),
    });
    if (res.status === 401) { localStorage.removeItem('wellness_token'); window.location.reload(); throw new Error('Session expired'); }
    const data = await res.json();
    setIsLoading(false);
    return data;
  }, [path]);
  return { post, isLoading };
}
