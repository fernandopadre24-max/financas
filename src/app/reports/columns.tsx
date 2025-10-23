
"use client";

import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

import type { Transaction } from "@/lib/types";

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "data.date",
    header: "Data",
    cell: ({ row }) => {
      const date = row.original.data.date as { toDate: () => Date };
      return <div>{date.toDate().toLocaleDateString('pt-BR')}</div>;
    },
  },
  {
    header: "Descrição",
    cell: ({ row }) => {
        const transaction = row.original;
        return <span>{transaction.type === 'income' ? transaction.data.source : transaction.data.item}</span>
    }
  },
  {
    header: "Categoria/Origem",
    cell: ({ row }) => {
        const transaction = row.original;
        const value = transaction.type === 'income' ? transaction.data.source : transaction.data.category;
        return <Badge variant="secondary">{value}</Badge>
    }
  },
  {
    header: "Tipo",
    cell: ({ row }) => {
        const transaction = row.original;
        return <Badge variant={transaction.type === 'income' ? 'default' : 'destructive'} className={transaction.type === 'income' ? 'bg-green-600' : 'bg-red-600'}>{transaction.type === 'income' ? 'Receita' : 'Despesa'}</Badge>
    }
  },
  {
    accessorKey: "data.amount",
    header: () => <div className="text-right">Valor</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.original.data.amount);
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount);
      const transaction = row.original;

      return <div className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{formatted}</div>;
    },
  },
];
