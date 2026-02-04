import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, Button, Input, Select } from '../ui/Atoms';
import { Calendar, CheckCircle, Bolt, Banknote, Edit2, Trash2, X } from 'lucide-react';
import { FixedExpense } from '../../types';

// --- Helper Formatter ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
};

const isPaidThisMonth = (lastPaid?: string) => {
  if(!lastPaid) return false;
  const paidDate = new Date(lastPaid);
  const now = new Date();
  return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
};

export const FixedExpensesView: React.FC = () => {
  const { fixedExpenses, addFixedExpense, updateFixedExpense, deleteFixedExpense, markFixedExpensePaid, getCategoryOptions } = useFinance();
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<FixedExpense | null>(null);
  const [newExpense, setNewExpense] = useState<Partial<FixedExpense>>({ isVariableAmount: false, category: 'Servicios' });
  
  // State for paying variable expenses
  const [payingExpenseId, setPayingExpenseId] = useState<string | null>(null);
  const [variableAmount, setVariableAmount] = useState<string>('');

  const expenseCategories = getCategoryOptions('expense');

  const handleOpenEdit = (expense: FixedExpense) => {
    setEditingExpense(expense);
    setNewExpense(expense);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExpense(null);
    setNewExpense({ isVariableAmount: false, category: 'Servicios' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(newExpense.name && newExpense.amount !== undefined) {
      if (editingExpense) {
        await updateFixedExpense({
          ...editingExpense,
          name: newExpense.name!,
          amount: Number(newExpense.amount),
          isVariableAmount: newExpense.isVariableAmount || false,
          dayOfMonth: Number(newExpense.dayOfMonth || 1),
          category: newExpense.category || 'Servicios'
        });
      } else {
        await addFixedExpense({
          name: newExpense.name!,
          amount: Number(newExpense.amount),
          isVariableAmount: newExpense.isVariableAmount || false,
          dayOfMonth: Number(newExpense.dayOfMonth || 1),
          category: newExpense.category || 'Servicios'
        });
      }
      handleCloseForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este gasto fijo? Esto no afectará los pagos ya registrados.')) {
      await deleteFixedExpense(id);
    }
  };

  const handleVariablePayment = async (id: string) => {
    if (!variableAmount) return;
    await markFixedExpensePaid(id, Number(variableAmount));
    setPayingExpenseId(null);
    setVariableAmount('');
  };

  return (
    <div className="pb-24 md:pb-6 space-y-6 animate-fade-in">
       <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gastos Fijos</h1>
          <p className="text-sm text-slate-500">Recurrentes y Servicios</p>
        </div>
        <Button size="sm" onClick={() => showForm ? handleCloseForm() : setShowForm(true)}>
          {showForm ? 'Cancelar' : 'Nuevo Gasto'}
        </Button>
      </div>

      {showForm && (
        <Card className="animate-fade-in border-brand-100 max-w-xl shadow-lg ring-1 ring-brand-100">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold text-slate-800">{editingExpense ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo'}</h3>
             <button onClick={handleCloseForm} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input 
              label="Nombre del Servicio/Gasto" 
              placeholder="Ej. Internet, Luz, Arriendo" 
              value={newExpense.name || ''} 
              onChange={e => setNewExpense({...newExpense, name: e.target.value})} 
              required 
            />
            
            <div className="flex items-center gap-3 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
               <input 
                 type="checkbox" 
                 id="isVariable" 
                 checked={newExpense.isVariableAmount}
                 onChange={e => setNewExpense({...newExpense, isVariableAmount: e.target.checked})}
                 className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500"
               />
               <label htmlFor="isVariable" className="text-sm text-slate-700 font-medium cursor-pointer">
                 Es un monto variable (Servicios: Luz, Agua)
               </label>
            </div>

            <Input 
              label={newExpense.isVariableAmount ? "Monto Estimado / Promedio" : "Monto Fijo"} 
              type="number" 
              placeholder="0" 
              value={newExpense.amount || ''}
              onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} 
              required 
            />
            
            <div className="grid grid-cols-2 gap-3">
              <Input 
                label="Día pago" 
                type="number" 
                min="1" 
                max="31" 
                placeholder="1" 
                value={newExpense.dayOfMonth || ''}
                onChange={e => setNewExpense({...newExpense, dayOfMonth: Number(e.target.value)})} 
                required 
              />
              <Select 
                label="Categoría" 
                value={newExpense.category || 'Servicios'}
                options={expenseCategories.map(c => ({value: c, label: c}))} 
                onChange={e => setNewExpense({...newExpense, category: e.target.value})} 
              />
            </div>
            <Button type="submit" fullWidth>{editingExpense ? 'Actualizar Configuración' : 'Guardar Gasto Fijo'}</Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {fixedExpenses.map(item => {
          const paid = isPaidThisMonth(item.lastPaidDate);
          const isPayingThis = payingExpenseId === item.id;

          return (
            <Card key={item.id} className={`!p-5 border-l-4 transition-all relative group ${paid ? 'border-l-green-500 opacity-80' : 'border-l-brand-500 hover:shadow-md'}`}>
              
              {/* Actions Overlay */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   onClick={() => handleOpenEdit(item)}
                   className="p-1.5 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-400 hover:text-brand-600 transition-colors"
                   title="Editar configuración"
                 >
                    <Edit2 size={14} />
                 </button>
                 <button 
                   onClick={() => handleDelete(item.id)}
                   className="p-1.5 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                   title="Eliminar gasto fijo"
                 >
                    <Trash2 size={14} />
                 </button>
              </div>

              <div className="flex justify-between items-start mb-2 pr-14">
                <div className="flex items-start gap-3">
                   <div className={`mt-1 p-2 rounded-lg ${item.isVariableAmount ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                      {item.isVariableAmount ? <Bolt size={18}/> : <Banknote size={18} />}
                   </div>
                   <div>
                      <h3 className="font-bold text-lg text-slate-800 leading-tight">{item.name}</h3>
                      <div className="flex items-center text-xs text-slate-500 gap-1 mt-1">
                          <Calendar size={12} />
                          <span>Día {item.dayOfMonth}</span>
                          <span className="text-slate-300">•</span>
                          <span>{item.category}</span>
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-3">
                 <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{item.isVariableAmount ? 'Promedio' : 'Valor Fijo'}</p>
                      <p className="font-bold text-slate-700 text-lg">{formatCurrency(item.amount)}</p>
                    </div>
                    {paid && <div className="flex flex-col items-end">
                        <CheckCircle className="text-green-500" size={20} />
                        <span className="text-[10px] font-bold text-green-600 mt-1 uppercase">Pagado</span>
                    </div>}
                 </div>

                 {!paid && (
                    <div className="w-full">
                       {isPayingThis ? (
                          <div className="animate-fade-in bg-slate-50 p-2 rounded-xl border border-slate-200">
                             <p className="text-[10px] font-bold text-slate-500 mb-2 uppercase px-1">Registrar valor de factura</p>
                             <div className="flex gap-2">
                                <Input 
                                  autoFocus 
                                  className="!mb-0 !py-2 !text-sm" 
                                  type="number" 
                                  placeholder="Monto real" 
                                  value={variableAmount}
                                  onChange={e => setVariableAmount(e.target.value)}
                                />
                                <Button size="sm" onClick={() => handleVariablePayment(item.id)}>Ok</Button>
                                <Button size="sm" variant="ghost" className="!p-2" onClick={() => setPayingExpenseId(null)}><X size={16}/></Button>
                             </div>
                          </div>
                       ) : (
                          <Button 
                            fullWidth
                            size="sm" 
                            variant={item.isVariableAmount ? "secondary" : "primary"}
                            onClick={() => {
                              if (item.isVariableAmount) {
                                setPayingExpenseId(item.id);
                              } else {
                                markFixedExpensePaid(item.id);
                              }
                            }}
                          >
                            {item.isVariableAmount ? 'Registrar Pago Variable' : 'Marcar como Pagado'}
                          </Button>
                       )}
                    </div>
                 )}
              </div>
            </Card>
          );
        })}
        {fixedExpenses.length === 0 && !showForm && (
          <div className="col-span-full text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
             <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Calendar className="text-slate-300" size={32} />
             </div>
             <p className="text-slate-500 font-medium">No hay gastos fijos configurados.</p>
             <p className="text-slate-400 text-sm mt-1">Crea uno para llevar el control mensual de tus obligaciones.</p>
             <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowForm(true)}>Agregar mi primer gasto</Button>
          </div>
        )}
      </div>
    </div>
  );
};