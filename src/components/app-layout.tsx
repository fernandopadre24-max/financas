"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  FileText,
  ShoppingCart,
  Landmark,
  LogOut,
  User as UserIcon,
  Repeat,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AppHeader } from "./app-header";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

const navItems = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/income", label: "Receitas", icon: Landmark },
  { href: "/expenses", label: "Despesas", icon: ShoppingCart },
  { href: "/installments", label: "Parcelas", icon: CreditCard },
  { href: "/subscriptions", label: "Assinaturas", icon: Repeat },
  { href: "/reports", label: "Relatórios", icon: FileText },
];

function BottomNavLink({ href, label, icon: Icon }: (typeof navItems)[0]) {
  const pathname = usePathname();
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors w-full",
        isActive
          ? "text-primary bg-primary/10"
          : "text-muted-foreground hover:text-primary"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-medium">{label}</span>
    </Link>
  );
}

function BottomNav() {
  const { user, isUserLoading } = useUser();
  if (isUserLoading || !user) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card/95 backdrop-blur-sm sm:hidden">
      <nav className="grid grid-cols-6 items-center justify-center gap-1 max-w-lg mx-auto p-1">
        {navItems.map((item) => (
          <BottomNavLink key={item.href} {...item} />
        ))}
      </nav>
    </div>
  );
}

export function UserMenu() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  }

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "User"} />
            <AvatarFallback>
                <UserIcon />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SideNavLink({ href, label, icon: Icon }: (typeof navItems)[0]) {
    const pathname = usePathname();
    const isActive = pathname === href;
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive && "text-primary bg-muted"
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </Link>
    );
}

function SideNav() {
    return (
        <div className="hidden border-r bg-muted/40 sm:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Landmark className="h-6 w-6 text-primary" />
                        <span className="">Finanças</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        {navItems.map((item) => (
                            <SideNavLink key={item.href} {...item} />
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
}


export function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, isUserLoading } = useUser();

    if (isUserLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
            {/* Você pode adicionar um spinner ou um loader aqui */}
        </div>
      )
    }

    if (!user) {
        return null; // O redirecionamento é tratado na página
    }

    return (
        <div className="grid min-h-screen w-full sm:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <SideNav />
            <div className="flex flex-col">
                <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                    <div className="w-full flex-1">
                      {/* Espaço para futuros itens no header, como um campo de busca */}
                    </div>
                    <UserMenu />
                </header>
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 pb-24 sm:pb-6">
                    {children}
                </main>
            </div>
            <BottomNav />
        </div>
    );
}
