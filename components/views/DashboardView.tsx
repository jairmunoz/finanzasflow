import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useAuth } from '../../context/AuthContext';
import { Card, Input } from '../ui/Atoms';
import { ArrowUpRight, ArrowDownRight, Wallet, User, PiggyBank, Bolt, Check, X, CheckSquare, Square } from 'lucide-react';

// --- Helper Formatter ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
};

// --- Helper: Check Payment Date ---
const isPaidThisMonth = (lastPaid?: string) => {
  if(!lastPaid) return false;
  const paidDate = new Date(lastPaid);
  const now = new Date();
  return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
};

export const DashboardView: React.FC = () => {
  const { summary, transactions, fixedExpenses, markFixedExpensePaid } = useFinance();
  const { user } = useAuth();
  
  // Get dynamic user name
  const userName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';

  // State for quick-pay variable expenses
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

  // Recent transactions
  const recent = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Fixed Expenses Logic
  const expensesStatus = fixedExpenses.map(e => ({
    ...e,
    isPaid: isPaidThisMonth(e.lastPaidDate)
  })).sort((a, b) => {
    // Sort: Unpaid first, then by day of month
    if (a.isPaid === b.isPaid) return a.dayOfMonth - b.dayOfMonth;
    return a.isPaid ? 1 : -1;
  });

  const totalFixed = expensesStatus.length;
  const paidFixed = expensesStatus.filter(e => e.isPaid).length;
  const progress = totalFixed > 0 ? (paidFixed / totalFixed) * 100 : 0;

  const handleCheckboxClick = (item: typeof expensesStatus[0]) => {
    if (item.isPaid) return; // Already paid
    
    if (item.isVariableAmount) {
      setPayingId(item.id);
      setPayAmount('');
    } else {
      markFixedExpensePaid(item.id);
    }
  };

  const confirmVariablePay = async (id: string) => {
    if (!payAmount) return;
    await markFixedExpensePaid(id, parseFloat(payAmount));
    setPayingId(null);
    setPayAmount('');
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6 animate-fade-in">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hola, {userName}</h1>
          <p className="text-slate-500 text-sm">Resumen financiero</p>
        </div>
        <div className="bg-slate-200 p-2 rounded-full hidden md:block overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt={userName} className="w-8 h-8 rounded-full" />
            ) : (
              <User className="text-slate-600" size={20}/>
            )}
        </div>
      </header>

      {/* Grid Layout for Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Fixed Expenses List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Balance Card */}
          <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/30">
            <p className="text-brand-100 text-sm font-medium mb-1">Disponible Total</p>
            <h2 className="text-4xl font-bold mb-6">{formatCurrency(summary.totalBalance)}</h2>
            <div className="flex gap-4">
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1 text-green-300">
                  <div className="bg-green-500/20 p-1 rounded-full"><ArrowDownRight size={14}/></div>
                  <span className="text-xs font-semibold uppercase">Ingresos</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(summary.monthlyIncome)}</p>
              </div>
              <div className="flex-1 bg-white/10 backdrop-blur-md rounded-xl p-3">
                <div className="flex items-center gap-2 mb-1 text-red-300">
                  <div className="bg-red-500/20 p-1 rounded-full"><ArrowUpRight size={14}/></div>
                  <span className="text-xs font-semibold uppercase">Gastos</span>
                </div>
                <p className="text-lg font-bold">{formatCurrency(summary.monthlyExpense)}</p>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
            <Card className="flex items-center gap-3 !p-4 hover:shadow-md transition-shadow">
              <div className="bg-purple-100 p-3 rounded-full text-purple-600"><PiggyBank size={20}/></div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Ahorro</p>
                <p className="font-bold text-slate-800">{formatCurrency(summary.savingsBalance)}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3 !p-4 hover:shadow-md transition-shadow">
               <div className="bg-orange-100 p-3 rounded-full text-orange-600"><Wallet size={20}/></div>
               <div>
                 <p className="text-xs text-slate-500 font-bold uppercase">Cash Flow</p>
                 <p className="font-bold text-slate-800">{formatCurrency(summary.monthlyIncome - summary.monthlyExpense)}</p>
               </div>
            </Card>
          </div>

          {/* Fixed Expenses Checklist Section */}
          <Card className="!p-6">
            <div className="mb-4">
              <h3 className="font-bold text-slate-800 text-lg">Gastos Fijos este Mes</h3>
              <p className="text-slate-500 text-xs mt-1">
                Has pagado {paidFixed} de {totalFixed} servicios recurrentes.
              </p>
              {/* Progress Bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
                <div 
                  className="bg-brand-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-1">
              {expensesStatus.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No hay gastos fijos configurados.</p>
              ) : (
                expensesStatus.map(item => (
                  <div 
                    key={item.id} 
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                      item.isPaid ? 'bg-slate-50/50' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Item Content or Input Mode */}
                    {payingId === item.id ? (
                      <div className="flex items-center gap-2 w-full animate-fade-in">
                        <Input 
                          autoFocus
                          type="number" 
                          placeholder="Monto" 
                          className="!mb-0 flex-1"
                          value={payAmount}
                          onChange={e => setPayAmount(e.target.value)}
                        />
                        <button 
                          onClick={() => confirmVariablePay(item.id)}
                          className="bg-brand-600 text-white p-2 rounded-lg hover:bg-brand-700"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={() => setPayingId(null)}
                          className="bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleCheckboxClick(item)}
                            className={`transition-colors ${item.isPaid ? 'text-brand-600 cursor-default' : 'text-slate-300 hover:text-brand-500'}`}
                          >
                            {item.isPaid ? <CheckSquare size={24} /> : <Square size={24} />}
                          </button>
                          
                          <div className={item.isPaid ? 'opacity-50' : ''}>
                            <p className={`font-semibold text-sm ${item.isPaid ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                              {item.name}
                            </p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              {item.isVariableAmount ? <Bolt size={10} className="text-amber-500"/> : null}
                              Vence el día {item.dayOfMonth}
                            </p>
                          </div>
                        </div>

                        <div className={`text-right ${item.isPaid ? 'opacity-50' : ''}`}>
                          <p className="font-bold text-sm text-slate-700">
                            {item.isVariableAmount && !item.isPaid ? 'Variable' : formatCurrency(item.amount)}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Recent Transactions */}
        <div className="lg:col-span-1">
          <h3 className="font-bold text-slate-800 mb-4 px-1">Movimientos Recientes</h3>
          <div className="space-y-3">
            {recent.length === 0 ? (
              <p className="text-center text-slate-400 py-4">No hay movimientos aún</p>
            ) : (
              recent.map(t => (
                <Card key={t.id} className="flex justify-between items-center !p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-full ${t.type === 'income' ? 'bg-green-100 text-green-600' : t.type === 'expense' ? 'bg-red-100 text-red-600' : 'bg-brand-100 text-brand-600'}`}>
                       {t.type === 'income' ? <ArrowDownRight size={18}/> : <ArrowUpRight size={18}/>}
                     </div>
                     <div className="min-w-0">
                       <p className="font-bold text-slate-800 truncate">{t.description}</p>
                       <p className="text-xs text-slate-500 truncate">{t.category} • {new Date(t.date).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <p className={`font-bold whitespace-nowrap ${t.type === 'income' ? 'text-green-600' : 'text-slate-800'}`}>
                    {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                  </p>
                </Card>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};