
"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Transaction } from "@/lib/types";
import { format, getMonth, getYear } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ReportChartsProps {
  transactions: Transaction[];
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col space-y-1">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label}
            </span>
            {payload.map((item: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-bold text-muted-foreground">{item.name}</span>
                <span className="ml-auto font-bold">
                  {item.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL"})}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export function ReportCharts({ transactions }: ReportChartsProps) {
  const { monthlySummary, categoryDistribution } = useMemo(() => {
    const monthly: { [key: string]: { income: number; expense: number } } = {};
    const categories: { [key: string]: number } = {};
    const currentMonth = getMonth(new Date());
    const currentYear = getYear(new Date());

    transactions.forEach((tx) => {
      const date = tx.data.date.toDate();
      const monthKey = format(date, "MMM/yy", { locale: ptBR });

      if (!monthly[monthKey]) {
        monthly[monthKey] = { income: 0, expense: 0 };
      }

      if (tx.type === "income") {
        monthly[monthKey].income += tx.data.amount;
      } else {
        monthly[monthKey].expense += tx.data.amount;
        
        if (getMonth(date) === currentMonth && getYear(date) === currentYear) {
            categories[tx.data.category] = (categories[tx.data.category] || 0) + tx.data.amount;
        }
      }
    });

    const monthlySummary = Object.keys(monthly)
      .map((key) => ({
        name: key,
        Receita: monthly[key].income,
        Despesa: monthly[key].expense,
      }))
      .reverse();
    
    const categoryDistribution = Object.keys(categories).map(key => ({ name: key, value: categories[key] }));

    return { monthlySummary, categoryDistribution };
  }, [transactions]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Receitas vs. Despesas</CardTitle>
          <CardDescription>Resumo mensal dos últimos meses.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySummary}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
                tickFormatter={(value) => `R$${value / 1000}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsla(var(--muted-foreground), 0.1)" }} />
              <Legend wrapperStyle={{fontSize: "0.8rem"}} />
              <Bar dataKey="Receita" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesa" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Despesas por Categoria</CardTitle>
          <CardDescription>Distribuição de despesas no mês atual.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
             {categoryDistribution.length > 0 ? (
                <PieChart>
                <Tooltip content={<CustomTooltip />} />
                <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                </PieChart>
             ) : (
                <div className="flex h-full items-center justify-center">
                    <p className="text-muted-foreground text-sm">Nenhuma despesa este mês.</p>
                </div>
             )}
          </responsivecontainer>
        </CardContent>
      </Card>
    </div>
  );
}
