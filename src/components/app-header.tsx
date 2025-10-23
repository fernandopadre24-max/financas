
"use client";

import Link from "next/link";
import { Calculator } from "./calculator";
import { Agenda } from "./agenda";
import { ThemeToggle } from "./theme-toggle";

export function AppHeader() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <div className="flex-1 md:hidden">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <span className="text-lg font-bold">Finance Flow</span>
                </Link>
            </div>
            <div className="w-full flex-1 hidden md:block" />
            <ThemeToggle />
            <Calculator />
            <Agenda />
        </header>
    );
}
