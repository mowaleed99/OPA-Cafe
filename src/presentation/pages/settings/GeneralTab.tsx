import React from 'react';
import { Store, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '../../../application/store/useSettingsStore';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { SettingRow, SectionCard } from './SettingsShared';

interface GeneralTabProps {
  cafeId: string | null;
  cafeName: string;
  setCafeName: (name: string) => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
  currency: string;
  setCurrency: (curr: string) => void;
}

export function GeneralTab({
  cafeId,
  cafeName,
  setCafeName,
  language,
  setLanguage,
  currency,
  setCurrency,
}: GeneralTabProps) {
  const { t } = useTranslation();
  const updateSettings = useSettingsStore(state => state.updateSettings);

  return (
    <>
      <SectionCard title={t('cafe_profile')} icon={Store}>
        <SettingRow label={t('cafe_name_label')} description={t('cafe_name_desc')}>
          <Input
            value={cafeName}
            onChange={(e) => setCafeName(e.target.value)}
            onBlur={() => { if (cafeId) updateSettings(cafeId, { cafe_name: cafeName }); }}
            className="w-52"
            placeholder={t('cafe_name')}
          />
        </SettingRow>
        <SettingRow label={t('cafe_id_label')} description={t('cafe_id_desc')}>
          <code className="text-xs bg-muted px-2.5 py-1.5 rounded font-mono text-muted-foreground border border-border">
            {cafeId ?? '…'}
          </code>
        </SettingRow>
      </SectionCard>

      <SectionCard title={t('localization')} icon={Globe}>
        <SettingRow label={t('language')} description={t('language_desc')}>
          <Select value={language} onValueChange={(val: 'ar' | 'en') => {
            setLanguage(val);
            if (cafeId) updateSettings(cafeId, { language: val });
          }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t('language')}>
                {language === 'ar' ? '🇸🇦 Arabic (العربية)' : '🇬🇧 English'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ar">{t('arabic')}</SelectItem>
              <SelectItem value="en">{t('english')}</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
        <SettingRow label={t('currency')} description={t('currency_desc')}>
          <Select value={currency} onValueChange={(val: string) => {
            setCurrency(val);
            if (cafeId) updateSettings(cafeId, { currency: val });
          }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder={t('currency')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EGP">EGP - Egyptian Pound</SelectItem>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
              <SelectItem value="AED">AED - UAE Dirham</SelectItem>
            </SelectContent>
          </Select>
        </SettingRow>
      </SectionCard>
    </>
  );
}
