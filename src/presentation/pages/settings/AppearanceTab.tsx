import React from 'react';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SettingRow, SectionCard } from './SettingsShared';

interface AppearanceTabProps {
  theme: string;
  applyTheme: (th: 'light' | 'dark' | 'system') => void;
}

export function AppearanceTab({ theme, applyTheme }: AppearanceTabProps) {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('tab_appearance')} icon={Palette}>
      <SettingRow label={t('color_theme')} description={t('color_theme_desc')}>
        <div className="flex gap-2">
          {([
            { value: 'light',  icon: Sun,     labelKey: 'theme_light'  },
            { value: 'dark',   icon: Moon,    labelKey: 'theme_dark'   },
            { value: 'system', icon: Monitor, labelKey: 'theme_system' },
          ] as const).map(({ value, icon: Icon, labelKey }) => (
            <button
              key={value}
              onClick={() => applyTheme(value)}
              className={`flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                theme === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card text-muted-foreground hover:border-muted-foreground/40 hover:text-foreground'
              }`}
            >
              <Icon size={18} />
              {t(labelKey)}
            </button>
          ))}
        </div>
      </SettingRow>
      <SettingRow label={t('theme_preview')} description={t('theme_preview_desc')}>
        <div className={`w-52 rounded-lg border overflow-hidden text-xs ${theme === 'dark' ? 'bg-gray-900 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`}>
          <div className={`px-3 py-2 border-b flex items-center gap-2 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="ms-1 font-medium">OPA Cafe POS</span>
          </div>
          <div className="p-3 space-y-1.5">
            <div className={`h-2 rounded-full w-3/4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className={`h-2 rounded-full w-1/2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <div className="h-5 rounded mt-2 bg-primary/80 w-full" />
          </div>
        </div>
      </SettingRow>
    </SectionCard>
  );
}
