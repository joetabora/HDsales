"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  CheckSquare,
  Flame,
  LayoutDashboard,
  Package,
  Settings,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Leads", href: "/leads", icon: UserPlus },
  { title: "Pipeline", href: "/pipeline", icon: Zap },
  { title: "Inventory", href: "/inventory", icon: Package },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Reports", href: "/reports", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
];

function NavItem({
  href,
  title,
  icon: Icon,
  active,
}: {
  href: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "text-forge-foreground"
          : "text-forge-muted hover:text-forge-foreground"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-xl bg-forge-surface-raised border border-forge-border-strong"
          transition={{ type: "spring", bounce: 0.15, duration: 0.45 }}
        />
      )}
      <Icon
        className={cn(
          "relative h-4 w-4 shrink-0 transition-colors",
          active ? "text-forge-accent" : "text-forge-muted group-hover:text-forge-muted-foreground"
        )}
      />
      <span className="relative">{title}</span>
      {active && (
        <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-forge-accent shadow-[0_0_8px_var(--forge-accent)]" />
      )}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex w-60 flex-col border-r border-forge-border/60 bg-forge-background/50">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-forge-accent-hot to-forge-accent glow-accent">
          <Flame className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-[15px] font-bold tracking-tight text-forge-foreground leading-none">Forge</p>
          <p className="text-[10px] uppercase tracking-[0.18em] text-forge-muted mt-1">Harley Sales</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="space-y-0.5">
          {mainNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </nav>
      </ScrollArea>

      <div className="p-4">
        <div className="rounded-xl border border-forge-border bg-gradient-to-br from-forge-surface-raised to-forge-surface p-3.5">
          <p className="text-xs font-semibold text-forge-foreground flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-forge-accent" />
            Walk-Up Cards
          </p>
          <p className="mt-1.5 text-[11px] text-forge-muted leading-relaxed">
            Tap any customer for instant intel before you walk up.
          </p>
        </div>
      </div>
    </aside>
  );
}
