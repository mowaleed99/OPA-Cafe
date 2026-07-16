import React from 'react';
import { Cloud, Download, Upload, HardDrive, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../../application/store/useSettingsStore';
import { Button } from '../../components/ui/button';
import { SectionCard } from './SettingsShared';

interface BackupTabProps {
  backupMessage: { type: 'success' | 'error'; text: string } | null;
  isSyncingNow: boolean;
  handleSyncNow: () => Promise<void>;
  isExporting: boolean;
  handleExport: () => Promise<void>;
  isImporting: boolean;
  handleImport: () => Promise<void>;
  autoBackupEnabled: boolean;
  autoBackupFrequency: string;
  autoBackupTime: string;
  lastBackupDate: string | null;
}

export function BackupTab({
  backupMessage,
  isSyncingNow,
  handleSyncNow,
  isExporting,
  handleExport,
  isImporting,
  handleImport,
  autoBackupEnabled,
  autoBackupFrequency,
  autoBackupTime,
  lastBackupDate,
}: BackupTabProps) {
  const { t } = useTranslation();

  return (
    <>
      {backupMessage && (
        <div className={`flex items-center gap-3 p-4 rounded-lg border text-sm ${
          backupMessage.type === 'success'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800'
        }`}>
          <CheckCircle2 size={16} className="shrink-0" />
          {backupMessage.text}
        </div>
      )}
      <SectionCard title={t('cloud_sync', 'Cloud Synchronization')} icon={Cloud}>
        <div className="py-5 flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <Cloud size={22} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-foreground mb-1">{t('sync_now', 'Sync Now')}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              {t('sync_now_desc', 'Manually trigger background synchronization with the cloud server.')}
            </p>
            <Button onClick={handleSyncNow} disabled={isSyncingNow} className="flex items-center gap-2" variant="outline">
              <RefreshCw size={14} className={isSyncingNow ? "animate-spin" : ""} />
              {isSyncingNow ? t('syncing', 'Syncing...') : t('sync_now_btn', 'Sync Now')}
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t('export_section')} icon={Download}>
        <div className="py-5 flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Download size={22} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-foreground mb-1">{t('download_backup_title')}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              {t('export_desc')}
            </p>
            <Button onClick={handleExport} disabled={isExporting} className="flex items-center gap-2">
              <Download size={14} />
              {isExporting ? t('exporting') : t('export_backup_file')}
            </Button>
          </div>
        </div>
      </SectionCard>

      <SectionCard title={t('restore_section')} icon={Upload}>
        <div className="py-5 flex items-start gap-5">
          <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <Upload size={22} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-foreground mb-1">{t('restore_from_backup')}</h4>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              {t('restore_desc')}
            </p>
            <div className="flex items-start gap-2 p-3 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 mb-4">
              <AlertCircle size={13} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">{t('restore_caution')}</p>
            </div>
            <div className="relative inline-block">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <Button variant="outline" disabled={isImporting} className="flex items-center gap-2">
                <Upload size={14} />
                {isImporting ? t('restoring') : t('upload_backup_btn')}
              </Button>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* AUTO BACKUP CONFIG */}
      <SectionCard title={t('auto_backup_title', 'Automatic Backups')} icon={HardDrive}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm text-foreground">{t('enable_auto_backup', 'Enable Automatic Backups')}</h4>
              <p className="text-sm text-muted-foreground">{t('auto_backup_desc', 'Automatically download a backup file.')}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={autoBackupEnabled}
                onChange={(e) => useSettingsStore.setState({ autoBackupEnabled: e.target.checked })}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          {autoBackupEnabled && (
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('frequency', 'Frequency')}</label>
                <select 
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                  value={autoBackupFrequency}
                  onChange={(e: any) => useSettingsStore.setState({ autoBackupFrequency: e.target.value })}
                >
                  <option value="daily">{t('daily', 'Daily')}</option>
                  <option value="weekly">{t('weekly', 'Weekly')}</option>
                  <option value="monthly">{t('monthly', 'Monthly')}</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('time', 'Time')}</label>
                <input 
                  type="time" 
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                  value={autoBackupTime}
                  onChange={(e) => useSettingsStore.setState({ autoBackupTime: e.target.value })}
                />
              </div>
            </div>
          )}

          {lastBackupDate && (
            <p className="text-xs text-muted-foreground mt-2">
              {t('last_backup', 'Last backup:')} {new Date(lastBackupDate).toLocaleString()}
            </p>
          )}
        </div>
      </SectionCard>
    </>
  );
}
