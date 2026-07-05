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
        <div className="flex min-h-dvh app-ambient">
          <AppSidebar />
          <div className="flex flex-1 flex-col min-w-0">
            <AppHeader user={session.user} />
            <main className="flex-1 overflow-x-hidden px-4 py-5 lg:px-8 lg:py-7 pb-28 lg:pb-8 animate-enter">
              <div className="mx-auto w-full max-w-6xl">{children}</div>
            </main>
          </div>
        </div>
        <MobileNav />
      </CommandPaletteProvider>
    </QueryProvider>
  );
}
