import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../../infrastructure/database/db';

export function useTables(cafeId: string | null) {
  return useLiveQuery(
    () => {
      if (!cafeId) return [];
      return db.dining_tables.where('cafe_id').equals(cafeId).toArray();
    },
    [cafeId],
    []
  );
}
