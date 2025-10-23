
"use client";

import { useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { deleteDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";

import type { Expense } from "@/lib/types";
import { useFirebase } from "@/firebase";
import { ExpenseForm } from "./expense-form";
import { useToast } from "@/hooks/use-toast";

export const columns: ColumnDef<Expense>[] = [
  {
    accessorKey: "item",
    header: "Item",
  },
  {
    accessorKey: "category",
    header: "Categoria",
    cell: ({ row }) => {
        return <Badge variant="secondary">{row.getValue("category")}</Badge>
    }
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Valor</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => {
      const date = row.getValue("date") as { toDate: () => Date };
      return <div>{date.toDate().toLocaleDateString('pt-BR')}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const expense = row.original;
      const [isFormOpen, setIsFormOpen] = useState(false);
      const [isAlertOpen, setIsAlertOpen] = useState(false);
      const { toast } = useToast();
      const { firestore } = useFirebase();

      const handleDelete = async () => {
        if (!firestore) return;
        try {
          await deleteDoc(doc(firestore, "users", expense.userId, "expenses", expense.id));
          toast({ title: "Sucesso", description: "Despesa excluída." });
        } catch (error) {
          toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir a despesa." });
        }
        setIsAlertOpen(false);
      };

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Ações</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setIsFormOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => setIsAlertOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ExpenseForm
            isOpen={isFormOpen}
            onOpenChange={setIsFormOpen}
            expense={expense}
          />

          <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
                <AlertDialogDescription>
                  Essa ação não pode ser desfeita. Isso excluirá permanentemente este registro de despesa.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];
