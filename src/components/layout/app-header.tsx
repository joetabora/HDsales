"use client";

import { Flame, LogOut, Search, Settings } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInitials } from "@/lib/utils";
import { signOut } from "@/lib/auth/client";
import { useCommandPalette } from "@/components/layout/command-palette";
import { QuickAddButton } from "@/components/layout/quick-add-sheet";

interface AppHeaderProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  const { open } = useCommandPalette();

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-forge-border/60 bg-forge-background/75 backdrop-blur-2xl pt-safe">
      <div className="flex h-14 lg:h-16 items-center gap-2.5 px-4 lg:px-8">
        {/* Mobile brand mark */}
        <Link href="/dashboard" className="lg:hidden flex items-center gap-2 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b from-forge-accent-hot to-forge-accent glow-accent">
            <Flame className="h-4 w-4 text-white" />
          </div>
        </Link>

        <button
          onClick={open}
          className="flex flex-1 max-w-md items-center gap-2.5 h-10 rounded-xl border border-forge-border bg-forge-surface/60 px-3.5 text-sm text-forge-muted transition-colors hover:border-forge-border-strong hover:text-forge-muted-foreground"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="truncate">Search…</span>
          <kbd className="ml-auto hidden lg:inline-flex h-5 items-center gap-1 rounded-md border border-forge-border bg-forge-surface-raised px-1.5 font-mono text-[10px] text-forge-muted">
            ⌘K
          </kbd>
        </button>

        <div className="flex-1 lg:hidden" />

        <QuickAddButton className="hidden lg:inline-flex gap-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 shrink-0">
              <Avatar className="h-9 w-9 ring-1 ring-forge-border">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback className="bg-forge-accent/15 text-forge-accent text-xs font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-forge-muted">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
