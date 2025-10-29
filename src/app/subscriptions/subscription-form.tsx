
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useFirebase, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { cn } from "@/lib/utils";
import type { Subscription } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { ptBR } from "date-fns/locale";

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  amount: z.coerce.number().positive({ message: "O valor deve ser positivo." }),
  recurrence: z.enum(["Mensal", "Anual"], { required_error: "Selecione a recorrência." }),
  category: z.string({ required_error: "Por favor, selecione uma categoria." }),
  nextDueDate: z.date({ required_error: "A data de vencimento é obrigatória." }),
});

type SubscriptionFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  subscription?: Subscription;
};

export function SubscriptionForm({ isOpen, onOpenChange, subscription }: SubscriptionFormProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: subscription?.name || "",
      amount: subscription?.amount || 0,
      recurrence: subscription?.recurrence || "Mensal",
      category: subscription?.category || "",
      nextDueDate: subscription?.nextDueDate?.toDate() || new Date(),
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado." });
        return;
    }

    const dataPayload = { ...values };

    if (subscription) {
      const subscriptionRef = doc(firestore, "users", user.uid, "subscriptions", subscription.id);
      updateDoc(subscriptionRef, dataPayload)
        .then(() => {
          toast({ title: "Sucesso", description: "Assinatura atualizada." });
          form.reset();
          onOpenChange(false);
        })
        .catch(error => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: subscriptionRef.path,
            operation: 'update',
            requestResourceData: dataPayload,
          }));
        });
    } else {
      const collectionRef = collection(firestore, "users", user.uid, "subscriptions");
      const newSubscription = {
        ...dataPayload,
        userId: user.uid,
        createdAt: serverTimestamp(),
      };
      addDoc(collectionRef, newSubscription)
        .then(() => {
          toast({ title: "Sucesso", description: "Assinatura adicionada." });
          form.reset();
          onOpenChange(false);
        })
        .catch(error => {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: collectionRef.path,
            operation: 'create',
            requestResourceData: newSubscription,
          }));
        });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{subscription ? "Editar Assinatura" : "Adicionar Nova Assinatura"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nome</FormLabel><FormControl><Input placeholder="Netflix, Spotify..." {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem><FormLabel>Valor</FormLabel><FormControl><Input type="number" placeholder="39.90" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="recurrence" render={({ field }) => (
              <FormItem><FormLabel>Recorrência</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione a recorrência" /></SelectTrigger></FormControl>
                  <SelectContent><SelectItem value="Mensal">Mensal</SelectItem><SelectItem value="Anual">Anual</SelectItem></SelectContent>
                </Select><FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione uma categoria" /></SelectTrigger></FormControl>
                  <SelectContent>{EXPENSE_CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                </Select><FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="nextDueDate" render={({ field }) => (
              <FormItem className="flex flex-col"><FormLabel>Próximo Vencimento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild><FormControl>
                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                        {field.value ? (format(field.value, "PPP", { locale: ptBR })) : (<span>Escolha uma data</span>)}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                  </FormControl></PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={ptBR} />
                  </PopoverContent>
                </Popover><FormMessage />
              </FormItem>
            )}/>
            <DialogFooter><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
