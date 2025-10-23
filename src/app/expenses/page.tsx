
"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { DataTable } from "@/components/ui/data-table";
import { ExpenseForm } from "./expense-form";
import { useFirebase, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import type { Expense } from "@/lib/types";
import { PlusCircle, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExpensesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
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
    const q = query(
        collection(firestore, "users", user.uid, "expenses"), 
        orderBy("date", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const expensesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userId: user.uid,
      })) as Expense[];
      setExpenses(expensesData);
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
  }, [user, firestore, isUserLoading, router]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  if (isUserLoading || loading) {
    return (
        <AppLayout>
            <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-40" />
                </div>
                 <Skeleton className="h-24 w-full" />
                <div className="space-y-4">
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
          <h2 className="text-3xl font-bold tracking-tight">Despesas</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Despesa
            </Button>
          </div>
        </div>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {totalExpenses.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                    })}
                </div>
                <p className="text-xs text-muted-foreground">Soma de todas as despesas registradas.</p>
            </CardContent>
        </Card>

        <ExpenseForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} />
        <DataTable columns={columns} data={expenses} />
      </div>
    </AppLayout>
  );
}
