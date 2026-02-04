import React, { useState } from 'react';
import { FinanceProvider } from './context/FinanceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LayoutDashboard, Repeat, HandCoins, PiggyBank, Plus, LogOut, History, Zap, Tags } from 'lucide-react';
import { DashboardView, FixedExpensesView, LoansView, SavingsView, HistoryView, BatchEntryView, CategoriesView } from './components/Views';
import { TransactionForm } from './components/TransactionForm';
import { LoginView } from './components/LoginView';

type View = 'dashboard' | 'fixed' | 'loans' | 'savings' | 'history' | 'batch' | 'categories';

interface NavItemProps {
  icon: any;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all mb-1 ${
      isActive 
        ? 'bg-brand-50 text-brand-600 font-bold' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
    }`}
  >
    <Icon size={20} className="mr-3" strokeWidth={isActive ? 2.5 : 2} />
    <span className="text-sm">{label}</span>
  </button>
);

const MobileNavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full py-1 transition-colors ${
      isActive ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
    <span className="text-[10px] font-medium mt-1">{label}</span>
  </button>
);

const AppLayout: React.FC = () => {
  const { user, isLoading, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [showAddModal, setShowAddModal] = useState(false);

  // --- Auth Loading State ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand-600"></div>
      </div>
    );
  }

  // --- Unauthenticated State ---
  if (!user) {
    return <LoginView />;
  }

  // --- Authenticated App Content ---
  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'fixed': return <FixedExpensesView />;
      case 'loans': return <LoansView />;
      case 'savings': return <SavingsView />;
      case 'history': return <HistoryView />;
      case 'batch': return <BatchEntryView />;
      case 'categories': return <CategoriesView />;
      default: return <DashboardView />;
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' },
    { id: 'batch', icon: Zap, label: 'Rápido' },
    { id: 'history', icon: History, label: 'Historial' },
    { id: 'fixed', icon: Repeat, label: 'Fijos' },
    { id: 'loans', icon: HandCoins, label: 'Préstamos' },
    { id: 'savings', icon: PiggyBank, label: 'Ahorro' },
    { id: 'categories', icon: Tags, label: 'Categorías' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-100 flex flex-col md:flex-row">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100">
           <div className="flex items-center gap-2 text-brand-600 font-bold text-xl">
             <div className="bg-brand-600 text-white p-1 rounded-lg">
               <LayoutDashboard size={20} />
             </div>
             FinanzaFlow
           </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto no-scrollbar">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">Menú Principal</p>
          {menuItems.map(item => (
            <SidebarItem 
              key={item.id} 
              icon={item.icon} 
              label={item.label} 
              isActive={currentView === item.id}
              onClick={() => setCurrentView(item.id as View)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <button 
             onClick={() => setShowAddModal(true)}
             className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all active:scale-95 flex items-center justify-center gap-2"
           >
             <Plus size={20} />
             Nueva Transacción
           </button>
           
           <button 
             onClick={signOut}
             className="w-full text-slate-500 hover:bg-slate-50 hover:text-red-500 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
           >
             <LogOut size={16} />
             Cerrar Sesión
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 min-h-screen relative p-4 md:p-8 lg:p-10 w-full max-w-7xl mx-auto">
        
        {/* Mobile Header with Logout */}
        <div className="md:hidden flex justify-end mb-4">
             <button onClick={signOut} className="text-slate-400 hover:text-red-500 p-2">
                <LogOut size={20} />
             </button>
        </div>

        {renderView()}
      </main>

      {/* --- MOBILE FAB (Floating Action Button) --- */}
      <div className="md:hidden fixed bottom-24 right-6 z-30">
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white p-4 rounded-full shadow-lg shadow-brand-500/40 transition-transform active:scale-90"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* --- MOBILE BOTTOM NAV --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe pt-2 px-6 z-40 overflow-x-auto no-scrollbar">
        <div className="flex justify-between items-center h-16 min-w-[320px]">
          {menuItems.map(item => (
             <div key={item.id} className="min-w-[50px] flex justify-center">
                 <MobileNavItem 
                icon={item.icon} 
                label={item.label}
                isActive={currentView === item.id}
                onClick={() => setCurrentView(item.id as View)}
                />
             </div>
          ))}
        </div>
      </nav>

      {showAddModal && <TransactionForm onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <FinanceProvider>
        <AppLayout />
      </FinanceProvider>
    </AuthProvider>
  );
};

export default App;