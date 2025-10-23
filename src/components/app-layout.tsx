
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

import { Icons } from "./icons";
import { AppHeader } from "./app-header";

const navItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/income", label: "Receitas", icon: Landmark },
  { href: "/expenses", label: "Despesas", icon: ShoppingCart },
  { href: "/installments", label: "Parcelamentos", icon: CreditCard },
  { href: "/reports", label: "Relatórios", icon: FileText },
];

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

function SidebarNav() {
  return (
    <nav className="grid items-start gap-2 text-sm font-medium">
      {navItems.map((item) => (
        <NavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Icons.logo className="h-6 w-6" />
              <span className="">Finance Flow</span>
            </Link>
          </div>
          <div className="flex-1">
            <div className="px-4 py-4">
              <SidebarNav />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <AppHeader navItems={navItems} />
        <main className="flex flex-1 flex-col gap-4 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
