import { IRepository } from '../../domain/repositories/IRepository';
import { BaseElectronRepository } from './BaseElectronRepository';
import { BaseWebRepository } from './BaseWebRepository';

export function createRepository<T>(tableName: string): IRepository<T> {
  if (typeof window !== 'undefined' && window.electronAPI) {
    return new BaseElectronRepository<T>(tableName);
  }
  return new BaseWebRepository<T>(tableName);
}
