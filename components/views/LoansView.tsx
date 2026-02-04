import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, Button, Input } from '../ui/Atoms';
import { CheckCircle } from 'lucide-react';
import { Loan } from '../../types';

// --- Helper Formatter ---
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);
};

export const LoansView: React.FC = () => {
  const { loans, addLoan, registerLoanPayment } = useFinance();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<Loan>>({});

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if(form.personName && form.amountLent) {
      await addLoan({
        personName: form.personName!,
        amountLent: Number(form.amountLent),
        amountRepaid: 0,
        description: form.description || 'Préstamo',
        dateLent: new Date().toISOString(),
        isFullyPaid: false
      });
      setShowAdd(false);
      setForm({});
    }
  };

  return (
    <div className="pb-24 md:pb-6 space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Préstamos</h1>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'Cancelar' : 'Prestar'}</Button>
      </div>

      {showAdd && (
        <Card className="animate-fade-in bg-indigo-50 border-indigo-100 max-w-xl">
          <form onSubmit={handleAdd} className="space-y-3">
             <h3 className="text-sm font-bold text-indigo-900 mb-2">Nuevo Préstamo (Sale de Disponible)</h3>
             <Input label="¿A quién?" placeholder="Nombre" onChange={e => setForm({...form, personName: e.target.value})} required />
             <Input label="¿Cuánto?" type="number" onChange={e => setForm({...form, amountLent: Number(e.target.value)})} required />
             <Input label="Nota" placeholder="Opcional" onChange={e => setForm({...form, description: e.target.value})} />
             <Button type="submit" fullWidth>Registrar Préstamo</Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loans.map(loan => {
          const progress = (loan.amountRepaid / loan.amountLent) * 100;
          return (
             <Card key={loan.id} className="!p-4 relative overflow-hidden flex flex-col justify-between h-full">
               <div>
                  {loan.isFullyPaid && <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg"><CheckCircle size={12} className="inline mr-1"/>Pagado</div>}
                  <div className="flex justify-between mb-2">
                    <h3 className="font-bold text-slate-800 text-lg">{loan.personName}</h3>
                    <span className="text-xs text-slate-500">{new Date(loan.dateLent).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-500 italic mb-3">{loan.description}</p>
                  
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Recuperado: {formatCurrency(loan.amountRepaid)}</span>
                    <span className="font-bold text-slate-800">Total: {formatCurrency(loan.amountLent)}</span>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 mb-4">
                    <div className="bg-brand-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
               </div>

               {!loan.isFullyPaid && (
                 <div className="flex gap-2 items-center mt-auto">
                   <Input 
                      className="!mb-0 !py-2" 
                      placeholder="Monto a cobrar" 
                      type="number" 
                      id={`pay-${loan.id}`}
                   />
                   <Button size="sm" onClick={() => {
                      const input = document.getElementById(`pay-${loan.id}`) as HTMLInputElement;
                      if(input.value) {
                        registerLoanPayment(loan.id, Number(input.value));
                        input.value = '';
                      }
                   }}>Cobrar</Button>
                 </div>
               )}
             </Card>
          );
        })}
        {loans.length === 0 && (
           <div className="col-span-full text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
             <p className="text-slate-400">No hay préstamos activos.</p>
           </div>
        )}
      </div>
    </div>
  );
};