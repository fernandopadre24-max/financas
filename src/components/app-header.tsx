
"use client";

import {
    PanelLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Icons } from "./icons";
import { Calculator } from "./calculator";
import { Agenda } from "./agenda";
import { ThemeToggle } from "./theme-toggle";


const NavLink = ({ href, label, icon: Icon, isMobile = false } : { href: string, label: string, icon: React.ElementType, isMobile?: boolean }) => {
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
  };

const SidebarNav = ({ navItems }: { navItems: any[] }) => {
    return (
        <nav className="grid items-start gap-2 text-sm font-medium">
        {navItems.map((item) => (
            <NavLink key={item.href} {...item} isMobile />
        ))}
        </nav>
    );
};
  

export function AppHeader({ navItems }: { navItems: any[]}) {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <Sheet>
                <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                >
                    <PanelLeft className="h-5 w-5" />
                    <span className="sr-only">Alternar menu de navegação</span>
                </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Icons.logo className="h-6 w-6" />
                        <span className="">Finance Flow</span>
                    </Link>
                </div>
                <div className="py-4">
                    <SidebarNav navItems={navItems} />
                </div>
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1" />
            <ThemeToggle />
            <Calculator />
            <Agenda />
        </header>
    );
}
