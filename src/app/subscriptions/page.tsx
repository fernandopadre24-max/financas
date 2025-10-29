"use client";
import { useEffect, useState } from "react";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { useFirebase, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import type { Subscription } from "@/lib/types";
import { PlusCircle } from "lucide-react";
import { SubscriptionForm } from "./subscription-form";
import { SubscriptionCard } from "./subscription-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

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

  if (isUserLoading || loading) {
    return (
      <AppLayout>
        <div className="flex-1 space-y-4 pt-6">
          <div className="flex items-center justify-between space-y-2">
              <Skeleton className="h-10 w-72" />
              <Skeleton className="h-10 w-40" />
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
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assinaturas</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Assinatura
          </Button>
        </div>
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
    </AppLayout>
  );
}
