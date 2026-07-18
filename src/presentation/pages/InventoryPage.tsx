import { useState, useEffect } from 'react';
import { useAuthStore } from '../../application/store/useAuthStore';
import { getInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../application/useCases/inventory/manageInventory';
import type { InventoryItem } from '../../domain/entities/inventory';
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
import { PageLayout, PageHeader, PageContent } from '../components/ui/page-layout';

export default function InventoryPage() {
  const cafeId = useAuthStore(s => s.cafeId());
  const { t } = useTranslation();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { currency, formatCurrency } = useCurrency();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', unit: '', cost: '', stock_quantity: '', 
    cartons: '', loose_pieces: '',
    low_stock_threshold: '', minimum_stock: '', 
    is_countable: false, pieces_per_carton: '' 
  });
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
      let cartons = '0';
      let loose_pieces = '0';
      if (item.is_countable && item.pieces_per_carton) {
        cartons = Math.floor(item.stock_quantity / item.pieces_per_carton).toString();
        loose_pieces = (item.stock_quantity % item.pieces_per_carton).toString();
      }
      setFormData({
        name: item.name,
        unit: item.unit,
        cost: item.cost_per_unit.toString(),
        stock_quantity: item.stock_quantity.toString(),
        cartons,
        loose_pieces,
        low_stock_threshold: item.low_stock_threshold?.toString() || '',
        minimum_stock: item.minimum_stock?.toString() || '',
        is_countable: item.is_countable || false,
        pieces_per_carton: item.pieces_per_carton?.toString() || '',
      });
    } else {
      setEditingItem(null);
      setFormData({ 
        name: '', unit: '', cost: '', stock_quantity: '0', 
        cartons: '', loose_pieces: '',
        low_stock_threshold: '', minimum_stock: '', 
        is_countable: false, pieces_per_carton: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!cafeId || !formData.name || !formData.unit) return;
    setSaving(true);
    try {
      let finalQuantity = parseFloat(formData.stock_quantity) || 0;
      if (formData.is_countable) {
        const c = parseInt(formData.cartons) || 0;
        const ppc = parseInt(formData.pieces_per_carton) || 0;
        const lp = parseInt(formData.loose_pieces) || 0;
        finalQuantity = (c * ppc) + lp;
      }

      const payload = {
        name: formData.name,
        unit: formData.unit,
        cost_per_unit: parseFloat(formData.cost) || 0,
        stock_quantity: finalQuantity,
        low_stock_threshold: formData.low_stock_threshold ? parseFloat(formData.low_stock_threshold) : 0,
        minimum_stock: formData.minimum_stock ? parseInt(formData.minimum_stock, 10) : 0,
        is_countable: formData.is_countable,
        pieces_per_carton: formData.is_countable && formData.pieces_per_carton ? parseInt(formData.pieces_per_carton, 10) : 0,
      };

      if (editingItem) {
        await updateInventoryItem({
          ...editingItem,
          ...payload
        });
      } else {
        await addInventoryItem({
          cafe_id: cafeId,
          ...payload
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

  const headerActions = (
    <>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('search_items')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 w-60"
        />
      </div>
      <Button onClick={() => handleOpenModal()}>
        <PlusCircle className="mr-2 h-4 w-4" /> {t('add_item_btn')}
      </Button>
    </>
  );

  return (
    <PageLayout>
      <PageHeader 
        title={t('inventory')} 
        description={t('manage_inventory_desc')} 
        actions={headerActions}
      />
      <PageContent className="max-w-7xl mx-auto w-full">

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
                  <TableCell>{formatCurrency(item.cost_per_unit)}</TableCell>
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
            
            <div className="bg-muted/30 p-3 rounded-md border border-muted">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_countable}
                  onChange={e => setFormData({ ...formData, is_countable: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span className="text-sm font-medium">{t('is_countable_label')}</span>
              </label>
              {formData.is_countable && (
                <p className="text-xs text-muted-foreground mt-2 ml-6">{t('auto_filled_purchases_desc')}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-sm font-medium mb-1 block">{t('stock_quantity')}</label>
                {formData.is_countable ? (
                  <div className="flex gap-1 items-center flex-wrap">
                    <Input type="number" className="w-16" placeholder={t('cartons')} value={formData.cartons} onChange={e => setFormData({ ...formData, cartons: e.target.value })} min="0" title={t('cartons')} />
                    <span className="text-sm text-muted-foreground">×</span>
                    <Input type="number" className="w-16" placeholder={t('pcs_per_carton')} value={formData.pieces_per_carton} onChange={e => setFormData({ ...formData, pieces_per_carton: e.target.value })} min="1" title={t('pcs_per_carton')} />
                    <span className="text-sm text-muted-foreground">+</span>
                    <Input type="number" className="w-16" placeholder={t('loose_pcs')} value={formData.loose_pieces} onChange={e => setFormData({ ...formData, loose_pieces: e.target.value })} min="0" title={t('loose_pcs')} />
                    <span className="text-sm font-medium whitespace-nowrap ml-1">= {(parseInt(formData.cartons) || 0) * (parseInt(formData.pieces_per_carton) || 0) + (parseInt(formData.loose_pieces) || 0)}</span>
                  </div>
                ) : (
                  <Input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="0"
                  />
                )}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t('min_stock')}</label>
                <Input
                  type="number"
                  value={formData.minimum_stock}
                  onChange={e => setFormData({ ...formData, minimum_stock: e.target.value })}
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
          if (deletingItemId && cafeId) {
            try {
              await deleteInventoryItem(deletingItemId, cafeId);
              setDeletingItemId(null);
              await load();
            } catch (error: any) {
              alert(error.message);
            }
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
      </PageContent>
    </PageLayout>
  );
}
