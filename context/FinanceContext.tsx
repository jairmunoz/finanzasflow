import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Transaction, FixedExpense, Loan, FinanceSummary, Category, TransactionType } from '../types';
import { storageService } from '../services/storage';
import { useAuth } from './AuthContext';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../constants';

interface FinanceContextType {
  transactions: Transaction[];
  fixedExpenses: FixedExpense[];
  loans: Loan[];
  summary: FinanceSummary;
  categories: Category[]; // User defined categories
  isLoading: boolean;
  addTransaction: (t: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (t: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addFixedExpense: (e: Omit<FixedExpense, 'id'>) => Promise<void>;
  updateFixedExpense: (e: FixedExpense) => Promise<void>;
  deleteFixedExpense: (id: string) => Promise<void>;
  markFixedExpensePaid: (id: string, customAmount?: number) => Promise<void>;
  addLoan: (l: Omit<Loan, 'id'>) => Promise<void>;
  registerLoanPayment: (id: string, amount: number) => Promise<void>;
  refreshData: () => void;
  // Category management
  addCategory: (name: string, type: TransactionType) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryOptions: (type: TransactionType) => string[];
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const FinanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Get authenticated user
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false); 

  const fetchData = async () => {
    if (!user) {
      setTransactions([]);
      setFixedExpenses([]);
      setLoans([]);
      setCategories([]);
      return;
    }

    setIsLoading(true);
    try {
      const [txs, fixed, lns, cats] = await Promise.all([
        storageService.getTransactions(user.uid),
        storageService.getFixedExpenses(user.uid),
        storageService.getLoans(user.uid),
        storageService.getCategories(user.uid)
      ]);
      setTransactions(txs);
      setFixedExpenses(fixed);
      setLoans(lns);
      setCategories(cats);
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const calculateSummary = (): FinanceSummary => {
    let totalBalance = 0;
    let savingsBalance = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    transactions.forEach(t => {
      const tDate = new Date(t.date);
      const isCurrentMonth = tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;

      if (t.accountId === 'savings') {
        if (t.type === 'transfer_to_savings') savingsBalance += t.amount;
      } else {
        if (t.type === 'income') {
          totalBalance += t.amount;
          if (isCurrentMonth) monthlyIncome += t.amount;
        } else if (t.type === 'expense') {
          totalBalance -= t.amount;
          if (isCurrentMonth) monthlyExpense += t.amount;
        } else if (t.type === 'transfer_to_savings') {
          totalBalance -= t.amount;
        }
      }
    });

    return { totalBalance, savingsBalance, monthlyIncome, monthlyExpense };
  };

  const addTransaction = async (t: Omit<Transaction, 'id'>) => {
    if (!user) return;
    await storageService.addTransaction(user.uid, t);
    await fetchData();
  };

  const updateTransaction = async (t: Transaction) => {
    if (!user) return;
    await storageService.updateTransaction(user.uid, t);
    await fetchData();
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    await storageService.deleteTransaction(user.uid, id);
    await fetchData();
  };

  const addFixedExpense = async (e: Omit<FixedExpense, 'id'>) => {
    if (!user) return;
    await storageService.addFixedExpense(user.uid, e);
    await fetchData();
  };

  const updateFixedExpense = async (e: FixedExpense) => {
    if (!user) return;
    await storageService.updateFixedExpense(user.uid, e);
    await fetchData();
  };

  const deleteFixedExpense = async (id: string) => {
    if (!user) return;
    await storageService.deleteFixedExpense(user.uid, id);
    await fetchData();
  };

  const markFixedExpensePaid = async (id: string, customAmount?: number) => {
    if (!user) return;
    const expense = fixedExpenses.find(e => e.id === id);
    if (!expense) return;

    const updatedExpense = { ...expense, lastPaidDate: new Date().toISOString() };
    await storageService.updateFixedExpense(user.uid, updatedExpense);

    const amountToPay = customAmount !== undefined ? customAmount : expense.amount;

    await storageService.addTransaction(user.uid, {
      amount: amountToPay,
      description: `Pago recurrente: ${expense.name}`,
      category: expense.category,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type: 'expense',
      accountId: 'debit',
      isFixedExpense: true
    });

    await fetchData();
  };

  const addLoan = async (l: Omit<Loan, 'id'>) => {
    if (!user) return;
    await storageService.addLoan(user.uid, l);
    
    await storageService.addTransaction(user.uid, {
      amount: l.amountLent,
      description: `Préstamo a: ${l.personName}`,
      category: 'Préstamos',
      date: l.dateLent,
      createdAt: new Date().toISOString(),
      type: 'expense',
      accountId: 'debit' 
    });

    await fetchData();
  };

  const registerLoanPayment = async (id: string, amount: number) => {
    if (!user) return;
    const loan = loans.find(l => l.id === id);
    if (!loan) return;

    const newAmountRepaid = loan.amountRepaid + amount;
    const isFullyPaid = newAmountRepaid >= loan.amountLent;

    await storageService.updateLoan(user.uid, {
      ...loan,
      amountRepaid: newAmountRepaid,
      isFullyPaid
    });

    await storageService.addTransaction(user.uid, {
      amount: amount,
      description: `Cobro préstamo: ${loan.personName}`,
      category: 'Cobro Préstamos',
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      type: 'income',
      accountId: 'debit'
    });

    await fetchData();
  };

  // --- Category Management ---

  const addCategory = async (name: string, type: TransactionType) => {
    if (!user) return;
    await storageService.addCategory(user.uid, { name, type });
    // Optimistic or simple refresh
    const cats = await storageService.getCategories(user.uid);
    setCategories(cats);
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;
    await storageService.deleteCategory(user.uid, id);
    const cats = await storageService.getCategories(user.uid);
    setCategories(cats);
  };

  const getCategoryOptions = useCallback((type: TransactionType): string[] => {
    const defaultCats = DEFAULT_CATEGORIES[type === 'transfer_to_savings' ? 'savings' : type] || [];
    const customCats = categories
      .filter(c => c.type === type)
      .map(c => c.name);
    
    // Merge and remove duplicates if any
    return Array.from(new Set([...defaultCats, ...customCats])).sort();
  }, [categories]);

  return (
    <FinanceContext.Provider value={{
      transactions,
      fixedExpenses,
      loans,
      summary: calculateSummary(),
      categories,
      isLoading,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addFixedExpense,
      updateFixedExpense,
      deleteFixedExpense,
      markFixedExpensePaid,
      addLoan,
      registerLoanPayment,
      refreshData: fetchData,
      addCategory,
      deleteCategory,
      getCategoryOptions
    }}>
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) throw new Error('useFinance must be used within FinanceProvider');
  return context;
};