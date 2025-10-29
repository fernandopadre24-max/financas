"use client";
import { useEffect, useMemo, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { useFirebase, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import type { Subscription } from "@/lib/types";
import { PlusCircle, CalendarClock, Repeat } from "lucide-react";
import { SubscriptionForm } from "./subscription-form";
import { SubscriptionCard } from "./subscription-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
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
        collection(firestore, "users", user.uid, "subscriptions"), 
        orderBy("nextDueDate", "asc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const subscriptionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userId: user.uid,
      })) as Subscription[];
      setSubscriptions(subscriptionsData);
      setLoading(false);
    }, (error) => {
        const contextualError = new FirestorePermissionError({
          path: `users/${user.uid}/subscriptions`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', contextualError);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [user, firestore, isUserLoading, router]);

  const { monthlyTotal, annualTotal } = useMemo(() => {
    return subscriptions.reduce(
      (totals, sub) => {
        if (sub.recurrence === "Mensal") {
          totals.monthlyTotal += sub.amount;
        } else if (sub.recurrence === "Anual") {
          totals.annualTotal += sub.amount;
        }
        return totals;
      },
      { monthlyTotal: 0, annualTotal: 0 }
    );
  }, [subscriptions]);

  if (isUserLoading || loading) {
    return (
      <AppLayout>
        <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-lg" />)}
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Assinaturas</h2>
          <div className="flex items-center space-x-2">
            <Button onClick={() => setIsFormOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Assinatura
            </Button>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Mensal</CardTitle>
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {monthlyTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                    <p className="text-xs text-muted-foreground">Soma de todas as assinaturas mensais.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Anual</CardTitle>
                    <Repeat className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {annualTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </div>
                    <p className="text-xs text-muted-foreground">Soma de todas as assinaturas anuais.</p>
                </CardContent>
            </Card>
        </div>


        <SubscriptionForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} />
        
        {subscriptions.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {subscriptions.map((subscription) => (
              <SubscriptionCard key={subscription.id} subscription={subscription} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center h-[400px]">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">Nenhuma assinatura encontrada</h3>
              <p className="mt-2 text-sm text-muted-foreground">Adicione uma nova assinatura para acompanhar seus pagamentos recorrentes.</p>
              <Button className="mt-4" onClick={() => setIsFormOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Assinatura
              </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
