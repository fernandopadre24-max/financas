
"use client";

import { AppLayout } from "@/components/app-layout";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();

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
