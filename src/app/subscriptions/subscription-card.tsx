
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { addMonths, addYears, format } from "date-fns";
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
import { useFirebase, errorEmitter, FirestorePermissionError } from "@/firebase";
import { SubscriptionForm } from "./subscription-form";
import type { Subscription } from "@/lib/types";
import { ptBR } from "date-fns/locale";

interface SubscriptionCardProps {
  subscription: Subscription;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const {
    id,
    name,
    amount,
    recurrence,
    nextDueDate,
    category,
    userId
  } = subscription;

  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const handleMarkAsPaid = async () => {
    if (!firestore) return;
    
    const currentDueDate = nextDueDate.toDate();
    const newNextDueDate = recurrence === 'Mensal' 
      ? addMonths(currentDueDate, 1)
      : addYears(currentDueDate, 1);

    const subscriptionRef = doc(firestore, "users", userId, "subscriptions", id);
    const updateData = { nextDueDate: newNextDueDate };
    
    updateDoc(subscriptionRef, updateData)
      .then(() => {
        toast({ title: "Sucesso", description: "Assinatura atualizada para o próximo ciclo." });
      })
      .catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: subscriptionRef.path,
          operation: 'update',
          requestResourceData: updateData,
        }));
      });
  };

  const handleDelete = async () => {
    if (!firestore) return;
    const docRef = doc(firestore, "users", userId, "subscriptions", id);
    deleteDoc(docRef)
      .then(() => {
        toast({ title: "Sucesso", description: "Assinatura excluída." });
      })
      .catch(error => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        }));
      });
    setIsAlertOpen(false);
  };

  const isOverdue = nextDueDate.toDate() < new Date();

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
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Valor:</span>
              <span className="font-medium">{amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} / {recurrence === "Mensal" ? "mês" : "ano"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Próximo Venc.:</span>
              <span className={`font-medium ${isOverdue ? "text-red-500" : ""}`}>{format(nextDueDate.toDate(), "d MMM, yyyy", { locale: ptBR })}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleMarkAsPaid}>
             Marcar como Pago e Avançar
          </Button>
        </CardFooter>
      </Card>

      <SubscriptionForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} subscription={subscription} />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita. Isso excluirá permanentemente esta assinatura.</AlertDialogDescription>
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
