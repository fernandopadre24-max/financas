"use client";
import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { collection, query, where, onSnapshot, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useFirebase, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import type { Expense } from "@/lib/types";
import { Skeleton } from "../ui/skeleton";

interface ChartData {
  name: string;
  total: number;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
];

export function OverviewChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const { firestore } = useFirebase();
  const { user } = useUser();

  useEffect(() => {
    if (!user || !firestore) {
      return;
    };
    
    setLoading(true);
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayOfMonthTimestamp = Timestamp.fromDate(firstDayOfMonth);

    const q = query(
      collection(firestore, "users", user.uid, "expenses"),
      where("date", ">=", firstDayOfMonthTimestamp)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesByCategory: { [key: string]: number } = {};

      querySnapshot.forEach((doc) => {
        const expense = doc.data() as Expense;
        expensesByCategory[expense.category] =
          (expensesByCategory[expense.category] || 0) + expense.amount;
      });

      const chartData = Object.entries(expensesByCategory).map(([name, total]) => ({
        name,
        total,
      }));

      setData(chartData);
      setLoading(false);
    }, (error) => {
      const contextualError = new FirestorePermissionError({
        path: `users/${user.uid}/expenses`,
        operation: 'list',
      });
      errorEmitter.emit('permission-error', contextualError);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Visão Geral</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {loading ? (
            <div className="h-[350px] w-full p-6">
                <Skeleton className="h-full w-full" />
            </div>
        ) : (
            <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
                <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                />
                <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip
                    contentStyle={{
                        background: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                />
                <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
