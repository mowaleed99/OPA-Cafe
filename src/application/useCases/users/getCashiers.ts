import { useState, useEffect } from 'react';
import { supabase } from '../../../infrastructure/api/supabase';

export interface CashierUser {
  id: string;
  role: string;
  cafe_id: string;
  name?: string | null;
  email?: string | null;
}

export function useCashiers(cafeId: string | null) {
  const [cashiers, setCashiers] = useState<CashierUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCashiers = async () => {
    if (!cafeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('cafe_id', cafeId);

      if (error) throw error;
      setCashiers(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCashiers();
  }, [cafeId]);

  return { cashiers, isLoading, error, refetch: fetchCashiers };
}
