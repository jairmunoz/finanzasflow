export type TransactionType = 'income' | 'expense' | 'transfer_to_savings';
export type AccountType = 'debit' | 'cash' | 'credit' | 'savings';

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: string; // ISO String (User selected effective date)
  createdAt?: string; // ISO String (System timestamp when saved)
  type: TransactionType;
  accountId: AccountType;
  isFixedExpense?: boolean;
}

export interface FixedExpense {
  id: string;
  name: string;
  amount: number; // Estimated amount or max amount
  isVariableAmount?: boolean; // New flag for utility bills
  dayOfMonth: number;
  category: string;
  lastPaidDate?: string; // ISO String of the last time it was marked paid
}

export interface Loan {
  id: string;
  personName: string;
  amountLent: number;
  amountRepaid: number;
  description: string;
  dateLent: string;
  isFullyPaid: boolean;
}

export interface FinanceSummary {
  totalBalance: number;
  savingsBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}