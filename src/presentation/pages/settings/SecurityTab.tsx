import React from 'react';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { SectionCard } from './SettingsShared';

interface SecurityTabProps {
  pinSet: boolean | null;
  pinSaveMsg: { type: 'success' | 'error'; text: string } | null;
  newPin: string;
  setNewPin: (val: string) => void;
  confirmPin: string;
  setConfirmPin: (val: string) => void;
  savingPin: boolean;
  handleSavePin: () => Promise<void>;
  handleClearPin: () => Promise<void>;
}

export function SecurityTab({
  pinSet,
  pinSaveMsg,
  newPin,
  setNewPin,
  confirmPin,
  setConfirmPin,
  savingPin,
  handleSavePin,
  handleClearPin,
}: SecurityTabProps) {
  const { t } = useTranslation();

  return (
    <SectionCard title={t('owner_approval_pin')} icon={Lock}>
      <div className="py-5 space-y-5">
        {/* Current status */}
        <div className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
          pinSet
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
            : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400'
        }`}>
          {pinSet ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
          <span>{pinSet === null ? t('loading') : pinSet ? t('pin_is_set') : t('no_pin_set_warning')}</span>
        </div>

        {/* PIN result message */}
        {pinSaveMsg && (
          <div className={`flex items-center gap-2 p-3 rounded-lg text-sm border ${
            pinSaveMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400'
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400'
          }`}>
            {pinSaveMsg.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {pinSaveMsg.text}
          </div>
        )}

        {/* Set/Change PIN form */}
        <div className="space-y-3">
          <p className="text-sm font-semibold text-foreground">{pinSet ? t('change_owner_pin') : t('set_owner_pin')}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{t('owner_pin_help')}</p>
          <div className="flex flex-col gap-2 max-w-xs">
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder={t('new_pin_placeholder')}
              value={newPin}
              onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
            />
            <Input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder={t('confirm_pin_placeholder')}
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
            />
            <Button onClick={handleSavePin} disabled={savingPin || !newPin} className="w-full">
              {savingPin ? t('saving') : t('save_pin')}
            </Button>
          </div>
        </div>

        {/* Clear PIN */}
        {pinSet && (
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-foreground mb-1">{t('remove_pin')}</p>
            <p className="text-xs text-muted-foreground mb-3">{t('remove_pin_desc')}</p>
            <Button
              variant="outline"
              onClick={handleClearPin}
              disabled={savingPin}
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/30"
            >
              {t('remove_pin')}
            </Button>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
