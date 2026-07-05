"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  CheckSquare,
  Loader2,
  Package,
  Search,
  Users,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn, formatCurrency, fullName } from "@/lib/utils";

interface SearchResults {
  customers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    dreamBike: string | null;
  }>;
  inventory: Array<{
    id: string;
    year: number;
    make: string;
    model: string;
    color: string | null;
    price: unknown;
  }>;
  tasks: Array<{
    id: string;
    title: string;
    status: string;
    dueAt: Date | null;
  }>;
}

interface CommandPaletteContextValue {
  open: () => void;
  close: () => void;
}

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
  const ctx = useContext(CommandPaletteContext);
  if (!ctx) {
    throw new Error("useCommandPalette must be used within CommandPaletteProvider");
  }
  return ctx;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    customers: [],
    inventory: [],
    tasks: [],
  });
  const router = useRouter();

  const openPalette = useCallback(() => setOpen(true), []);
  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults({ customers: [], inventory: [], tasks: [] });
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
        }
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, open]);

  function navigate(href: string) {
    closePalette();
    router.push(href);
  }

  const hasResults =
    results.customers.length > 0 ||
    results.inventory.length > 0 ||
    results.tasks.length > 0;

  return (
    <CommandPaletteContext.Provider value={{ open: openPalette, close: closePalette }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="overflow-hidden p-0 max-w-xl border-forge-border bg-forge-surface shadow-2xl">
          <Command
            className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-forge-muted [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0"
            shouldFilter={false}
          >
            <div className="flex items-center border-b border-forge-border px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-forge-muted" />
              <Command.Input
                value={query}
                onValueChange={setQuery}
                placeholder="Search customers, inventory, tasks…"
                className="flex h-12 w-full bg-transparent py-3 text-sm outline-none placeholder:text-forge-muted"
              />
              {loading && <Loader2 className="h-4 w-4 animate-spin text-forge-muted" />}
            </div>
            <Command.List className="max-h-80 overflow-y-auto p-2">
              {!query.trim() && (
                <Command.Empty className="py-8 text-center text-sm text-forge-muted">
                  Type to search across Forge…
                </Command.Empty>
              )}
              {query.trim() && !loading && !hasResults && (
                <Command.Empty className="py-8 text-center text-sm text-forge-muted">
                  No results for &ldquo;{query}&rdquo;
                </Command.Empty>
              )}

              {results.customers.length > 0 && (
                <Command.Group heading="Customers">
                  {results.customers.map((c) => (
                    <Command.Item
                      key={c.id}
                      value={`customer-${c.id}`}
                      onSelect={() => navigate(`/customers/${c.id}`)}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-forge-surface-hover"
                      )}
                    >
                      <Users className="h-4 w-4 text-forge-accent" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {fullName(c.firstName, c.lastName)}
                        </p>
                        <p className="text-xs text-forge-muted truncate">
                          {c.dreamBike ?? c.email ?? c.phone}
                        </p>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.inventory.length > 0 && (
                <Command.Group heading="Inventory">
                  {results.inventory.map((u) => (
                    <Command.Item
                      key={u.id}
                      value={`inventory-${u.id}`}
                      onSelect={() => navigate(`/inventory/${u.id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-forge-surface-hover"
                    >
                      <Package className="h-4 w-4 text-blue-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {u.year} {u.make} {u.model}
                        </p>
                        <p className="text-xs text-forge-muted">
                          {u.color} · {formatCurrency(Number(u.price))}
                        </p>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {results.tasks.length > 0 && (
                <Command.Group heading="Tasks">
                  {results.tasks.map((t) => (
                    <Command.Item
                      key={t.id}
                      value={`task-${t.id}`}
                      onSelect={() => navigate(`/tasks?highlight=${t.id}`)}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm aria-selected:bg-forge-surface-hover"
                    >
                      <CheckSquare className="h-4 w-4 text-emerald-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{t.title}</p>
                        <p className="text-xs text-forge-muted capitalize">{t.status.toLowerCase()}</p>
                      </div>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>
        </DialogContent>
      </Dialog>
    </CommandPaletteContext.Provider>
  );
}
