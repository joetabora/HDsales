"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, LayoutDashboard, Package, Plus, Users, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickAddSheet } from "@/components/layout/quick-add-sheet";

const left = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/customers", icon: Users, label: "Customers" },
];

const right = [
  { href: "/pipeline", icon: Zap, label: "Pipeline" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
];

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 flex-1 py-1.5 rounded-xl transition-colors",
        active ? "text-forge-accent" : "text-forge-muted active:text-forge-muted-foreground"
      )}
    >
      <Icon className={cn("h-[22px] w-[22px]", active && "drop-shadow-[0_0_6px_var(--forge-accent-glow)]")} />
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 pb-safe">
        <div className="mx-3 mb-3 flex items-center rounded-2xl border border-forge-border-strong bg-forge-surface-raised/90 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.55)] px-2 py-1.5">
          {left.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}

          <button
            onClick={() => setQuickAddOpen(true)}
            aria-label="Quick add customer"
            className="mx-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-forge-accent-hot to-forge-accent text-white glow-accent active:scale-95 transition-transform"
          >
            <Plus className="h-6 w-6" strokeWidth={2.5} />
          </button>

          {right.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </div>
      </nav>
      <QuickAddSheet open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </>
  );
}
