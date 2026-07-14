import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { useTranslation } from 'react-i18next';
import { getStockMovements } from '../../../application/useCases/inventory/manageStockMovements';
import type { InventoryItem } from '../../../domain/entities/inventory';
import type { StockMovement } from '../../../domain/entities/stock_movement';
import { TrendingUp, TrendingDown, RefreshCcw } from 'lucide-react';

interface StockHistoryModalProps {
  item: InventoryItem | null;
  cafeId: string | null;
  onClose: () => void;
}

export function StockHistoryModal({ item, cafeId, onClose }: StockHistoryModalProps) {
  const { t } = useTranslation();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (item && cafeId) {
      setLoading(true);
      getStockMovements(cafeId, item.id).then(data => {
        setMovements(data);
        setLoading(false);
      });
    }
  }, [item, cafeId]);

  if (!item) return null;

  return (
    <Dialog open={!!item} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{t('stock_history_for')} {item.name}</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto flex-1 mt-4">
          {loading ? (
            <div className="py-10 text-center text-muted-foreground">{t('loading')}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead>{t('quantity')}</TableHead>
                  <TableHead>{t('reason')}</TableHead>
                  <TableHead>{t('by')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      {t('no_movements_found')}
                    </TableCell>
                  </TableRow>
                ) : (
                  movements.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(m.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {m.type === 'in' ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : 
                           m.type === 'out' ? <TrendingDown className="h-4 w-4 text-red-500" /> :
                           <RefreshCcw className="h-4 w-4 text-blue-500" />}
                          <span className="capitalize">{m.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {m.type === 'out' ? '-' : '+'}{m.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{m.reason || '-'}</TableCell>
                      <TableCell>{m.created_by}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
