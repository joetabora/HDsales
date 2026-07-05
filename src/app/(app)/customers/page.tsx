import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDealershipId } from "@/lib/auth/session";
import { listCustomers } from "@/server/services/customer.service";
import { CustomerTable } from "@/features/customers/components/customer-table";

interface CustomersPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function CustomersPage({ searchParams }: CustomersPageProps) {
  const { q } = await searchParams;
  const dealershipId = await getDealershipId();
  const { customers, total } = await listCustomers({
    dealershipId,
    search: q,
    limit: 100,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-forge-muted-foreground mt-1">
            {total} customer{total !== 1 ? "s" : ""} in your dealership
          </p>
        </div>
        <Button asChild>
          <Link href="/customers/new">
            <Plus className="h-4 w-4" />
            Add Customer
          </Link>
        </Button>
      </div>

      <form className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-forge-muted" />
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by name, email, or phone…"
          className="pl-9"
        />
      </form>

      <CustomerTable customers={customers} />
    </div>
  );
}
