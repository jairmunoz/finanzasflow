import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { Card, Button, Input } from '../ui/Atoms';
import { Trash2, Plus, Tag, Lock } from 'lucide-react';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../../constants';
import { TransactionType } from '../../types';

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useFinance();
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    await addCategory(newCategoryName.trim(), activeTab);
    setNewCategoryName('');
  };

  // Get Defaults for current tab
  const defaults = DEFAULT_CATEGORIES[activeTab === 'transfer_to_savings' ? 'savings' : activeTab] || [];
  
  // Get Customs for current tab
  const customs = categories.filter(c => c.type === activeTab);

  return (
    <div className="pb-24 md:pb-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-800">Gestionar Categorías</h1>
        <p className="text-sm text-slate-500">Personaliza tus listas desplegables.</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
            onClick={() => setActiveTab('expense')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'expense' ? 'bg-white text-red-500 shadow-sm' : 'text-slate-500'}`}
        >
            Gastos
        </button>
        <button
            onClick={() => setActiveTab('income')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'income' ? 'bg-white text-green-500 shadow-sm' : 'text-slate-500'}`}
        >
            Ingresos
        </button>
        <button
            onClick={() => setActiveTab('transfer_to_savings')}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'transfer_to_savings' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500'}`}
        >
            Ahorros
        </button>
      </div>

      {/* Add New */}
      <Card className="!p-4 bg-white border border-slate-200">
          <form onSubmit={handleAdd} className="flex gap-2 items-end">
              <div className="flex-1 mb-0">
                 <Input 
                   label="Nueva Categoría" 
                   className="!mb-0"
                   placeholder={`Ej. ${activeTab === 'expense' ? 'Gimnasio' : 'Inversiones'}`}
                   value={newCategoryName}
                   onChange={e => setNewCategoryName(e.target.value)}
                 />
              </div>
              <Button type="submit" disabled={!newCategoryName.trim()} className="mb-[1px] h-[46px]">
                  <Plus size={20} />
              </Button>
          </form>
      </Card>

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Custom Categories */}
          <div>
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Tag size={16} className="text-brand-500"/>
                  Personalizadas ({customs.length})
              </h3>
              {customs.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm">
                      No has creado categorías aquí.
                  </div>
              ) : (
                  <div className="space-y-2">
                      {customs.map(cat => (
                          <div key={cat.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                              <span className="font-medium text-slate-700">{cat.name}</span>
                              <button 
                                onClick={() => deleteCategory(cat.id)}
                                className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              >
                                  <Trash2 size={16} />
                              </button>
                          </div>
                      ))}
                  </div>
              )}
          </div>

          {/* Default Categories */}
          <div>
              <h3 className="text-sm font-bold text-slate-500 mb-3 flex items-center gap-2">
                  <Lock size={16} />
                  Por defecto (Sistema)
              </h3>
              <div className="flex flex-wrap gap-2">
                  {defaults.map(name => (
                      <span key={name} className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-lg text-xs font-medium border border-slate-200 cursor-default">
                          {name}
                      </span>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};