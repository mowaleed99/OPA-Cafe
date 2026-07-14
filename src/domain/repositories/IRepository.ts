export interface IRepository<T> {
  findMany(where?: Partial<T>): Promise<T[]>;
  findOne(id: string): Promise<T | null>;
  insert(data: T): Promise<void>;
  insertMany(data: T[]): Promise<void>;
  update(id: string, data: Partial<T>): Promise<void>;
  delete(id: string): Promise<void>;
}
