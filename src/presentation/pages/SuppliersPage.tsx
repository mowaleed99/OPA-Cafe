import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { PlusCircle, Pencil, Trash2, Truck } from 'lucide-react';
import { ConfirmDialog } from '../components/ui/confirm-dialog';
import type { Supplier } from '../../core/entities/supplier';
import { useAuthStore } from '../../application/store/useAuthStore';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from '../../application/useCases/suppliers/manageSuppliers';

// ── Supplier Form Modal ───────────────────────────────────────────────────────
function SupplierModal({
  isOpen,
  onClose,
  supplierToEdit,
  onSaved,
}: {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit: Supplier | null;
  onSaved: () => void;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [saving, setSaving] = useState(false);
  const cafeId = useAuthStore(s => s.cafeId());

  useEffect(() => {
    setName(supplierToEdit?.name ?? '');
    setContact(supplierToEdit?.contact_info ?? '');
  }, [supplierToEdit, isOpen]);

  const handleSave = async () => {
    if (!name.trim() || !cafeId) return;
    setSaving(true);
    try {
      if (supplierToEdit) {
        await updateSupplier({ ...supplierToEdit, name, contact_info: contact || null });
      } else {
        await createSupplier(cafeId, name, contact);
      }
      onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplierToEdit ? 'Edit Supplier' : 'Add Supplier'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-1 block">{t('supplier_name')}</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Al Reef Coffee Co." autoFocus />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Contact Info (Optional)</label>
            <Input value={contact} onChange={e => setContact(e.target.value)} placeholder="Phone / Email / Address" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>{t('cancel')}</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim()}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function SuppliersPage() {
  const { t } = useTranslation();
  const cafeId = useAuthStore(s => s.cafeId());
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const load = async () => {
    if (!cafeId) return;
    setSuppliers(await getSuppliers(cafeId));
  };

  useEffect(() => { load(); }, [cafeId]);

  const handleEdit = (s: Supplier) => { setEditing(s); setModalOpen(true); };
  const handleAdd = () => { setEditing(null); setModalOpen(true); };
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

  const handleDelete = (s: Supplier) => {
    setDeletingSupplier(s);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Suppliers</h1>
          <p className="text-muted-foreground mt-1">{t('manage_suppliers_desc')}</p>
        </div>
        <Button onClick={handleAdd}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('name')}</TableHead>
              <TableHead>{t('contact_info')}</TableHead>
              <TableHead className="w-[100px]">{t('actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                  <Truck className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  No suppliers yet. Click "Add Supplier" to get started.
                </TableCell>
              </TableRow>
            ) : (
              suppliers.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.contact_info || '—'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(s)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SupplierModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        supplierToEdit={editing}
        onSaved={load}
      />

      <ConfirmDialog
        isOpen={!!deletingSupplier}
        onClose={() => setDeletingSupplier(null)}
        onConfirm={async () => {
          if (deletingSupplier) {
            await deleteSupplier(deletingSupplier);
            setDeletingSupplier(null);
            load();
          }
        }}
        title="Delete Supplier"
        description={`Delete supplier "${deletingSupplier?.name}"? This cannot be undone.`}
      />
    </div>
  );
}
