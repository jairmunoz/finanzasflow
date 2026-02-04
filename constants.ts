import { AccountType } from "./types";

export const CATEGORIES = {
  income: ['Salario', 'Freelance', 'Venta', 'Regalo', 'Otros'],
  expense: ['Alimentación', 'Transporte', 'Vivienda', 'Servicios', 'Ocio', 'Salud', 'Educación', 'Compras', 'Otros'],
  savings: ['Ahorro General', 'Fondo de Emergencia', 'Meta Específica']
};

export const ACCOUNTS: { id: AccountType; label: string }[] = [
  { id: 'debit', label: 'Tarjeta Débito' },
  { id: 'cash', label: 'Efectivo' },
  { id: 'credit', label: 'Tarjeta Crédito' },
  { id: 'savings', label: 'Cuenta Ahorros' },
];