import { useState } from 'react';
import { useSettingsStore } from '../../application/store/useSettingsStore';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Upload, Download, AlertCircle } from 'lucide-react';
import { db } from '../../infrastructure/database/db';
import { updateSettings } from '../../application/useCases/settings/manageSettings';
import { useAuthStore } from '../../application/store/useAuthStore';

export default function SettingsPage() {
  const cafeId = useAuthStore(state => state.cafeId());
  const { 
    language, cafeName, printPaperSize, 
    setLanguage, setCafeName, setPrintPaperSize 
  } = useSettingsStore();
  const { t } = useTranslation();
  
  // Backup & Restore state
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setMessage(null);
    try {
      const tables = db.tables.map(table => table.name);
      const data: Record<string, any[]> = {};
      for (const tableName of tables) {
        data[tableName] = await db.table(tableName).toArray();
      }
      const jsonString = JSON.stringify(data);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `opa-cafe-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Backup exported successfully.' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to export backup.' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    setMessage(null);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = event.target?.result as string;
        const data = JSON.parse(json);
        await db.transaction('rw', db.tables, async () => {
          for (const tableName of Object.keys(data)) {
            if (db.tables.find(t => t.name === tableName)) {
              await db.table(tableName).clear();
              await db.table(tableName).bulkAdd(data[tableName]);
            }
          }
        });
        setMessage({ type: 'success', text: 'Backup restored successfully. Please refresh the page.' });
      } catch (err) {
        console.error(err);
        setMessage({ type: 'error', text: 'Failed to restore backup. Invalid file format.' });
      } finally {
        setIsImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">{t('settings')}</h1>
      </div>

      <div className="space-y-6">
        <div className="bg-card border rounded-lg p-6 space-y-4 shadow-sm">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('language')}</label>
            <Select value={language} onValueChange={(val: 'ar'|'en') => {
              setLanguage(val);
              if (cafeId) updateSettings(cafeId, { language: val });
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">{t('arabic')}</SelectItem>
                <SelectItem value="en">{t('english')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('cafe_name')}</label>
            <Input 
              value={cafeName} 
              onChange={(e) => setCafeName(e.target.value)} 
              onBlur={() => {
                if (cafeId) updateSettings(cafeId, { cafe_name: cafeName });
              }}
              className="max-w-[400px]" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{t('print_paper_size')}</label>
            <Select value={printPaperSize} onValueChange={(val: 'A4'|'80mm'|'58mm') => {
              setPrintPaperSize(val);
              if (cafeId) updateSettings(cafeId, { print_paper_size: val });
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t('print_paper_size')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A4">A4 (Standard)</SelectItem>
                <SelectItem value="80mm">Thermal 80mm</SelectItem>
                <SelectItem value="58mm">Thermal 58mm</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t">
        <h2 className="text-xl font-display font-bold text-foreground mb-6">{t('backup_restore') || 'Backup & Restore'}</h2>
        
        {message && (
          <div className={`p-4 mb-6 rounded-md border ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {message.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="border rounded-xl p-6 bg-card shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Download className="text-blue-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold">{t('export_backup')}</h3>
            <p className="text-sm text-muted-foreground">{t('export_backup_desc')}</p>
            <Button onClick={handleExport} disabled={isExporting} className="w-full mt-4">
              {isExporting ? 'Exporting...' : 'Download Backup'}
            </Button>
          </div>

          <div className="border rounded-xl p-6 bg-card shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Upload className="text-amber-600" size={24} />
            </div>
            <h3 className="text-lg font-semibold">{t('restore_backup')}</h3>
            <p className="text-sm text-muted-foreground">{t('restore_backup_desc')}</p>
            
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 flex gap-2 items-start mt-4">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <p className="text-xs text-amber-800">{t('restore_warning')}</p>
            </div>

            <div className="relative w-full">
              <input 
                type="file" 
                accept=".json" 
                onChange={handleImport} 
                disabled={isImporting}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
              />
              <Button variant="outline" disabled={isImporting} className="w-full">
                {isImporting ? 'Restoring...' : 'Upload Backup File'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
