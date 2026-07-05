import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { CommandPaletteProvider } from "@/components/layout/command-palette";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QueryProvider } from "@/components/providers/query-provider";
import { requireAuth } from "@/lib/auth/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();

  return (
    <QueryProvider>
      <CommandPaletteProvider>
        <div className="flex min-h-screen bg-forge-background">
          <AppSidebar />
          <div className="flex flex-1 flex-col min-w-0">
            <AppHeader user={session.user} />
            <main className="flex-1 overflow-auto p-4 lg:p-6 pb-24 lg:pb-6">{children}</main>
          </div>
        </div>
        <MobileNav />
      </CommandPaletteProvider>
    </QueryProvider>
  );
}
