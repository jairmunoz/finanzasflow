import { Transaction, FixedExpense, Loan, Category } from "../types";
import { db } from "../firebaseConfig";
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  deleteDoc
} from 'firebase/firestore';

// --- SERVICE HELPER ---
// All data is stored under: users/{userId}/{collectionName}
const getCollectionRef = (userId: string, collectionName: string) => {
  return collection(db, 'users', userId, collectionName);
};

// Helper to safely convert Firestore timestamps to ISO strings
const sanitizeDate = (date: any): string => {
  if (!date) return new Date().toISOString();
  if (typeof date === 'string') return date;
  if (typeof date === 'object' && 'toDate' in date && typeof date.toDate === 'function') {
    return date.toDate().toISOString();
  }
  return new Date().toISOString(); // Fallback
};

export const storageService = {
  // --- Transactions ---
  async getTransactions(userId: string): Promise<Transaction[]> {
    const q = query(getCollectionRef(userId, 'transactions'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return { 
        id: doc.id, 
        ...data, 
        date: sanitizeDate(data.date),
        createdAt: data.createdAt ? sanitizeDate(data.createdAt) : undefined
      } as Transaction;
    });
  },

  async addTransaction(userId: string, transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const docRef = await addDoc(getCollectionRef(userId, 'transactions'), transaction);
    return { ...transaction, id: docRef.id };
  },

  // --- Fixed Expenses ---
  async getFixedExpenses(userId: string): Promise<FixedExpense[]> {
    const q = query(getCollectionRef(userId, 'fixedExpenses'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        lastPaidDate: data.lastPaidDate ? sanitizeDate(data.lastPaidDate) : undefined
      } as FixedExpense;
    });
  },

  async addFixedExpense(userId: string, expense: Omit<FixedExpense, 'id'>): Promise<FixedExpense> {
    const docRef = await addDoc(getCollectionRef(userId, 'fixedExpenses'), expense);
    return { ...expense, id: docRef.id };
  },

  async updateFixedExpense(userId: string, expense: FixedExpense): Promise<void> {
    const docRef = doc(db, 'users', userId, 'fixedExpenses', expense.id);
    const { id, ...data } = expense;
    await updateDoc(docRef, data);
  },

  async deleteFixedExpense(userId: string, expenseId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'fixedExpenses', expenseId);
    await deleteDoc(docRef);
  },

  // --- Loans ---
  async getLoans(userId: string): Promise<Loan[]> {
    const q = query(getCollectionRef(userId, 'loans'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        dateLent: sanitizeDate(data.dateLent)
      } as Loan;
    });
  },

  async addLoan(userId: string, loan: Omit<Loan, 'id'>): Promise<Loan> {
    const docRef = await addDoc(getCollectionRef(userId, 'loans'), loan);
    return { ...loan, id: docRef.id };
  },

  async updateLoan(userId: string, loan: Loan): Promise<void> {
    const docRef = doc(db, 'users', userId, 'loans', loan.id);
    const { id, ...data } = loan;
    await updateDoc(docRef, data);
  },

  // --- Categories ---
  async getCategories(userId: string): Promise<Category[]> {
    const q = query(getCollectionRef(userId, 'categories'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
  },

  async addCategory(userId: string, category: Omit<Category, 'id'>): Promise<Category> {
    const docRef = await addDoc(getCollectionRef(userId, 'categories'), category);
    return { ...category, id: docRef.id };
  },

  async deleteCategory(userId: string, categoryId: string): Promise<void> {
    const docRef = doc(db, 'users', userId, 'categories', categoryId);
    await deleteDoc(docRef);
  }
};