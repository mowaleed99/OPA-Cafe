export interface IDatabaseDriver {
  findMany<T = any>(
    tableName: string,
    where?: Record<string, any>,
    options?: { orderBy?: { column: string; direction: 'asc' | 'desc' }; limit?: number; offset?: number }
  ): Promise<T[]>;
  findOne<T = any>(tableName: string, id: string): Promise<T | null>;
  insert<T = any>(tableName: string, data: T): Promise<void>;
  insertMany<T = any>(tableName: string, data: T[]): Promise<void>;
  update<T = any>(tableName: string, id: string, data: Partial<T>): Promise<void>;
  delete(tableName: string, id: string): Promise<void>;
}
