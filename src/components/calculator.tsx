
"use client";

import { useState } from "react";
import { CalculatorIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function Calculator() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleButtonClick = (value: string) => {
    if (value === "=") {
      try {
        // Avoid using eval in production apps due to security risks
        const evalResult = new Function('return ' + input)();
        setResult(String(evalResult));
      } catch (error) {
        setResult("Error");
      }
    } else if (value === "C") {
      setInput("");
      setResult("");
    } else {
      setInput((prev) => prev + value);
    }
  };

  const buttons = [
    "7", "8", "9", "/",
    "4", "5", "6", "*",
    "1", "2", "3", "-",
    "0", ".", "=", "+",
    "C"
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <CalculatorIcon className="h-5 w-5" />
          <span className="sr-only">Abrir Calculadora</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[320px]">
        <DialogHeader>
          <DialogTitle>Calculadora</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col items-end justify-end h-20 p-4 border rounded-md bg-muted text-right">
            <div className="text-sm text-muted-foreground">{input}</div>
            <div className="text-2xl font-bold">{result || (input || "0")}</div>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {buttons.map((btn) => (
              <Button
                key={btn}
                variant={btn === "C" ? "destructive" : "outline"}
                className={`text-xl font-bold ${btn === "C" ? "col-span-4" : ""}`}
                onClick={() => handleButtonClick(btn)}
              >
                {btn}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
