import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, Button } from '../ui/Atoms';
import { ArrowDownRight, ArrowUpRight, Plus, Save, Trash2, ArrowRight } from 'lucide-react';
import { ACCOUNTS } from '../../constants';
import { TransactionType, AccountType, Transaction } from '../../types';

// --- Helper Formatter ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
};

export const BatchEntryView: React.FC = () => {
  const { addTransaction, getCategoryOptions } = useFinance();
  
  // Local state for the current row
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState<AccountType>('debit');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // History of added items in this session
  const [sessionEntries, setSessionEntries] = useState<Partial<Transaction>[]>([]);

  // Refs for focus management
  const descriptionRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  // Update categories when type changes
  const currentCategories = getCategoryOptions(type);

  useEffect(() => {
     // Reset category if not in new list
     if (!currentCategories.includes(category)) {
         setCategory(currentCategories[0] || '');
     }
  }, [type, currentCategories]);

  const handleSave = async () => {
    if (!amount || !description) return;

    const newTx = {
        amount: parseFloat(amount),
        description,
        category: type === 'transfer_to_savings' ? 'Ahorro' : category,
        date: new Date(date).toISOString(), // User selected date
        createdAt: new Date().toISOString(),
        type,
        accountId: type === 'transfer_to_savings' ? 'savings' : account,
    };

    await addTransaction(newTx);

    // Add to local session history for visual confirmation
    setSessionEntries([newTx, ...sessionEntries]);

    // UX: Clear specific fields but keep Context (Date, Type, Category, Account)
    // This allows rapid entry of similar items (e.g., supermarket, then pharmacy)
    setAmount('');
    setDescription('');
    
    // UX: Focus back on Description for the next item
    if (descriptionRef.current) {
        descriptionRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleSave();
    }
  };

  return (
    <div className="pb-24 md:pb-6 space-y-6 animate-fade-in">
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Carga Rápida</h1>
                <p className="text-sm text-slate-500">Ingresa múltiples movimientos tipo Excel</p>
            </div>
            <div className="text-xs text-slate-400 hidden sm:block">
                Usa <span className="font-bold border border-slate-300 rounded px-1">TAB</span> para navegar y <span className="font-bold border border-slate-300 rounded px-1">ENTER</span> para guardar
            </div>
        </div>

        {/* --- INPUT ROW (The "Excel" Grid) --- */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-brand-100 ring-1 ring-brand-50">
            <div className="grid grid-cols-2 md:grid-cols-12 gap-3 items-end">
                
                {/* 1. Date */}
                <div className="col-span-1 md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha</label>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={e => setDate(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                </div>

                {/* 2. Type */}
                <div className="col-span-1 md:col-span-2">
                     <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Tipo</label>
                     <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setType('expense')}
                            className={`flex-1 flex justify-center py-1.5 rounded text-xs font-bold transition-all ${type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-400'}`}
                        >
                            <ArrowUpRight size={14} />
                        </button>
                        <button 
                            onClick={() => setType('income')}
                            className={`flex-1 flex justify-center py-1.5 rounded text-xs font-bold transition-all ${type === 'income' ? 'bg-white text-green-500 shadow-sm' : 'text-slate-400'}`}
                        >
                            <ArrowDownRight size={14} />
                        </button>
                     </div>
                </div>

                {/* 3. Account */}
                <div className="col-span-2 md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cuenta</label>
                    <select 
                        value={account} 
                        onChange={e => setAccount(e.target.value as AccountType)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                        {ACCOUNTS.map(acc => <option key={acc.id} value={acc.id}>{acc.label}</option>)}
                    </select>
                </div>

                 {/* 4. Category */}
                 <div className="col-span-2 md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Categoría</label>
                    <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    >
                        {currentCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                {/* 5. Description */}
                <div className="col-span-2 md:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Descripción</label>
                    <input 
                        ref={descriptionRef}
                        type="text" 
                        placeholder="Detalle..." 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                    />
                </div>

                {/* 6. Amount & Action */}
                <div className="col-span-2 md:col-span-2 flex gap-2">
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Monto</label>
                        <input 
                            ref={amountRef}
                            type="number" 
                            placeholder="0" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                            onKeyDown={handleKeyDown}
                            className={`w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-2 focus:ring-brand-500 outline-none ${type === 'income' ? 'text-green-600' : 'text-slate-800'}`}
                        />
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={!amount || !description}
                        className="mb-[1px] bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-3 flex items-center justify-center transition-colors shadow-md shadow-brand-500/30"
                        title="Guardar (Enter)"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            </div>
        </div>

        {/* --- SESSION HISTORY --- */}
        <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-1">Agregados en esta sesión</h3>
            <div className="space-y-2">
                {sessionEntries.length === 0 ? (
                    <div className="text-center py-8 bg-slate-100 rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-400 text-sm">Aquí verás los registros que vayas guardando.</p>
                    </div>
                ) : (
                    sessionEntries.map((t, index) => (
                        <div key={index} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center animate-slide-up hover:shadow-sm transition-shadow">
                            <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                <div>
                                    <p className="font-bold text-slate-800 text-sm">{t.description}</p>
                                    <p className="text-[10px] text-slate-500">{t.category} • {ACCOUNTS.find(a => a.id === t.accountId)?.label}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-slate-800'}`}>
                                    {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount || 0)}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    </div>
  );
};