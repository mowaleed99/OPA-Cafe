import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../application/store/useAuthStore';
import { useTables } from '../../application/useCases/tables/getTables';
import { addTable, removeTable } from '../../application/useCases/tables/tableManagement';
import { Plus, Trash2, Users } from 'lucide-react';

export default function TablesPage() {
  const { t } = useTranslation();
  const { cafeId, isOwner } = useAuthStore();
  const currentCafeId = cafeId();
  const tables = useTables(currentCafeId);
  const navigate = useNavigate();
  const isOwnerUser = isOwner();

  const [isAdding, setIsAdding] = useState(false);
  const [newTableName, setNewTableName] = useState('');

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCafeId || !newTableName.trim()) return;
    
    await addTable(currentCafeId, newTableName.trim());
    setNewTableName('');
    setIsAdding(false);
  };

  const handleDeleteTable = async (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this table?')) {
      await removeTable(tableId);
    }
  };

  const handleTableClick = (tableId: string) => {
  const { t } = useTranslation();
    navigate(`/pos?table_id=${tableId}`);
  };

  return (
    <div className="h-full flex flex-col bg-muted/20">
      {/* Header */}
      <div className="flex-shrink-0 bg-background border-b border-border p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Users className="text-primary" size={28} />
            Dine-in Tables
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tables and active dine-in orders.
          </p>
        </div>
        
        {isOwnerUser && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
            Add Table
          </button>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {isAdding && (
          <form onSubmit={handleAddTable} className="mb-6 bg-background p-4 rounded-xl border border-border flex items-end gap-4 animate-in slide-in-from-top-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">{t('table_name')}</label>
              <input
                autoFocus
                required
                type="text"
                value={newTableName}
                onChange={e => setNewTableName(e.target.value)}
                placeholder="e.g., Table 1 or Patio A"
                className="w-full px-3 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium h-[38px]"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-muted text-muted-foreground rounded-xl text-sm font-medium h-[38px]"
            >
              Cancel
            </button>
          </form>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables?.map(table => {
            const isOccupied = table.status === 'occupied';
            return (
              <div
                key={table.id}
                onClick={() => handleTableClick(table.id)}
                className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-4 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isOccupied 
                    ? 'bg-red-50 border-red-200 text-red-900 shadow-[0_0_15px_rgba(239,68,68,0.1)]' 
                    : 'bg-background border-border text-foreground shadow-sm hover:border-primary/30 hover:bg-primary/5'
                }`}
              >
                {/* Delete button (Owner only) */}
                {isOwnerUser && !isOccupied && (
                  <button
                    onClick={(e) => handleDeleteTable(e, table.id)}
                    className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-full transition-colors opacity-0 group-hover:opacity-100 md:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className={`h-16 w-16 rounded-full mb-3 flex items-center justify-center ${
                  isOccupied ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'
                }`}>
                  <Users size={32} />
                </div>
                
                <h3 className="font-bold text-lg text-center truncate w-full">
                  {table.name_or_number}
                </h3>
                
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-2 ${
                  isOccupied ? 'bg-red-200 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {isOccupied ? 'Occupied' : 'Available'}
                </span>
              </div>
            );
          })}
          
          {tables?.length === 0 && !isAdding && (
            <div className="col-span-full py-20 text-center text-muted-foreground flex flex-col items-center">
              <Users size={48} className="mb-4 opacity-20" />
              <p>No tables configured yet.</p>
              {isOwnerUser && <p className="text-sm mt-1">Click "Add Table" to set up your floor plan.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
