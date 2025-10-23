
"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { addMonths, isSameDay } from "date-fns";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ptBR } from "date-fns/locale";
import { useFirebase, useUser } from "@/firebase";
import type { Installment } from "@/lib/types";

export function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const { firestore } = useFirebase();
  const { user } = useUser();

  useEffect(() => {
    if (!user || !firestore) return;
    const q = query(collection(firestore, "users", user.uid, "installments"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const installmentsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        userId: user.uid,
      })) as Installment[];
      setInstallments(installmentsData);
    });

    return () => unsubscribe();
  }, [user, firestore]);

  const paymentDates = useMemo(() => {
    return installments.flatMap((inst) => {
      const dates: Date[] = [];
      if (inst.paidInstallments < inst.installmentsCount) {
        for (
          let i = inst.paidInstallments;
          i < inst.installmentsCount;
          i++
        ) {
          dates.push(addMonths(inst.startDate.toDate(), i));
        }
      }
      return dates;
    });
  }, [installments]);

  const selectedDateHasPayment = useMemo(() => {
    if (!date) return false;
    return paymentDates.some((paymentDate) => isSameDay(paymentDate, date));
  }, [date, paymentDates]);

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <CalendarIcon className="h-5 w-5" />
          <span className="sr-only">Abrir Agenda</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          locale={ptBR}
          modifiers={{ payment: paymentDates }}
          modifiersClassNames={{
            payment: "bg-accent text-accent-foreground rounded-full",
          }}
        />
        <div className="p-4 pt-0 text-sm">
          <h4 className="font-medium leading-none mb-2">
            {date ? date.toLocaleDateString('pt-BR', { dateStyle: 'full'}) : "Nenhuma data selecionada"}
          </h4>
          <div className="text-muted-foreground">
             {selectedDateHasPayment ? (
                <p>Você tem pagamentos de parcelas nesta data.</p>
             ) : (
                <p>Nenhum pagamento agendado para esta data.</p>
             )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
