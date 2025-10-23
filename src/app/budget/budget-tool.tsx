
"use client";
import { useState } from "react";
import { collection, query, getDocs, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { automatedBudgetRecommendations } from "@/ai/flows/automated-budget-recommendations";
import type { Income, Expense } from "@/lib/types";
import { Sparkles, Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function BudgetTool() {
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    setRecommendations(null);

    try {
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const firstDayOfMonthTimestamp = Timestamp.fromDate(firstDayOfMonth);

        // Fetch Income
        const incomeQuery = query(
            collection(db, "incomes"),
            where("date", ">=", firstDayOfMonthTimestamp)
        );
        const incomeSnap = await getDocs(incomeQuery);
        const totalIncome = incomeSnap.docs.reduce(
            (sum, doc) => sum + (doc.data() as Income).amount,
            0
        );

        // Fetch Expenses
        const expensesQuery = query(
            collection(db, "expenses"),
            where("date", ">=", firstDayOfMonthTimestamp)
        );
        const expensesSnap = await getDocs(expensesQuery);
        const expenses = expensesSnap.docs.map(doc => {
            const data = doc.data() as Expense;
            return { category: data.category, amount: data.amount };
        });

        if (totalIncome === 0 && expenses.length === 0) {
            toast({variant: "destructive", title: "Dados insuficientes", description: "Por favor, adicione algumas receitas e despesas para este mês para obter recomendações."});
            setLoading(false);
            return;
        }

        const result = await automatedBudgetRecommendations({
            income: totalIncome,
            expenses: expenses,
        });

        setRecommendations(result.recommendations);

    } catch (error) {
        console.error("Erro ao gerar recomendações: ", error);
        toast({variant: "destructive", title: "Erro", description: "Não foi possível gerar as recomendações."})
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Button onClick={handleGenerate} disabled={loading}>
            <Sparkles className="mr-2 h-4 w-4" />
            {loading ? "Gerando..." : "Gerar Recomendações"}
        </Button>
      </div>

      {loading && (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2">
                <Bot className="h-6 w-6" />
                <CardTitle>Recomendações da IA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <br/>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </CardContent>
        </Card>
      )}

      {recommendations && (
        <Card className="bg-primary/5 dark:bg-primary/10 border-primary/20">
            <CardHeader className="flex flex-row items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <CardTitle>Recomendações da IA</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap font-sans">
                    {recommendations}
                </div>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
