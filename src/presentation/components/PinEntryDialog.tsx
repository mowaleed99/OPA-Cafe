import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Delete, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PinEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the entered PIN when the user submits */
  onSubmit: (pin: string) => void;
  isLoading?: boolean;
  error?: string | null;
  title?: string;
  description?: string;
}

const PAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'DEL'];
const MAX_PIN_LENGTH = 6;

export default function PinEntryDialog({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error,
  title,
  description,
}: PinEntryDialogProps) {
  const { t } = useTranslation();
  const [pin, setPin] = useState('');

  // Reset PIN whenever the dialog opens
  useEffect(() => {
    if (isOpen) setPin('');
  }, [isOpen]);

  // Handle physical keyboard input
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLoading) return;
      
      if (e.key >= '0' && e.key <= '9') {
        if (pin.length < MAX_PIN_LENGTH) {
          setPin(p => p + e.key);
        }
      } else if (e.key === 'Backspace') {
        setPin(p => p.slice(0, -1));
      } else if (e.key === 'Enter') {
        if (pin.length > 0) {
          onSubmit(pin);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, pin, onSubmit]);

  const handleKey = (key: string) => {
    if (isLoading) return;
    if (key === 'DEL') {
      setPin(p => p.slice(0, -1));
    } else if (key !== '' && pin.length < MAX_PIN_LENGTH) {
      setPin(p => p + key);
    }
  };

  const handleSubmit = () => {
    if (pin.length === 0 || isLoading) return;
    onSubmit(pin);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isLoading) onClose(); }}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader>
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck size={24} className="text-primary" />
            </div>
            <DialogTitle className="text-center">
              {title ?? t('owner_approval_required')}
            </DialogTitle>
            {description && (
              <p className="text-xs text-center text-muted-foreground">{description}</p>
            )}
          </div>
        </DialogHeader>

        {/* PIN Dots */}
        <div className="flex justify-center gap-3 my-2">
          {Array.from({ length: MAX_PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 transition-all duration-150 ${
                i < pin.length
                  ? 'bg-primary border-primary scale-110'
                  : 'border-muted-foreground/40'
              }`}
            />
          ))}
        </div>

        {/* Error message */}
        {error && (
          <p className="text-xs text-center text-destructive font-medium animate-pulse">
            {error}
          </p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 px-2">
          {PAD_KEYS.map((key, idx) => {
            if (key === '') {
              return <div key={idx} />;
            }
            if (key === 'DEL') {
              return (
                <button
                  key={idx}
                  onClick={() => handleKey('DEL')}
                  disabled={isLoading}
                  className="h-14 rounded-xl border border-border bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors disabled:opacity-40 active:scale-95"
                  aria-label="Backspace"
                >
                  <Delete size={18} className="text-muted-foreground" />
                </button>
              );
            }
            return (
              <button
                key={idx}
                onClick={() => handleKey(key)}
                disabled={isLoading || pin.length >= MAX_PIN_LENGTH}
                className="h-14 rounded-xl border border-border bg-card hover:bg-muted font-semibold text-xl text-foreground transition-all disabled:opacity-40 active:scale-95 shadow-sm"
              >
                {key}
              </button>
            );
          })}
        </div>

        <DialogFooter className="flex gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={pin.length === 0 || isLoading}
            className="flex-1"
          >
            {isLoading ? t('verifying') : t('confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
