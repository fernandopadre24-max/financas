
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
import { useAuth } from "@/hooks/use-auth";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import type { Installment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  totalAmount: z.coerce.number().positive({ message: "Amount must be positive." }),
  installmentsCount: z.coerce.number().int().min(2, { message: "Must be at least 2 installments." }),
  paidInstallments: z.coerce.number().int().min(0).optional().default(0),
  category: z.string({ required_error: "Please select a category." }),
  startDate: z.date(),
});

type InstallmentFormProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  installment?: Installment;
};

export function InstallmentForm({ isOpen, onOpenChange, installment }: InstallmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: installment?.name || "",
      totalAmount: installment?.totalAmount || 0,
      installmentsCount: installment?.installmentsCount || 12,
      paidInstallments: installment?.paidInstallments || 0,
      category: installment?.category || "",
      startDate: installment?.startDate?.toDate() || new Date(),
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    if (values.paidInstallments && values.paidInstallments > values.installmentsCount) {
        form.setError("paidInstallments", { message: "Cannot be more than total installments." });
        return;
    }

    try {
      if (installment) {
        const installmentRef = doc(db, "installments", installment.id);
        await updateDoc(installmentRef, values);
        toast({ title: "Success", description: "Installment plan updated." });
      } else {
        await addDoc(collection(db, "installments"), {
          ...values,
          userId: user.uid,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Success", description: "Installment plan added." });
      }
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving document: ", error);
      toast({ variant: "destructive", title: "Error", description: "Something went wrong." });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{installment ? "Edit Plan" : "Add New Installment Plan"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Purchase Name</FormLabel><FormControl><Input placeholder="New Laptop" {...field} /></FormControl><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="totalAmount" render={({ field }) => (
                <FormItem><FormLabel>Total Amount</FormLabel><FormControl><Input type="number" placeholder="1200" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="installmentsCount" render={({ field }) => (
                <FormItem><FormLabel># of Installments</FormLabel><FormControl><Input type="number" placeholder="12" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            </div>
             <FormField control={form.control} name="paidInstallments" render={({ field }) => (
                <FormItem><FormLabel>Paid Installments</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger></FormControl>
                  <SelectContent>{EXPENSE_CATEGORIES.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}</SelectContent>
                </Select><FormMessage />
              </FormItem>
            )}/>
            <FormField control={form.control} name="startDate" render={({ field }) => (
              <FormItem className="flex flex-col"><FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild><FormControl>
                      <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal",!field.value && "text-muted-foreground")}>
                        {field.value ? (format(field.value, "PPP")) : (<span>Pick a date</span>)}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                  </FormControl></PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                  </PopoverContent>
                </Popover><FormMessage />
              </FormItem>
            )}/>
            <DialogFooter><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save"}</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
