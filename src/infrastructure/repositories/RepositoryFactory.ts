import { IRepository } from '../../domain/repositories/IRepository';
import { BaseElectronRepository } from './BaseElectronRepository';

export function createRepository<T>(tableName: string): IRepository<T> {
  return new BaseElectronRepository<T>(tableName);
}
