"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CheckSquare, Flame, LayoutDashboard, UserPlus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickAddButton } from "@/components/layout/quick-add-sheet";

const items = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/customers", icon: Users, label: "Customers" },
  { href: "/pipeline", icon: Flame, label: "Pipeline" },
  { href: "/tasks", icon: CheckSquare, label: "Tasks" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-forge-border bg-forge-background/95 backdrop-blur-xl pb-safe">
      <div className="flex items-end justify-around px-2 pt-2 pb-3">
        {items.map(({ href, icon: Icon, label }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 text-[10px] font-medium transition-colors",
                active ? "text-forge-accent" : "text-forge-muted"
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          );
        })}
        <div className="flex flex-col items-center -mt-6">
          <QuickAddButton className="h-12 w-12 rounded-full shadow-lg shadow-forge-accent/30 p-0" />
          <span className="text-[10px] font-medium text-forge-accent mt-1">Add</span>
        </div>
      </div>
    </nav>
  );
}
