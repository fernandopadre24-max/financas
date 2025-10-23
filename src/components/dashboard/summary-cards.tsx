
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, Timestamp } from "firebase/firestore";
import { ArrowDownLeft, ArrowUpRight, Scale } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { Income, Expense } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export function SummaryCards() {
  const { user } = useAuth();
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayOfMonthTimestamp = Timestamp.fromDate(firstDayOfMonth);

      // Fetch Income
      const incomeQuery = query(
        collection(db, "incomes"),
        where("userId", "==", user.uid),
        where("date", ">=", firstDayOfMonthTimestamp)
      );
      const incomeSnap = await getDocs(incomeQuery);
      const incomeTotal = incomeSnap.docs.reduce(
        (sum, doc) => sum + (doc.data() as Income).amount,
        0
      );
      setTotalIncome(incomeTotal);

      // Fetch Expenses
      const expensesQuery = query(
        collection(db, "expenses"),
        where("userId", "==", user.uid),
        where("date", ">=", firstDayOfMonthTimestamp)
      );
      const expensesSnap = await getDocs(expensesQuery);
      const expensesTotal = expensesSnap.docs.reduce(
        (sum, doc) => sum + (doc.data() as Expense).amount,
        0
      );
      setTotalExpenses(expensesTotal);
      setLoading(false);
    };

    fetchData();
  }, [user]);
  
  const balance = totalIncome - totalExpenses;

  const cards = [
    { title: "Total Income", amount: totalIncome, icon: ArrowUpRight, description: "This month" },
    { title: "Total Expenses", amount: totalExpenses, icon: ArrowDownLeft, description: "This month" },
    { title: "Balance", amount: balance, icon: Scale, description: "This month" },
  ];

  if (loading) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Balance</CardTitle>
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.amount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
