import { useSettingsStore } from '../store/useSettingsStore';
import { db } from '../../infrastructure/database/db';

export class AutoBackupService {
  private static timer: NodeJS.Timeout | null = null;

  public static initialize() {
    this.checkAndSchedule();
    
    // Listen to changes in settings to reschedule if needed
    useSettingsStore.subscribe((state, prevState) => {
      if (
        state.autoBackupEnabled !== prevState.autoBackupEnabled ||
        state.autoBackupFrequency !== prevState.autoBackupFrequency ||
        state.autoBackupTime !== prevState.autoBackupTime
      ) {
        this.checkAndSchedule();
      }
    });
  }

  private static checkAndSchedule() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    const { autoBackupEnabled } = useSettingsStore.getState();
    if (!autoBackupEnabled) return;

    // Check every hour to see if a backup is due
    this.timer = setInterval(() => {
      this.evaluateBackupTrigger();
    }, 60 * 60 * 1000); // every 1 hour

    // Also check immediately on load
    this.evaluateBackupTrigger();
  }

  private static evaluateBackupTrigger() {
    const state = useSettingsStore.getState();
    if (!state.autoBackupEnabled) return;

    const now = new Date();
    const currentTimeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Check if it's the right time (allow a 1-hour window since we check hourly)
    const targetHour = parseInt(state.autoBackupTime.split(':')[0]);
    if (now.getHours() !== targetHour) return;

    const lastBackup = state.lastBackupDate ? new Date(state.lastBackupDate) : null;
    
    let isDue = false;
    
    if (!lastBackup) {
      isDue = true;
    } else {
      const msSinceLastBackup = now.getTime() - lastBackup.getTime();
      const daysSinceLastBackup = msSinceLastBackup / (1000 * 60 * 60 * 24);

      if (state.autoBackupFrequency === 'daily' && daysSinceLastBackup >= 1) {
        isDue = true;
      } else if (state.autoBackupFrequency === 'weekly' && daysSinceLastBackup >= 7) {
        isDue = true;
      } else if (state.autoBackupFrequency === 'monthly' && daysSinceLastBackup >= 28) {
        isDue = true;
      }
    }

    if (isDue) {
      this.performBackup();
    }
  }

  private static async performBackup() {
    try {
      console.log('[AutoBackupService] Starting automatic backup...');
      
      const collections = [
        'app_users', 'categories', 'products', 'inventory_items', 'stock_movements',
        'dining_tables', 'orders', 'order_items', 'suppliers', 'purchases',
        'purchase_items', 'supplier_payments', 'daily_closings', 'daily_closing_items',
        'settings', 'sync_queue'
      ];

      const backupData: Record<string, any[]> = {};
      for (const table of collections) {
        // @ts-ignore
        backupData[table] = await db[table].toArray();
      }

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `opa-cafe-autobackup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Update last backup date
      useSettingsStore.setState({ lastBackupDate: new Date().toISOString() });
      console.log('[AutoBackupService] Automatic backup completed and downloaded.');

    } catch (err) {
      console.error('[AutoBackupService] Auto backup failed:', err);
    }
  }
}
