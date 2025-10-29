
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/app-layout";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useUser } from "@/firebase";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/login');
    }
  }, [isUserLoading, user, router]);

  if (isUserLoading) {
    return (
        <AppLayout>
            <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
                <Skeleton className="h-10 w-48 mb-4" />
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                    <Skeleton className="h-28" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Skeleton className="col-span-4 h-80" />
                    <Skeleton className="col-span-3 h-80" />
                </div>
            </div>
        </AppLayout>
    );
  }
  
  if (!user) {
    // Renderiza um loader ou nada enquanto redireciona para evitar flash de conteúdo
    return null;
  }
  
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Painel</h2>
        </div>
        <div className="space-y-4">
          <SummaryCards />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <OverviewChart />
            <RecentTransactions />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
