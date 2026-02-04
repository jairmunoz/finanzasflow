import React from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card } from '../ui/Atoms';
import { Plus, Target } from 'lucide-react';

// --- Helper Formatter ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
};

export const SavingsView: React.FC = () => {
    const { summary, transactions } = useFinance();
    // Filter only savings transactions
    const savingsTx = transactions.filter(t => t.accountId === 'savings' || t.type === 'transfer_to_savings');

    return (
        <div className="pb-24 md:pb-6 space-y-6 animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-800">Mis Ahorros</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-600 rounded-3xl p-8 text-center text-white shadow-xl shadow-purple-500/30 flex flex-col justify-center items-center">
                    <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Target size={32} />
                    </div>
                    <p className="text-purple-200 font-medium mb-1">Total Ahorrado</p>
                    <h2 className="text-5xl font-bold">{formatCurrency(summary.savingsBalance)}</h2>
                </div>

                <div>
                   <h3 className="font-bold text-slate-800 px-1 mb-3">Historial de Ahorro</h3>
                   <div className="space-y-3 max-h-[400px] overflow-y-auto no-scrollbar">
                       {savingsTx.length === 0 ? <p className="text-slate-400 text-center py-10">Aún no has empezado a ahorrar.</p> : 
                        savingsTx.map(t => (
                            <Card key={t.id} className="!p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-purple-100 p-2 rounded-full text-purple-600"><Plus size={16}/></div>
                                    <div>
                                        <p className="font-bold text-slate-700">Aporte</p>
                                        <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-purple-600">+{formatCurrency(t.amount)}</p>
                            </Card>
                        ))
                       }
                   </div>
                </div>
            </div>
        </div>
    );
};