
"use client";

import Link from "next/link";
import { Calculator } from "./calculator";
import { Agenda } from "./agenda";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./app-layout";
import { Landmark } from "lucide-react";

export function AppHeader() {
    return (
        <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 lg:h-[60px]">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <Landmark className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold">Finanças</span>
            </Link>
            <div className="w-full flex-1" />
            <ThemeToggle />
            <Calculator />
            <Agenda />
            <UserMenu />
        </header>
    );
}
