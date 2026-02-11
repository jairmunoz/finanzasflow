import React, { useState, useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../ui/Atoms';
import { TransactionForm } from '../TransactionForm';
import { ArrowUpRight, ArrowDownRight, Search, Filter, Pencil, Trash2 } from 'lucide-react';
import { TransactionType, Transaction } from '../../types';
import { CATEGORIES } from '../../constants';

// --- Helper Formatter ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
};

export const HistoryView: React.FC = () => {
    const { transactions, getCategoryOptions, deleteTransaction } = useFinance();
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- Filters ---
    const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [monthFilter, setMonthFilter] = useState<string>(''); // Format: YYYY-MM

    // Reset category when type changes to ensure consistent UI state
    const handleTypeChange = (val: string) => {
        setTypeFilter(val as any);
        setCategoryFilter('all');
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar esta transacción?')) {
            await deleteTransaction(id);
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setEditingTransaction(transaction);
    };

    const handleCloseEdit = () => {
        setEditingTransaction(null);
    };

    // Calculate available categories based on selected type
    const availableCategories = useMemo(() => {
        let cats: string[] = [];
        if (typeFilter === 'all') {
            cats = [
                ...getCategoryOptions('income'),
                ...getCategoryOptions('expense'),
                ...getCategoryOptions('transfer_to_savings')
            ];
        } else if (typeFilter === 'income') {
            cats = getCategoryOptions('income');
        } else if (typeFilter === 'expense') {
            cats = getCategoryOptions('expense');
        } else if (typeFilter === 'transfer_to_savings') {
            cats = getCategoryOptions('transfer_to_savings');
        }
        return Array.from(new Set(cats)).sort();
    }, [typeFilter, getCategoryOptions]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // 1. Search Term
            const matchesSearch = 
                t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.amount.toString().includes(searchTerm);
            
            // 2. Type Filter
            const matchesType = typeFilter === 'all' || t.type === typeFilter;
            
            // 3. Category Filter
            const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

            // 4. Month Filter
            let matchesMonth = true;
            if (monthFilter) {
                // Ensure t.date is handled as string safely
                const dateStr = String(t.date || '');
                matchesMonth = dateStr.startsWith(monthFilter);
            }

            return matchesSearch && matchesType && matchesCategory && matchesMonth;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [transactions, searchTerm, typeFilter, categoryFilter, monthFilter]);

    const content = (
        <div className="pb-24 md:pb-6 space-y-6 animate-fade-in">
            <div className="flex flex-col gap-4">
                <h1 className="text-2xl font-bold text-slate-800">Historial</h1>
                
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por descripción, categoría o monto..."
                        className="w-full bg-white border border-slate-200 pl-10 pr-4 py-3 rounded-xl focus:ring-brand-500 focus:border-brand-500 outline-none transition-all shadow-sm"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Filters Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Type Filter */}
                    <div className="relative">
                       <select 
                           value={typeFilter}
                           onChange={(e) => handleTypeChange(e.target.value)}
                           className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:ring-brand-500 outline-none appearance-none"
                       >
                           <option value="all">Todos los tipos</option>
                           <option value="income">Ingresos</option>
                           <option value="expense">Gastos</option>
                           <option value="transfer_to_savings">Ahorro</option>
                       </select>
                       <Filter size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:ring-brand-500 outline-none appearance-none"
                        >
                            <option value="all">Todas las categorías</option>
                            {availableCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <Filter size={14} className="absolute right-3 top-3 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Month Filter */}
                    <input 
                        type="month" 
                        value={monthFilter}
                        onChange={(e) => setMonthFilter(e.target.value)}
                        className="w-full bg-white border border-slate-200 px-3 py-2.5 rounded-xl text-sm focus:ring-brand-500 outline-none text-slate-600 placeholder-slate-400"
                    />
                </div>
            </div>

            <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                    <div className="text-center py-10">
                        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Search className="text-slate-400" size={24}/>
                        </div>
                        <p className="text-slate-500">No se encontraron movimientos.</p>
                    </div>
                ) : (
                    filteredTransactions.map(t => (
                        <Card key={t.id} className="flex justify-between items-center !p-4 hover:bg-slate-50 transition-colors border-b last:border-0 border-slate-100">
                          <div className="flex items-center gap-4">
                             <div className={`p-3 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : t.type === 'expense' ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'}`}>
                               {t.type === 'income' ? <ArrowDownRight size={18}/> : <ArrowUpRight size={18}/>}
                             </div>
                             <div className="min-w-0">
                               <p className="font-bold text-slate-800 truncate">{t.description}</p>
                               <div className="flex flex-col sm:flex-row sm:items-center text-xs text-slate-500 gap-0 sm:gap-2">
                                  <span>{t.category}</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>{new Date(t.date).toLocaleDateString()}</span>
                               </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className={`font-bold whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-slate-800'}`}>
                                  {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                                </p>
                                {t.createdAt && (
                                  <p className="text-[10px] text-slate-300 mt-1">
                                    Reg: {new Date(t.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleEdit(t)}
                                  className="p-1.5 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
                                  title="Editar transacción"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(t.id)}
                                  className="p-1.5 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                  title="Eliminar transacción"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                          </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <>
            {content}
            {editingTransaction && (
                <TransactionForm 
                    onClose={handleCloseEdit} 
                    transaction={editingTransaction} 
                />
            )}
        </>
    );
};