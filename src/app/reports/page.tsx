
"use client";
import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { AppLayout } from "@/components/app-layout";
import { columns } from "./columns";
import { DataTable } from "../income/data-table";
import { db } from "@/lib/firebase";
import type { Income, Expense, Transaction } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const incomeQuery = query(collection(db, "incomes"), orderBy("date", "desc"));
    const expenseQuery = query(collection(db, "expenses"), orderBy("date", "desc"));

    const unsubscribeIncomes = onSnapshot(incomeQuery, (incomeSnapshot) => {
      const incomes = incomeSnapshot.docs.map(doc => ({ type: 'income', data: { id: doc.id, ...doc.data() } as Income })) as Transaction[];
      
      const unsubscribeExpenses = onSnapshot(expenseQuery, (expenseSnapshot) => {
        const expenses = expenseSnapshot.docs.map(doc => ({ type: 'expense', data: { id: doc.id, ...doc.data() } as Expense })) as Transaction[];

        const allTxs = [...incomes, ...expenses].sort((a, b) => b.data.date.toMillis() - a.data.date.toMillis());
        
        setTransactions(allTxs);
        setLoading(false);
      });

      return () => unsubscribeExpenses();
    });

    return () => unsubscribeIncomes();
  }, []);

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Relatório de Transações</h2>
        </div>
        <p className="text-muted-foreground">
          Veja um histórico completo de todas as suas receitas e despesas.
        </p>
        {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-40 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        ) : (
            <DataTable columns={columns} data={transactions} />
        )}
      </div>
    </AppLayout>
  );
}
