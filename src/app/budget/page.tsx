
"use client";
import { AppLayout } from "@/components/app-layout";
import { BudgetTool } from "./budget-tool";

export default function BudgetPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">AI Budget Helper</h2>
        </div>
        <p className="text-muted-foreground">
            Get personalized budget recommendations based on your income and spending habits for this month.
        </p>
        <BudgetTool />
      </div>
    </AppLayout>
  );
}
