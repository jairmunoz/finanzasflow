import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { Button, Input, Select } from './ui/Atoms';
import { ACCOUNTS } from '../constants';
import { TransactionType, AccountType, Transaction } from '../types';

interface Props {
  onClose: () => void;
  initialType?: TransactionType;
  transaction?: Transaction;
}

export const TransactionForm: React.FC<Props> = ({ onClose, initialType = 'expense', transaction }) => {
  const { addTransaction, updateTransaction, getCategoryOptions } = useFinance();
  const isEditMode = !!transaction;

  const [type, setType] = useState<TransactionType>(transaction?.type || initialType);
  const [amount, setAmount] = useState(transaction?.amount.toString() || '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [category, setCategory] = useState(transaction?.category || '');
  const [account, setAccount] = useState<AccountType>(transaction?.accountId || 'debit');
  const [date, setDate] = useState(
    transaction?.date 
      ? new Date(transaction.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0]
  );

  // Dynamic Categories based on Type
  const categoryOptions = getCategoryOptions(type);

  // Reset category when type changes (only if not in edit mode or type changed)
  useEffect(() => {
    if (!isEditMode || type !== transaction?.type) {
      const options = getCategoryOptions(type);
      setCategory(options[0] || '');
    }
  }, [type, getCategoryOptions, isEditMode, transaction?.type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description) return;

    const transactionData = {
      amount: parseFloat(amount),
      description,
      category: type === 'transfer_to_savings' ? 'Ahorro' : category,
      date: new Date(date).toISOString(),
      type,
      accountId: type === 'transfer_to_savings' ? 'savings' : account,
    };

    if (isEditMode && transaction) {
      await updateTransaction({
        ...transactionData,
        id: transaction.id,
        createdAt: transaction.createdAt,
      });
    } else {
      await addTransaction({
        ...transactionData,
        createdAt: new Date().toISOString(),
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up sm:animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">{isEditMode ? 'Editar Transacción' : 'Nueva Transacción'}</h2>
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
            {isEditMode ? 'Actualizar' : 'Guardar'}
          </Button>
        </form>
      </div>
    </div>
  );
};