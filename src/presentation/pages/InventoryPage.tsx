import { useState, useEffect } from 'react';
import { useAuthStore } from '../../application/store/useAuthStore';
import { getInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../application/useCases/inventory/manageInventory';
import type { InventoryItem } from '../../core/entities/inventory';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { PlusCircle, Search, Edit2, Trash2, Package, History, ArrowRightLeft } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import { useTranslation } from 'react-i18next';
import { StockAdjustmentModal } from '../features/inventory/StockAdjustmentModal';
import { StockHistoryModal } from '../features/inventory/StockHistoryModal';
import { useCurrency } from '../../application/utils/useCurrency';

export default function InventoryPage() {
  const cafeId = useAuthStore(s => s.cafeId());
  const { t } = useTranslation();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { currency, formatCurrency } = useCurrency();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({ name: '', unit: '', cost: '', stock_quantity: '', low_stock_threshold: '' });
  const [saving, setSaving] = useState(false);

  const [adjustingStockItem, setAdjustingStockItem] = useState<InventoryItem | null>(null);
  const [viewingHistoryItem, setViewingHistoryItem] = useState<InventoryItem | null>(null);

  const load = async () => {
    if (cafeId) {
      const data = await getInventoryItems(cafeId);
      setItems(data);
    }
  };

  useEffect(() => { load(); }, [cafeId]);

  const filtered = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleOpenModal = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        unit: item.unit,
        cost: item.cost.toString(),
        stock_quantity: item.stock_quantity.toString(),
        low_stock_threshold: item.low_stock_threshold?.toString() || '',
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', unit: '', cost: '', stock_quantity: '0', low_stock_threshold: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!cafeId || !formData.name || !formData.unit) return;
    setSaving(true);
    try {
      if (editingItem) {
        await updateInventoryItem({
          ...editingItem,
          name: formData.name,
          unit: formData.unit,
          cost: parseFloat(formData.cost) || 0,
          stock_quantity: parseFloat(formData.stock_quantity) || 0,
          low_stock_threshold: formData.low_stock_threshold ? parseFloat(formData.low_stock_threshold) : null,
        });
      } else {
        await addInventoryItem({
          cafe_id: cafeId,
          name: formData.name,
          unit: formData.unit,
          cost: parseFloat(formData.cost) || 0,
          stock_quantity: parseFloat(formData.stock_quantity) || 0,
          low_stock_threshold: formData.low_stock_threshold ? parseFloat(formData.low_stock_threshold) : null,
        });
      }
      await load();
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeletingItemId(id);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">{t('inventory')}</h1>
          <p className="text-muted-foreground mt-1">{t('manage_inventory_desc')}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('search_items')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" /> {t('add_item_btn')}
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('item_name')}</TableHead>
              <TableHead>{t('stock_level')}</TableHead>
              <TableHead>{t('unit')}</TableHead>
              <TableHead>{t('unit_cost')}</TableHead>
              <TableHead className="w-[100px]">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  {t('no_inventory_found')}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className={`font-semibold ${item.low_stock_threshold && item.stock_quantity <= item.low_stock_threshold ? 'text-red-500' : 'text-emerald-600'}`}>
                        {item.stock_quantity}
                      </span>
                      {item.low_stock_threshold != null && (
                        <span className="text-xs text-muted-foreground">Min: {item.low_stock_threshold}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{formatCurrency(item.cost)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setAdjustingStockItem(item)} title={t('adjust_stock')}>
                        <ArrowRightLeft className="h-4 w-4 text-amber-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setViewingHistoryItem(item)} title={t('stock_history')}>
                        <History className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)}>
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? t('edit_item') : t('add_item_btn')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">{t('name')}</label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Coffee Beans"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('stock_quantity')}</label>
                <Input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('unit')}</label>
                <Input
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  placeholder={t('example_unit')}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('unit_cost')} ({currency})</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={e => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">{t('low_stock_threshold')}</label>
                <Input
                  type="number"
                  value={formData.low_stock_threshold}
                  onChange={e => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                  placeholder={t('optional')}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>{t('cancel')}</Button>
            <Button onClick={handleSave} disabled={saving || !formData.name || !formData.unit}>
              {saving ? t('saving') : t('save_item')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={!!deletingItemId}
        onClose={() => setDeletingItemId(null)}
        onConfirm={async () => {
          if (deletingItemId) {
            await deleteInventoryItem(deletingItemId);
            setDeletingItemId(null);
            await load();
          }
        }}
        title={t('delete_item')}
        description={t('delete_item_confirm')}
      />

      <StockAdjustmentModal
        item={adjustingStockItem}
        cafeId={cafeId}
        onClose={() => setAdjustingStockItem(null)}
        onAdjusted={() => {
          setAdjustingStockItem(null);
          load();
        }}
      />

      <StockHistoryModal
        item={viewingHistoryItem}
        cafeId={cafeId}
        onClose={() => setViewingHistoryItem(null)}
      />
    </div>
  );
}
