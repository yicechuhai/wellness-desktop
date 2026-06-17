import { useState, useEffect, useCallback } from 'react';
const API_BASE = 'http://localhost:3001/api';

export function useAPI(path: string) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true); setError(null);
    fetch(API_BASE + path)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('API ' + r.status)))
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setIsLoading(false);
    return data;
  }, [path]);
  return { post, isLoading };
}
