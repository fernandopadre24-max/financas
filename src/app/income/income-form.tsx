
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useFirebase, useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import type { Income } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ptBR } from 'date-fns/locale';

const formSchema = z.object({
  source: z.string().min(2, {
    message: "A origem deve ter pelo menos 2 caracteres.",
  }),
  amount: z.coerce.number().positive({
    message: "O valor deve ser positivo.",
  }),
  date: z.date(),
});

type IncomeFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  income?: Income;
};

export function IncomeForm({ isOpen, onOpenChange, income }: IncomeFormProps) {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const { user } = useUser();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      source: income?.source || "",
      amount: income?.amount || 0,
      date: income?.date?.toDate() || new Date(),
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
        toast({ variant: "destructive", title: "Erro", description: "Você precisa estar logado." });
        return;
    }
    
    try {
      if (income) {
        const incomeRef = doc(firestore, "users", user.uid, "incomes", income.id);
        await updateDoc(incomeRef, {
          ...values,
        });
        toast({ title: "Sucesso", description: "Receita atualizada com sucesso." });
      } else {
        await addDoc(collection(firestore, "users", user.uid, "incomes"), {
          ...values,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Sucesso", description: "Receita adicionada com sucesso." });
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao salvar documento: ", error);
      toast({ variant: "destructive", title: "Erro", description: "Algo deu errado." });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{income ? "Editar Receita" : "Adicionar Receita"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="source"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origem</FormLabel>
                  <FormControl>
                    <Input placeholder="Salário" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="1000.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
