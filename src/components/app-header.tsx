
"use client";

import Link from "next/link";
import { Calculator } from "./calculator";
import { Agenda } from "./agenda";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./app-layout";

export function AppHeader() {
    return (
        <header className="flex h-14 items-center gap-2 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
                <span className="text-lg font-bold">Finance Flow</span>
            </Link>
            <div className="w-full flex-1" />
            <ThemeToggle />
            <Calculator />
            <Agenda />
            <UserMenu />
        </header>
    );
}
