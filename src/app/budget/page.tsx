
"use client";
import { AppLayout } from "@/components/app-layout";
import { BudgetTool } from "./budget-tool";

export default function BudgetPage() {
  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Assistente de Orçamento com IA</h2>
        </div>
        <p className="text-muted-foreground">
            Receba recomendações de orçamento personalizadas com base na sua renda e hábitos de consumo para este mês.
        </p>
        <BudgetTool />
      </div>
    </AppLayout>
  );
}
