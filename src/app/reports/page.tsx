
"use client";
import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { AppLayout } from "@/components/app-layout";
import { columns } from "./columns";
import { DataTable } from "../income/data-table";
import { useFirebase, useUser } from "@/firebase";
import type { Income, Expense, Transaction } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { ReportCharts } from "./report-charts";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) {
        router.replace("/login");
        return;
    }
    if (!firestore) return;

    setLoading(true);
    
    const incomeQuery = query(
        collection(firestore, "users", user.uid, "incomes"), 
        orderBy("date", "desc")
    );
    const expenseQuery = query(
        collection(firestore, "users", user.uid, "expenses"),
        orderBy("date", "desc")
    );

    const unsubscribeIncomes = onSnapshot(incomeQuery, (incomeSnapshot) => {
      const incomes = incomeSnapshot.docs.map(doc => ({ type: 'income', data: { id: doc.id, userId: user.uid, ...doc.data() } as Income })) as Transaction[];
      
      const unsubscribeExpenses = onSnapshot(expenseQuery, (expenseSnapshot) => {
        const expenses = expenseSnapshot.docs.map(doc => ({ type: 'expense', data: { id: doc.id, userId: user.uid, ...doc.data() } as Expense })) as Transaction[];

        const allTxs = [...incomes, ...expenses].sort((a, b) => b.data.date.toDate().getTime() - a.data.date.toDate().getTime());
        
        setTransactions(allTxs);
        setLoading(false);
      });

      return () => unsubscribeExpenses();
    }, (error) => {
        console.error("Erro ao buscar transações (receitas): ", error);
        setLoading(false);
    });

    return () => unsubscribeIncomes();
  }, [user, firestore, isUserLoading, router]);


  if (isUserLoading || loading) {
    return (
        <AppLayout>
            <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
                <Skeleton className="h-10 w-72 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-80 w-full" />
                </div>
                 <div className="space-y-4 mt-8">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Relatório de Transações</h2>
        </div>
        
        <ReportCharts transactions={transactions} />

        <div>
            <h3 className="text-2xl font-bold tracking-tight my-4">Todas as Transações</h3>
            <p className="text-muted-foreground mb-4">
            Veja um histórico completo de todas as suas receitas e despesas.
            </p>
            <DataTable columns={columns} data={transactions} />
        </div>
      </div>
    </AppLayout>
  );
}
