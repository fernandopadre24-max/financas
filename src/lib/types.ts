
import type { Timestamp } from "firebase/firestore";

export interface BaseEntity {
  id: string;
  createdAt: Timestamp;
  userId: string;
}

export interface Income extends BaseEntity {
  source: string;
  amount: number;
  date: Timestamp;
}

export interface Expense extends BaseEntity {
  category: string;
  item: string;
  amount: number;
  date: Timestamp;
}

export interface Installment extends BaseEntity {
  name: string;
  totalAmount: number;
  installmentsCount: number;
  paidInstallments: number;
  startDate: Timestamp;
  category: string;
}

export type Transaction = 
  | { type: 'income'; data: Income }
  | { type: 'expense'; data: Expense };
