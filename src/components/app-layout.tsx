
"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Landmark
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AppHeader } from "./app-header";

const navItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/income", label: "Receitas", icon: Landmark },
  { href: "/expenses", label: "Despesas", icon: ShoppingCart },
  { href: "/installments", label: "Parcelas", icon: CreditCard },
  { href: "/reports", label: "Relatórios", icon: FileText },
];

function BottomNavLink({ href, label, icon: Icon }: (typeof navItems)[0]) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors",
        isActive
          ? "text-primary"
          : "text-muted-foreground hover:text-primary"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm md:hidden">
      <nav className="grid grid-cols-5 items-center justify-center gap-1 p-1">
        {navItems.map((item) => (
          <BottomNavLink key={item.href} {...item} />
        ))}
      </nav>
    </div>
  );
}

function SidebarNav() {
  return (
    <nav className="grid items-start gap-2 text-sm font-medium">
      {navItems.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}

function NavLink({ href, label, icon: Icon }: (typeof navItems)[0]) {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-primary"
        }`}
      >
        <Icon className="h-4 w-4" />
        {label}
      </Link>
    );
  }

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="text-lg font-bold">Finance Flow</span>
            </Link>
          </div>
          <div className="flex-1 overflow-auto py-4">
              <div className="px-4">
                <SidebarNav />
              </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <AppHeader />
        <main className="flex flex-1 flex-col gap-4 bg-background pb-20 md:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
