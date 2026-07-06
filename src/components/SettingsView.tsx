import React, { useState } from 'react';
import { CafeSettings } from '../types';
import { Settings, Save, RefreshCw, HelpCircle, Check, Database } from 'lucide-react';

interface SettingsProps {
  settings: CafeSettings;
  onSaveSettings: (settings: CafeSettings) => void;
  onResetDatabase: () => void;
}

export default function SettingsView({
  settings,
  onSaveSettings,
  onResetDatabase,
}: SettingsProps) {
  // State
  const [cafeName, setCafeName] = useState(settings.cafeName);
  const [currency, setCurrency] = useState(settings.currency);
  const [taxPercent, setTaxPercent] = useState(settings.taxPercent);
  const [receiptHeader, setReceiptHeader] = useState(settings.receiptHeader);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);
  const [paymentMethods, setPaymentMethods] = useState<string[]>(settings.paymentMethods);

  // Success indicator
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTogglePaymentMethod = (method: string) => {
    setPaymentMethods((prev) => {
      if (prev.includes(method)) {
        if (prev.length === 1) {
          alert('At least one payment settlement gateway must remain active.');
          return prev;
        }
        return prev.filter((m) => m !== method);
      } else {
        return [...prev, method];
      }
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cafeName.trim()) return alert('Cafe name is required');
    if (!currency.trim()) return alert('Currency symbol is required');

    onSaveSettings({
      cafeName: cafeName.trim(),
      currency: currency.trim(),
      taxPercent: Number(taxPercent),
      receiptHeader: receiptHeader.trim(),
      receiptFooter: receiptFooter.trim(),
      paymentMethods,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const triggerReset = () => {
    if (window.confirm('CRITICAL ACTION: Reset entire system state back to initial mock defaults? This clears custom sales, products, and credit tabs.')) {
      onResetDatabase();
      alert('System database state restored successfully!');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900 dark:text-zinc-100">
            System & Terminal Parameters
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Configure default retail options, regional taxes, currency indicators, and custom terminal receipts.
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="space-y-5 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-850 rounded-2xl p-5 shadow-xs">
        {/* Section 1: Branding and Localizations */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-zinc-850">
            <Settings className="w-4 h-4 text-brand-latte" />
            Terminal Branding & localization
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Cafe Store Name</label>
              <input
                type="text"
                required
                value={cafeName}
                onChange={(e) => setCafeName(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none focus:ring-1 focus:ring-brand-latte font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Currency Indicator</label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="e.g. $, LE, €"
                className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono text-center font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Local VAT/Sales Tax (%)</label>
              <input
                type="number"
                min="0"
                max="50"
                required
                value={taxPercent}
                onChange={(e) => setTaxPercent(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-zinc-950 text-xs text-gray-900 dark:text-zinc-200 p-2.5 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono"
              />
            </div>

            {/* Settle Gateways switches */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1.5">Enabled Settle Channels</label>
              <div className="flex flex-wrap gap-2">
                {['Cash', 'Visa', 'Instapay', 'Credit'].map((m) => {
                  const isActive = paymentMethods.includes(m);
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleTogglePaymentMethod(m)}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-md border flex items-center gap-1 transition-all ${
                        isActive
                          ? 'bg-brand-bean text-white border-brand-bean dark:bg-brand-latte dark:text-zinc-950 dark:border-brand-latte'
                          : 'bg-white border-gray-200 text-gray-400 dark:bg-zinc-900 dark:border-zinc-800'
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3" />}
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Thermal Receipts layout */}
        <div className="space-y-4 pt-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-zinc-850">
            Thermal Paper Receipt Layout
          </h2>

          <div>
            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Receipt Header (ASCII Logo / Info)</label>
            <textarea
              rows={3}
              value={receiptHeader}
              onChange={(e) => setReceiptHeader(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-950 text-[11px] text-gray-800 dark:text-zinc-300 p-3 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 uppercase block mb-1">Receipt Footer Message</label>
            <textarea
              rows={2}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-950 text-[11px] text-gray-800 dark:text-zinc-300 p-3 rounded-lg border border-gray-150 dark:border-zinc-850 outline-none font-mono"
            />
          </div>
        </div>

        {/* Submit Save row */}
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-zinc-800">
          <button
            type="submit"
            className="px-5 py-2.5 bg-brand-bean hover:bg-brand-bean/90 dark:bg-brand-latte dark:text-zinc-950 font-bold text-xs uppercase tracking-wider rounded-xl text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                Parameters Stored
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>

      {/* Section 3: Database Administration logs */}
      <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/40 p-5 rounded-2xl space-y-4">
        <div>
          <h2 className="text-xs font-bold text-red-900 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
            <Database className="w-4.5 h-4.5 text-red-600" />
            Hardware System Maintenance
          </h2>
          <p className="text-[11px] text-red-700 dark:text-red-400/80 mt-1 leading-normal">
            Resetting the local system database triggers memory wipe and loads defaults. Recommended only during terminal staging or staff developer testing.
          </p>
        </div>

        <button
          onClick={triggerReset}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Emergency Ledger Reset
        </button>
      </div>
    </div>
  );
}
