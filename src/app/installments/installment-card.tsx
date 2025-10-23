
"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { addMonths, format } from "date-fns";
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
import { useToast } from "@/hooks/use-toast";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { useFirebase } from "@/firebase";
import { InstallmentForm } from "./installment-form";
import type { Installment } from "@/lib/types";
import { ptBR } from "date-fns/locale";

interface InstallmentCardProps {
  installment: Installment;
}

export function InstallmentCard({ installment }: InstallmentCardProps) {
  const {
    id,
    name,
    totalAmount,
    installmentsCount,
    paidInstallments,
    startDate,
    category,
  } = installment;

  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [currentPaid, setCurrentPaid] = useState(paidInstallments);

  const progress = (currentPaid / installmentsCount) * 100;
  const monthlyPayment = totalAmount / installmentsCount;
  const nextPaymentDate = addMonths(startDate.toDate(), currentPaid);
  const isCompleted = currentPaid >= installmentsCount;

  const handleMarkAsPaid = async () => {
    if (isCompleted) return;
    const newPaidCount = currentPaid + 1;
    const installmentRef = doc(firestore, "installments", id);
    try {
      await updateDoc(installmentRef, { paidInstallments: newPaidCount });
      setCurrentPaid(newPaidCount);
      toast({ title: "Sucesso", description: "Pagamento marcado como pago." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível atualizar o pagamento." });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(firestore, "installments", id));
      toast({ title: "Sucesso", description: "Plano de parcelamento excluído." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o plano." });
    }
    setIsAlertOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{name}</CardTitle>
              <CardDescription>
                <Badge variant="outline" className="mt-1">{category}</Badge>
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsFormOpen(true)}>
                    <Pencil className="mr-2 h-4 w-4" /> Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600" onClick={() => setIsAlertOpen(true)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Progresso</span>
              <span>{currentPaid} de {installmentsCount} pagas</span>
            </div>
            <Progress value={progress} />
          </div>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pagamento Mensal:</span>
              <span className="font-medium">{monthlyPayment.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium">{totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Próximo Pagamento:</span>
              <span className="font-medium">{isCompleted ? "Concluído" : format(nextPaymentDate, "d MMM, yyyy", { locale: ptBR })}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleMarkAsPaid} disabled={isCompleted}>
            {isCompleted ? "Plano Concluído" : "Marcar Próxima como Paga"}
          </Button>
        </CardFooter>
      </Card>

      <InstallmentForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} installment={installment} />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita. Isso excluirá permanentemente este plano de parcelamento.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
