
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { Income, Expense, Transaction } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

export function RecentTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      setLoading(true);
      const incomeQuery = query(
        collection(db, "incomes"),
        where("userId", "==", user.uid),
        orderBy("date", "desc"),
        limit(5)
      );
      const expenseQuery = query(
        collection(db, "expenses"),
        where("userId", "==", user.uid),
        orderBy("date", "desc"),
        limit(5)
      );

      const [incomeSnap, expenseSnap] = await Promise.all([
        getDocs(incomeQuery),
        getDocs(expenseQuery),
      ]);

      const incomeTxs = incomeSnap.docs.map(doc => ({ type: 'income', data: {id: doc.id, ...doc.data()} as Income }));
      const expenseTxs = expenseSnap.docs.map(doc => ({ type: 'expense', data: {id: doc.id, ...doc.data()} as Expense }));

      const allTxs = [...incomeTxs, ...expenseTxs]
        .sort((a, b) => b.data.date.toMillis() - a.data.date.toMillis())
        .slice(0, 5);

      setTransactions(allTxs);
      setLoading(false);
    };

    fetchTransactions();
  }, [user]);

  if(loading) {
    return (
        <Card className="col-span-4 md:col-span-3">
            <CardHeader>
                <CardTitle>Transações Recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                        <Skeleton className="h-9 w-9 rounded-full" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                        <Skeleton className="h-5 w-16" />
                    </div>
                ))}
            </CardContent>
        </Card>
    )
  }

  return (
    <Card className="col-span-4 md:col-span-3">
      <CardHeader>
        <CardTitle>Transações Recentes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {transactions.length > 0 ? transactions.map((tx) => (
          <div key={`${tx.type}-${tx.data.id}`} className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex">
              <AvatarFallback className={tx.type === 'income' ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}>
                {tx.type === 'income' ? 'RE' : 'DE'}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1 flex-1">
              <p className="text-sm font-medium leading-none">
                {tx.type === 'income' ? tx.data.source : tx.data.item}
              </p>
              <p className="text-sm text-muted-foreground">{tx.data.date.toDate().toLocaleDateString('pt-BR')}</p>
            </div>
            <div className={`text-sm font-medium ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {tx.type === 'income' ? '+' : '-'}
              {tx.data.amount.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          </div>
        )) : <p className="text-sm text-muted-foreground">Nenhuma transação recente.</p>}
      </CardContent>
    </Card>
  );
}
