
"use client";
import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy, where } from "firebase/firestore";
import { AppLayout } from "@/components/app-layout";
import { columns } from "./columns";
import { DataTable } from "../income/data-table";
import { useFirebase, useUser } from "@/firebase";
import type { Income, Expense, Transaction } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportCharts } from "./report-charts";

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { firestore } = useFirebase();
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    const incomeQuery = query(
        collection(firestore, "incomes"), 
        where("userId", "==", user.uid),
        orderBy("date", "desc")
    );
    const expenseQuery = query(
        collection(firestore, "expenses"),
        where("userId", "==", user.uid),
        orderBy("date", "desc")
    );

    const unsubscribeIncomes = onSnapshot(incomeQuery, (incomeSnapshot) => {
      const incomes = incomeSnapshot.docs.map(doc => ({ type: 'income', data: { id: doc.id, ...doc.data() } as Income })) as Transaction[];
      
      const unsubscribeExpenses = onSnapshot(expenseQuery, (expenseSnapshot) => {
        const expenses = expenseSnapshot.docs.map(doc => ({ type: 'expense', data: { id: doc.id, ...doc.data() } as Expense })) as Transaction[];

        const allTxs = [...incomes, ...expenses].sort((a, b) => b.data.date.toDate().getTime() - a.data.date.toDate().getTime());
        
        setTransactions(allTxs);
        setLoading(false);
      });

      return () => unsubscribeExpenses();
    });

    return () => unsubscribeIncomes();
  }, [user, firestore]);

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Relatório de Transações</h2>
        </div>
        
        {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Skeleton className="h-80 w-full" />
                <Skeleton className="h-80 w-full" />
            </div>
        ) : (
            <ReportCharts transactions={transactions} />
        )}

        <div>
            <h3 className="text-2xl font-bold tracking-tight my-4">Todas as Transações</h3>
            <p className="text-muted-foreground mb-4">
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
      </div>
    </AppLayout>
  );
}
