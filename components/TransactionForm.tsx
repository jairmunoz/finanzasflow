import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Button, Input, Select } from './ui/Atoms';
import { ACCOUNTS } from '../constants';
import { TransactionType, AccountType } from '../types';

interface Props {
  onClose: () => void;
  initialType?: TransactionType;
}

export const TransactionForm: React.FC<Props> = ({ onClose, initialType = 'expense' }) => {
  const { addTransaction, getCategoryOptions } = useFinance();
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [account, setAccount] = useState<AccountType>('debit');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Dynamic Categories based on Type
  const categoryOptions = getCategoryOptions(type);

  // Reset category when type changes
  useEffect(() => {
    setCategory(categoryOptions[0] || '');
  }, [type, categoryOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    await addTransaction({
      amount: parseFloat(amount),
      description,
      category: type === 'transfer_to_savings' ? 'Ahorro' : category,
      date: new Date(date).toISOString(), // User selected date
      createdAt: new Date().toISOString(), // System date
      type,
      accountId: type === 'transfer_to_savings' ? 'savings' : account,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Nueva Transacción</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {/* Toggle Type */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500'}`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'income' ? 'bg-white text-green-500 shadow-sm' : 'text-slate-500'}`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setType('transfer_to_savings')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${type === 'transfer_to_savings' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
            >
              Ahorrar
            </button>
          </div>

          <Input 
            label="Monto" 
            type="number" 
            placeholder="0.00" 
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            className="text-2xl font-bold text-center"
            autoFocus
            required
          />

          <Input 
            label="Descripción" 
            type="text" 
            placeholder="¿Qué es?" 
            value={description} 
            onChange={e => setDescription(e.target.value)}
            required
          />

          {type !== 'transfer_to_savings' && (
            <Select 
              label="Categoría"
              options={categoryOptions.map(c => ({ value: c, label: c }))}
              value={category}
              onChange={e => setCategory(e.target.value)}
            />
          )}

          {type !== 'transfer_to_savings' && (
            <Select 
              label="Cuenta"
              options={ACCOUNTS.map(a => ({ value: a.id, label: a.label }))}
              value={account}
              onChange={e => setAccount(e.target.value as AccountType)}
            />
          )}

          <Input 
            label="Fecha" 
            type="date" 
            value={date} 
            onChange={e => setDate(e.target.value)}
            required
          />

          <Button type="submit" fullWidth className="mt-4" size="lg">
            Guardar
          </Button>
        </form>
      </div>
    </div>
  );
};