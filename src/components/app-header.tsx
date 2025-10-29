"use client";

import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { PanelLeft, Landmark } from "lucide-react";
import Link from "next/link";
import { UserMenu } from "./app-layout";

const navItems = [
    { href: "/", label: "Painel" },
    { href: "/income", label: "Receitas" },
    { href: "/expenses", label: "Despesas" },
    { href: "/installments", label: "Parcelas" },
    { href: "/subscriptions", label: "Assinaturas" },
    { href: "/reports", label: "Relatórios" },
];

function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
                <nav className="grid gap-6 text-lg font-medium">
                    <Link
                        href="#"
                        className="group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:text-base"
                    >
                        <Landmark className="h-5 w-5 transition-all group-hover:scale-110" />
                        <span className="sr-only">Finanças</span>
                    </Link>
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-4 px-2.5 text-muted-foreground hover:text-foreground"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </SheetContent>
        </Sheet>
    );
}

export function AppHeader() {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
            <MobileNav />
            <div className="relative ml-auto flex-1 md:grow-0">
                {/* Search input can go here */}
            </div>
            <UserMenu />
        </header>
    );
}
