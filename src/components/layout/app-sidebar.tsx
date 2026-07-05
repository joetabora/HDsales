"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  Calendar,
  CalendarDays,
  CheckSquare,
  Flame,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Sparkles,
  UserPlus,
  Users,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const mainNav = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Customers", href: "/customers", icon: Users },
  { title: "Leads", href: "/leads", icon: UserPlus },
  { title: "Pipeline", href: "/pipeline", icon: Flame },
  { title: "Inventory", href: "/inventory", icon: Package },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
  { title: "Calendar", href: "/calendar", icon: Calendar },
  { title: "Events", href: "/events", icon: CalendarDays },
  { title: "Messages", href: "/messages", icon: MessageSquare },
];

const secondaryNav = [
  { title: "AI Assistant", href: "/assistant", icon: Bot },
  { title: "Knowledge Base", href: "/knowledge", icon: BookOpen },
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
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-forge-accent/10 text-forge-accent"
          : "text-forge-muted-foreground hover:bg-forge-surface-hover hover:text-forge-foreground"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute inset-0 rounded-lg bg-forge-accent/10 border border-forge-accent/20"
          transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
        />
      )}
      <Icon
        className={cn(
          "relative h-4 w-4 shrink-0",
          active ? "text-forge-accent" : "text-forge-muted group-hover:text-forge-foreground"
        )}
      />
      <span className="relative">{title}</span>
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-forge-border bg-forge-background">
      <div className="flex h-16 items-center gap-2.5 px-6 border-b border-forge-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-forge-accent shadow-lg shadow-forge-accent/25">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-forge-foreground">Forge</p>
          <p className="text-[10px] uppercase tracking-widest text-forge-muted">Sales OS</p>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-forge-muted">
            Main
          </p>
          {mainNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}

          <Separator className="my-4" />

          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-forge-muted">
            Intelligence
          </p>
          {secondaryNav.map((item) => (
            <NavItem key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-forge-border p-4">
        <div className="rounded-lg bg-gradient-to-br from-forge-accent/20 to-forge-accent/5 border border-forge-accent/20 p-3">
          <p className="text-xs font-medium text-forge-foreground">AI Deal Briefs</p>
          <p className="mt-1 text-[11px] text-forge-muted-foreground leading-relaxed">
            Prep for every conversation with Mike Anderson-style briefs.
          </p>
        </div>
      </div>
    </aside>
  );
}
