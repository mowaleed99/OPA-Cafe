import { useState, useEffect, useCallback } from 'react';
import { authRepository } from '../../../infrastructure/repositories/index';
import { AppUser } from '../../../domain/entities/user';

export function useCashiers(cafeId: string | null) {
  const [cashiers, setCashiers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCashiers = useCallback(async () => {
    if (!cafeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await authRepository.getUsers(cafeId);
      // Ensure we don't show soft-deleted cashiers just in case, though the repo filters it.
      setCashiers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [cafeId]);

  useEffect(() => {
    fetchCashiers();
  }, [fetchCashiers]);

  return { cashiers, isLoading, error, refetch: fetchCashiers };
}
