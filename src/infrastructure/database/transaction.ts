export type TransactionOperation = 
  | { type: 'insert'; table: string; data: any }
  | { type: 'update'; table: string; id: string; data: any }
  | { type: 'delete'; table: string; id: string }
  | { type: 'insertMany'; table: string; data: any[] };

export async function executeTransaction(operations: TransactionOperation[]): Promise<void> {
  if (typeof window !== 'undefined' && window.electronAPI) {
    await window.electronAPI.db.transaction(operations);
  } else {
    // Fallback for web/dexie if needed, though we're focusing on Electron
    throw new Error('Transactions are only supported in Electron environment via IPC.');
  }
}
