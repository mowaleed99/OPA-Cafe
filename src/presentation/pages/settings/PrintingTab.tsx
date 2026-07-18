import React from 'react';
import { Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { SettingRow, SectionCard } from './SettingsShared';
import { updateSettings } from '../../../application/useCases/settings/manageSettings';

interface PrintingTabProps {
  cafeId: string | null;
  defaultPrinter: string;
  availablePrinters: { name: string; displayName: string; isDefault?: boolean }[];
  paperSize: string;
  autoPrintReceipts: boolean;
  receiptCopies: number;
  receiptTemplateConfig: any;
  reportDefaultOutput: string;
  setPrintSettings: (settings: any) => void;
}

export function PrintingTab({
  cafeId,
  defaultPrinter,
  availablePrinters,
  paperSize,
  autoPrintReceipts,
  receiptCopies,
  receiptTemplateConfig,
  reportDefaultOutput,
  setPrintSettings,
}: PrintingTabProps) {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('tab_printing')} icon={Printer}>
      <SettingRow 
        label={t('default_printer', 'Default Printer')} 
        description={t('default_printer_desc', 'Select the primary printer for receipts and reports.')}
      >
        <Select 
          value={defaultPrinter || ''} 
          onValueChange={(val) => {
            setPrintSettings({ defaultPrinter: val });
            if (cafeId) updateSettings(cafeId, { default_printer: val });
          }}
        >
          <SelectTrigger className="w-56 bg-background">
            <SelectValue placeholder={t('select_printer', 'Select a printer')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{t('none', 'None (Prompt)')}</SelectItem>
            {availablePrinters.map(p => (
              <SelectItem key={p.name} value={p.name}>
                {p.displayName} {p.isDefault ? '(Default)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow 
        label={t('paper_size', 'Paper Size')} 
        description={t('paper_size_desc', 'Select the paper width for your thermal printer.')}
      >
        <Select 
          value={paperSize || '80mm'} 
          onValueChange={(val: any) => {
            setPrintSettings({ paperSize: val });
            if (cafeId) updateSettings(cafeId, { paper_size: val });
          }}
        >
          <SelectTrigger className="w-48 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="80mm">80mm</SelectItem>
            <SelectItem value="58mm">58mm</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>

      <SettingRow 
        label={t('auto_print_receipts', 'Auto-Print Receipts')} 
        description={t('auto_print_receipts_desc', 'Automatically print a receipt when an order is paid.')}
      >
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer"
            checked={autoPrintReceipts}
            onChange={(e) => {
              setPrintSettings({ autoPrintReceipts: e.target.checked });
              if (cafeId) updateSettings(cafeId, { auto_print_receipts: e.target.checked });
            }}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </SettingRow>

      <SettingRow 
        label={t('receipt_copies', 'Receipt Copies')} 
        description={t('receipt_copies_desc', 'Number of copies to print per receipt.')}
      >
        <Input 
          type="number" 
          min={1} max={5}
          className="w-24 bg-background"
          value={receiptCopies || 1}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1;
            setPrintSettings({ receiptCopies: val });
            if (cafeId) updateSettings(cafeId, { receipt_copies: val });
          }}
        />
      </SettingRow>

      <SettingRow 
        label={t('receipt_footer_msg', 'Receipt Footer Message')} 
        description={t('receipt_footer_msg_desc', 'Message to display at the bottom of the receipt.')}
      >
        <Input 
          type="text" 
          className="w-64 bg-background"
          value={receiptTemplateConfig?.footerMessage || 'Thank you for your visit!'}
          onChange={(e) => {
            setPrintSettings({ receiptTemplateConfig: { ...receiptTemplateConfig, footerMessage: e.target.value } });
          }}
          onBlur={() => {
            if (cafeId) updateSettings(cafeId, { receipt_template_config: receiptTemplateConfig });
          }}
        />
      </SettingRow>

      <SettingRow 
        label={t('report_default_output', 'Report Default Output')} 
        description={t('report_default_output_desc', 'Default format when printing reports.')}
      >
        <Select 
          value={reportDefaultOutput || 'thermal'} 
          onValueChange={(val: any) => {
            setPrintSettings({ reportDefaultOutput: val });
            if (cafeId) updateSettings(cafeId, { report_default_output: val });
          }}
        >
          <SelectTrigger className="w-48 bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="thermal">{t('thermal_printer')}</SelectItem>
            <SelectItem value="pdf">{t('pdf_file')}</SelectItem>
          </SelectContent>
        </Select>
      </SettingRow>
    </SectionCard>
  );
}
