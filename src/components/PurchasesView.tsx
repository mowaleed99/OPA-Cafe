import React, { useState } from 'react';
import { Purchase, Supplier, Product, PurchasePayment } from '../types';
import { ShoppingBag, FileText, Plus, Search, Calendar, Clipboard, UserCheck, Trash2, X, CreditCard, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface PurchasesProps {
  purchases: Purchase[];
  suppliers: Supplier[];
  products: Product[];
  currency: string;
  onAddPurchase: (purchase: Omit<Purchase, 'id' | 'supplierName'>) => void;
  onRecordPurchasePayment: (purchaseId: string, amount: number, date: string, notes?: string) => void;
}

export default function PurchasesView({
  purchases,
  suppliers,
  products,
  currency,
  onAddPurchase,
  onRecordPurchasePayment,
}: PurchasesProps) {
  // State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [supplierId, setSupplierId] = useState('');
  const [date, setDate] = useState('2026-07-06');
  const [initialAmountPaid, setInitialAmountPaid] = useState<number | ''>('');
  const [purchaseItems, setPurchaseItems] = useState<{ productName: string; quantity: number; unitPrice: number }[]>([
    { productName: '', quantity: 1, unitPrice: 0 },
  ]);

  // Expandable payment history state
  const [expandedHistories, setExpandedHistories] = useState<Record<string, boolean>>({});

  // Record Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payingPurchase, setPayingPurchase] = useState<Purchase | null>(null);
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payDate, setPayDate] = useState('2026-07-06');
  const [payNotes, setPayNotes] = useState('');

  const toggleHistory = (id: string) => {
    setExpandedHistories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddItemRow = () => {
    setPurchaseItems([...purchaseItems, { productName: '', quantity: 1, unitPrice: 0 }]);
  };

  const handleRemoveItemRow = (idx: number) => {
    setPurchaseItems(purchaseItems.filter((_, i) => i !== idx));
  };

  const handleItemFieldChange = (idx: number, field: string, value: any) => {
    setPurchaseItems((prev) => {
      const updated = [...prev];
      (updated[idx] as any)[field] = value;
      return updated;
    });
  };

  const handleProductSelection = (idx: number, prodName: string) => {
    const matched = products.find(p => p.name === prodName);
    const costPrice = matched ? matched.cost : 0;
    setPurchaseItems((prev) => {
      const updated = [...prev];
      updated[idx].productName = prodName;
      updated[idx].unitPrice = costPrice;
      return updated;
    });
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) return alert('Please select a supplier');
    if (purchaseItems.some(item => !item.productName.trim() || item.quantity <= 0 || item.unitPrice < 0)) {
      return alert('All item rows must contain valid name, quantity, and unit cost price.');
    }

    const totalInvoice = calculateTotal();
    const paidValue = initialAmountPaid === '' ? totalInvoice : Number(initialAmountPaid);

    if (paidValue < 0 || paidValue > totalInvoice) {
      return alert('Paid amount must be between 0 and the total invoice value.');
    }

    const payloadItems = purchaseItems.map(item => ({
      productName: item.productName,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      total: Number(item.quantity * item.unitPrice)
    }));

    // Settle payment state
    const remaining = totalInvoice - paidValue;
    const status = remaining === 0 ? 'Paid' : (paidValue > 0 ? 'Partial' : 'Unpaid');

    const paymentRecords: PurchasePayment[] = paidValue > 0 ? [
      {
        id: `pay-init-${Date.now()}`,
        date: new Date(date).toISOString(),
        amount: paidValue,
        notes: 'Initial invoice payment'
      }
    ] : [];

    onAddPurchase({
      supplierId,
      date: new Date(date).toISOString(),
      items: payloadItems,
      totalAmount: totalInvoice,
      amountPaid: paidValue,
      amountRemaining: remaining,
      paymentStatus: status,
      payments: paymentRecords
    });

    // Reset states
    setSupplierId('');
    setDate('2026-07-06');
    setInitialAmountPaid('');
    setPurchaseItems([{ productName: '', quantity: 1, unitPrice: 0 }]);
    setIsModalOpen(false);
  };

  const openPaymentModal = (p: Purchase) => {
    setPayingPurchase(p);
    setPayAmount(p.amountRemaining);
    setPayNotes('Payment toward outstanding balance');
    setPaymentModalOpen(true);
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingPurchase || payAmount === '') return;

    const amount = Number(payAmount);
    if (amount <= 0 || amount > payingPurchase.amountRemaining) {
      return alert(`Please enter a valid amount between 0 and ${currency}${payingPurchase.amountRemaining.toFixed(2)}`);
    }

    onRecordPurchasePayment(payingPurchase.id, amount, new Date(payDate).toISOString(), payNotes);

    setPaymentModalOpen(false);
    setPayingPurchase(null);
    setPayAmount('');
    setPayNotes('');
  };

  const filteredPurchases = purchases.filter(p =>
    p.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 dark:border-zinc-800 gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900 dark:text-zinc-100">
            Sourcing & Procurement Logs (Purchases)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Keep a clear ledger of costs of goods sold. Settle, document and log incoming shipments of coffee beans, milk, and bakery items. Track supplier balances in real time.
          </p>
        </div>

        <button
          onClick={() => {
            setSupplierId(suppliers[0]?.id || '');
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-brand-bean hover:bg-brand-bean/90 dark:bg-brand-latte dark:text-zinc-950 font-semibold text-xs rounded-xl text-white flex items-center justify-center gap-1.5 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Log Supplies Invoice
        </button>
      </div>

      {/* Search Input bar */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          type="text" 
          placeholder="Search purchases by supplier or raw goods name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-zinc-200 rounded-lg border border-gray-150 dark:border-zinc-800 outline-none focus:ring-1 focus:ring-brand-latte"
        />
      </div>

      {/* Purchases Feed table */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-gray-50/50 dark:bg-zinc-950/40 border-b border-gray-100 dark:border-zinc-850 flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-latte" />
          <h2 className="text-xs font-semibold uppercase tracking-wider font-display text-gray-900 dark:text-zinc-200">
            Inbound Sourcing Ledger ({purchases.length} invoices)
          </h2>
        </div>

        <div className="divide-y divide-gray-150 dark:divide-zinc-850">
          {filteredPurchases.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <span className="text-3xl">📦</span>
              <p className="text-xs font-semibold mt-2">No procurement invoice history logs found.</p>
            </div>
          ) : (
            filteredPurchases.map((p) => {
              const displayDate = new Date(p.date).toLocaleDateString();
              const displayTime = new Date(p.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isExpanded = !!expandedHistories[p.id];

              // Color classes for payment badges
              const badgeColors = {
                Paid: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
                Partial: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
                Unpaid: 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
              };

              return (
                <div key={p.id} className="p-5 hover:bg-gray-50/10 dark:hover:bg-zinc-950/10 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-gray-100 dark:border-zinc-800/60 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-gray-950 dark:text-zinc-100">
                          {p.supplierName}
                        </h3>
                        <span className={`text-[9px] px-2 py-0.5 font-bold uppercase rounded-md border ${badgeColors[p.paymentStatus || 'Paid']}`}>
                          {p.paymentStatus || 'Paid'}
                        </span>
                      </div>
                      <div className="flex gap-3 text-[10px] text-gray-400 dark:text-zinc-500 mt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {displayDate} @ {displayTime}
                        </span>
                        <span>Ref ID: {p.id}</span>
                      </div>
                    </div>

                    <div className="text-right sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-zinc-500 block">Total Invoiced</span>
                      <span className="text-sm font-bold font-mono text-gray-950 dark:text-zinc-100">
                        {currency}{p.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Items list breakdown in detailed grid */}
                  <div className="mt-3.5 space-y-1.5">
                    {p.items.map((item, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between text-[11px] font-mono text-gray-600 dark:text-zinc-400 bg-gray-50/50 dark:bg-zinc-950/50 p-2 rounded-md"
                      >
                        <span className="font-semibold text-gray-800 dark:text-zinc-300">
                          {item.productName}
                        </span>
                        <div className="flex gap-4">
                          <span>Qty: {item.quantity}</span>
                          <span>Unit: {currency}{item.unitPrice.toFixed(2)}</span>
                          <span className="font-semibold text-gray-950 dark:text-zinc-200">Total: {currency}{item.total.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Payment Ledger Detail Bar */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-gray-50/30 dark:bg-zinc-950/20 p-2.5 rounded-xl">
                    <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-gray-500 dark:text-zinc-400">
                      <span>Paid: <span className="font-bold text-emerald-600">{currency}{(p.amountPaid || p.totalAmount).toFixed(2)}</span></span>
                      <span>Remaining: <span className={`font-bold ${p.amountRemaining && p.amountRemaining > 0 ? 'text-red-500' : 'text-gray-400'}`}>{currency}{(p.amountRemaining || 0).toFixed(2)}</span></span>
                    </div>

                    <div className="flex gap-2">
                      {p.payments && p.payments.length > 0 && (
                        <button
                          onClick={() => toggleHistory(p.id)}
                          className="px-2.5 py-1 bg-white hover:bg-gray-55 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-gray-150 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          Payments History ({p.payments.length})
                        </button>
                      )}

                      {p.amountRemaining && p.amountRemaining > 0 ? (
                        <button
                          onClick={() => openPaymentModal(p)}
                          className="px-3 py-1 bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                        >
                          <CreditCard className="w-3 h-3" />
                          Record Payment
                        </button>
                      ) : (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          Fully Paid
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Payment installments ledger expansion */}
                  {isExpanded && p.payments && (
                    <div className="mt-3 bg-gray-50/50 dark:bg-zinc-950/40 p-3 rounded-xl border border-gray-100 dark:border-zinc-800/50 space-y-2 animate-scale-up">
                      <span className="text-[9px] uppercase font-bold tracking-wider text-gray-400 block mb-1">Installment Timeline Ledger</span>
                      <div className="space-y-1.5">
                        {p.payments.map((inst, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] font-mono border-b border-gray-100 dark:border-zinc-800/30 pb-1.5 last:border-b-0 last:pb-0">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 text-gray-800 dark:text-zinc-200">
                                <span className="font-semibold">{currency}{inst.amount.toFixed(2)}</span>
                                <span className="text-[10px] text-gray-400 font-normal">({new Date(inst.date).toLocaleDateString()})</span>
                              </div>
                              {inst.notes && <p className="text-[9px] text-gray-400 truncate max-w-sm font-sans">{inst.notes}</p>}
                            </div>
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-1.5 py-0.5 rounded-sm">Logged</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Sourcing Invoice Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 p-6 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] animate-scale-up">
            
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold font-display uppercase text-gray-950 dark:text-zinc-100">
                Log Supplies Sourcing Invoice
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Supplier Selection */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Select Supplier Vendor</label>
                <select
                  required
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none"
                >
                  <option value="">-- Choose Vendor Partner --</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Invoiced Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono"
                />
              </div>

              {/* Initial Paid Amount */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">
                  Amount Paid Initially ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={calculateTotal()}
                  placeholder={`Leave blank to pay full: ${currency}${calculateTotal().toFixed(2)}`}
                  value={initialAmountPaid}
                  onChange={(e) => setInitialAmountPaid(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono"
                />
                <span className="text-[10px] text-gray-400 mt-0.5 block">
                  Any outstanding remaining balance will be logged as credit debt owed to the supplier.
                </span>
              </div>

              {/* Items Table Forms row */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block">Items List</label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-[10px] text-brand-latte font-bold uppercase hover:underline"
                  >
                    + Add Item Row
                  </button>
                </div>

                <div className="space-y-3">
                  {purchaseItems.map((item, idx) => (
                    <div 
                      key={idx}
                      className="bg-gray-50/50 dark:bg-zinc-950/50 p-3 rounded-lg border border-gray-150 dark:border-zinc-850 flex flex-col gap-2.5 relative"
                    >
                      {/* Close button if row count > 1 */}
                      {purchaseItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItemRow(idx)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Product Name Autocomplete / input */}
                      <div>
                        <label className="text-[9px] uppercase font-bold text-gray-400 dark:text-zinc-500 block mb-0.5">Raw Goods Name</label>
                        <select
                          required
                          value={item.productName}
                          onChange={(e) => handleProductSelection(idx, e.target.value)}
                          className="w-full bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-zinc-200 p-1.5 rounded-md border border-gray-150 dark:border-zinc-800 outline-none"
                        >
                          <option value="">-- Choose Menu Offering to Restock --</option>
                          <option value="Custom Vendor Goods">Custom Vendor Raw Materials</option>
                          {products.map(p => (
                            <option key={p.id} value={p.name}>{p.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Qty and Unit price */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] uppercase font-bold text-gray-400 dark:text-zinc-500 block mb-0.5">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            required
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e) => handleItemFieldChange(idx, 'quantity', Number(e.target.value))}
                            placeholder="e.g. 5"
                            className="w-full bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-zinc-200 p-1.5 rounded-md border border-gray-150 dark:border-zinc-800 outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] uppercase font-bold text-gray-400 dark:text-zinc-500 block mb-0.5">Unit Cost ({currency})</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            required
                            value={item.unitPrice === 0 ? '' : item.unitPrice}
                            onChange={(e) => handleItemFieldChange(idx, 'unitPrice', Number(e.target.value))}
                            placeholder="e.g. 45.00"
                            className="w-full bg-white dark:bg-zinc-900 text-xs text-gray-900 dark:text-zinc-200 p-1.5 rounded-md border border-gray-150 dark:border-zinc-800 outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation footer */}
              <div className="p-3 bg-brand-beige/10 dark:bg-brand-bean/5 rounded-xl border border-brand-beige/25 dark:border-zinc-800 flex justify-between items-center text-xs">
                <span className="font-bold text-brand-bean dark:text-brand-latte">TOTAL OUTBOUND COST:</span>
                <span className="text-sm font-bold font-mono text-gray-950 dark:text-white">
                  {currency}{calculateTotal().toFixed(2)}
                </span>
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 dark:border-zinc-800 dark:text-zinc-400 rounded-xl text-xs font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 rounded-xl text-xs font-bold text-center"
                >
                  Confirm Sourcing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment installment Modal */}
      {paymentModalOpen && payingPurchase && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-150 dark:border-zinc-800 p-5 w-full max-w-sm shadow-xl animate-scale-up">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold uppercase tracking-wider font-display text-gray-950 dark:text-zinc-100">
                Record Supplier Payment
              </h3>
              <button 
                onClick={() => {
                  setPaymentModalOpen(false);
                  setPayingPurchase(null);
                }}
                className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-850 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Supplier Vendor</span>
                <p className="text-xs font-bold text-gray-900 dark:text-zinc-200">{payingPurchase.supplierName}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-gray-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-gray-100 dark:border-zinc-850 text-[11px] font-mono">
                <div>
                  <span className="text-gray-400 block font-sans">Total Owed</span>
                  <span className="font-bold text-gray-900 dark:text-zinc-100">{currency}{payingPurchase.totalAmount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-sans">Remaining Due</span>
                  <span className="font-bold text-red-500">{currency}{payingPurchase.amountRemaining.toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">
                  Payment Amount ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  max={payingPurchase.amountRemaining}
                  value={payAmount === '' ? '' : payAmount}
                  onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  required
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">
                  Notes / Memo (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bank transfer, Cash drawer payment"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentModalOpen(false);
                    setPayingPurchase(null);
                  }}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 dark:border-zinc-800 dark:text-zinc-400 rounded-xl text-xs font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-bean text-white dark:bg-brand-latte dark:text-zinc-950 rounded-xl text-xs font-bold text-center"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
