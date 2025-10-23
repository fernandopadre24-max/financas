
"use client";
import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { IncomeForm } from "./income-form";
import { useFirebase, useUser } from "@/firebase";
import type { Income } from "@/lib/types";
import { PlusCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function IncomePage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState(true);
  const { firestore } = useFirebase();
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!firestore) return;

    setLoading(true);
    const q = query(
      collection(firestore, "users", user.uid, "incomes"),
      orderBy("date", "desc")
    );
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const incomesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userId: user.uid,
      })) as Income[];
      setIncomes(incomesData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar receitas: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, isUserLoading, router]);

  if (isUserLoading || loading) {
    return (
        <AppLayout>
            <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
                <div className="flex items-center justify-between space-y-2">
                    <Skeleton className="h-10 w-48" />
                    <Skeleton className="h-10 w-40" />
                </div>
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
          <h2 className="text-3xl font-bold tracking-tight">Receitas</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Receita
            </Button>
          </div>
        </div>
        <IncomeForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} />
        <DataTable columns={columns} data={incomes} />
      </div>
    </AppLayout>
  );
}
