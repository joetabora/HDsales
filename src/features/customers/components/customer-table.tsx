"use client";

import Link from "next/link";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ArrowUpDown, Mail, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPhone, fullName } from "@/lib/utils";

export type CustomerRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dreamBike: string | null;
  valueScore: number;
  assignedTo: { id: string; name: string; image: string | null } | null;
  tags: Array<{ tag: { id: string; name: string; color: string } }>;
  _count: { interactions: number; tasks: number };
};

const columns: ColumnDef<CustomerRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        className="-ml-3 h-8"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Customer
        <ArrowUpDown className="ml-2 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const c = row.original;
      return (
        <Link href={`/customers/${c.id}`} className="group">
          <p className="font-medium group-hover:text-forge-accent transition-colors">
            {fullName(c.firstName, c.lastName)}
          </p>
          {c.dreamBike && (
            <p className="text-xs text-forge-muted truncate max-w-[200px]">{c.dreamBike}</p>
          )}
        </Link>
      );
    },
  },
  {
    accessorKey: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="space-y-0.5">
          {c.email && (
            <div className="flex items-center gap-1.5 text-xs text-forge-muted">
              <Mail className="h-3 w-3" />
              {c.email}
            </div>
          )}
          {c.phone && (
            <div className="flex items-center gap-1.5 text-xs text-forge-muted">
              <Phone className="h-3 w-3" />
              {formatPhone(c.phone)}
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned",
    cell: ({ row }) => (
      <span className="text-sm text-forge-muted-foreground">
        {row.original.assignedTo?.name ?? "Unassigned"}
      </span>
    ),
  },
  {
    accessorKey: "valueScore",
    header: "Score",
    cell: ({ row }) => {
      const score = row.original.valueScore;
      return (
        <Badge
          variant={score >= 70 ? "success" : score >= 40 ? "warning" : "secondary"}
        >
          {score}
        </Badge>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.tags.slice(0, 2).map(({ tag }) => (
          <Badge
            key={tag.id}
            variant="outline"
            className="text-[10px]"
            style={{ borderColor: `${tag.color}40`, color: tag.color }}
          >
            {tag.name}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "_count",
    header: "Activity",
    cell: ({ row }) => (
      <span className="text-xs text-forge-muted">
        {row.original._count.interactions} interactions · {row.original._count.tasks} tasks
      </span>
    ),
  },
];

interface CustomerTableProps {
  customers: CustomerRow[];
}

export function CustomerTable({ customers }: CustomerTableProps) {
  const table = useReactTable({
    data: customers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-xl border border-forge-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-forge-border bg-forge-surface/50">
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="h-11 px-4 text-left align-middle font-medium text-forge-muted-foreground"
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="h-24 text-center text-forge-muted">
                No customers found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-forge-border last:border-0 hover:bg-forge-surface-hover/50 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
