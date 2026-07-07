import { useState, useEffect } from 'react';
import { useAuthStore } from '../../application/store/useAuthStore';
import { getInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../application/useCases/inventory/manageInventory';
import type { InventoryItem } from '../../core/entities/inventory';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { PlusCircle, Search, Edit2, Trash2, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function InventoryPage() {
  const cafeId = useAuthStore(s => s.cafeId());
  const { t } = useTranslation();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState({ name: '', unit: '', cost: '', stock_quantity: '' });
  const [saving, setSaving] = useState(false);

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
        stock_quantity: item.stock_quantity.toString()
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', unit: '', cost: '', stock_quantity: '0' });
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
        });
      } else {
        await addInventoryItem({
          cafe_id: cafeId,
          name: formData.name,
          unit: formData.unit,
          cost: parseFloat(formData.cost) || 0,
          stock_quantity: parseFloat(formData.stock_quantity) || 0,
        });
      }
      await load();
      setIsModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      await deleteInventoryItem(id);
      await load();
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage your raw materials and stock levels.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm w-60 focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  No inventory items found. Add some to get started.
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
                    <span className={`font-semibold ${item.stock_quantity <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {item.stock_quantity}
                    </span>
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.cost.toFixed(2)} EGP</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
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
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Coffee Beans"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Stock Quantity</label>
                <Input
                  type="number"
                  value={formData.stock_quantity}
                  onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Unit</label>
                <Input
                  value={formData.unit}
                  onChange={e => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="e.g. kg, L, pcs"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Unit Cost (EGP)</label>
              <Input
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={e => setFormData({ ...formData, cost: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !formData.name || !formData.unit}>
              {saving ? 'Saving...' : 'Save Item'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
