import { useState, useEffect } from 'react';
import { createRepository } from '../../../infrastructure/repositories/RepositoryFactory';
import type { DiningTable } from '../../../domain/entities/table';

export function useTables(cafeId: string | null) {
  const [tables, setTables] = useState<DiningTable[]>([]);

  useEffect(() => {
    if (!cafeId) {
      setTables([]);
      return;
    }
    
    const repo = createRepository<DiningTable>('dining_tables');
    repo.findMany({ cafe_id: cafeId }).then(setTables).catch(console.error);

    // In a full implementation, we'd add listeners for DB changes here.
    // For now, we fetch once on mount or cafeId change.
    const interval = setInterval(() => {
      repo.findMany({ cafe_id: cafeId }).then(setTables).catch(console.error);
    }, 2000); // Poll for updates (temporary solution to replace useLiveQuery)

    return () => clearInterval(interval);
  }, [cafeId]);

  return tables;
}
