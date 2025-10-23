
"use client";

import Link from "next/link";
import { Calculator } from "./calculator";
import { Agenda } from "./agenda";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const navItems = [
    { href: "/", label: "Painel" },
    { href: "/income", label: "Receitas" },
    { href: "/expenses", label: "Despesas" },
    { href: "/installments", label: "Parcelas" },
    { href: "/reports", label: "Relatórios" },
];

export function AppHeader() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
             <div className="md:hidden">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon">
                            <Menu className="h-5 w-5" />
                            <span className="sr-only">Abrir menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left">
                        <nav className="grid gap-6 text-lg font-medium mt-8">
                            <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4">
                               <span className="text-lg font-bold">Finance Flow</span>
                            </Link>
                            {navItems.map(item => (
                                <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground">
                                    {item.label}
                                </Link>
                            ))}
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="w-full flex-1" />
            <ThemeToggle />
            <Calculator />
            <Agenda />
        </header>
    );
}
