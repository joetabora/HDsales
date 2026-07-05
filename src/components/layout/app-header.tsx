"use client";

import { LogOut, Search, Settings, User } from "lucide-react";
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
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-forge-border bg-forge-background/80 backdrop-blur-xl px-4 lg:px-6">
      <Button
        variant="outline"
        className="flex-1 max-w-md justify-start gap-2 text-forge-muted-foreground hover:text-forge-foreground"
        onClick={open}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm hidden sm:inline">Search customers, inventory…</span>
        <kbd className="ml-auto hidden sm:inline-flex h-5 items-center gap-1 rounded border border-forge-border bg-forge-surface px-1.5 font-mono text-[10px] text-forge-muted">
          ⌘K
        </kbd>
      </Button>

      <QuickAddButton className="hidden lg:inline-flex gap-2" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="bg-forge-accent/20 text-forge-accent text-xs">
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
    </header>
  );
}
