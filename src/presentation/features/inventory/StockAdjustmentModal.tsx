import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { useTranslation } from 'react-i18next';
import { adjustStock } from '../../../application/useCases/inventory/manageStockMovements';
import type { InventoryItem } from '../../../core/entities/inventory';

interface StockAdjustmentModalProps {
  item: InventoryItem | null;
  cafeId: string | null;
  onClose: () => void;
  onAdjusted: () => void;
}

export function StockAdjustmentModal({ item, cafeId, onClose, onAdjusted }: StockAdjustmentModalProps) {
  const { t } = useTranslation();
  const [type, setType] = useState<'in' | 'out' | 'adjustment'>('adjustment');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!item || !cafeId) return;
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0 && type !== 'adjustment') return;

    setLoading(true);
    try {
      await adjustStock(cafeId, item.id, type, qty, reason);
      onAdjusted();
    } catch (err) {
      console.error(err);
      alert(t('error_adjusting_stock'));
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('adjust_stock_for')} {item.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('current_stock')}</label>
              <div className="text-lg font-semibold">{item.stock_quantity} {item.unit}</div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('adjustment_type')}</label>
              <Select value={type} onValueChange={(val: any) => setType(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in">{t('stock_in')}</SelectItem>
                  <SelectItem value="out">{t('stock_out')}</SelectItem>
                  <SelectItem value="adjustment">{t('manual_count')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              {type === 'adjustment' ? t('new_total_quantity') : t('quantity_to_adjust')}
            </label>
            <Input
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">{t('reason_optional')}</label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('e_g_damaged_spilled')}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>{t('cancel')}</Button>
          <Button onClick={handleSave} disabled={loading || !quantity}>
            {loading ? t('saving') : t('save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
