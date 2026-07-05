"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QuickAddSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickAddSheet({ open, onOpenChange }: QuickAddSheetProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dreamBike, setDreamBike] = useState("");
  const [note, setNote] = useState("");

  function reset() {
    setName("");
    setPhone("");
    setDreamBike("");
    setNote("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] ?? "";
    const lastName = parts.slice(1).join(" ") || "—";
    if (!firstName) return;

    setLoading(true);
    try {
      const res = await fetch("/api/customers/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, phone, dreamBike, note }),
      });
      if (res.ok) {
        const customer = await res.json();
        reset();
        onOpenChange(false);
        router.push(`/customers/${customer.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-forge-border bg-forge-surface">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-forge-accent" />
            Quick Add Customer
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="qa-name">Name *</Label>
            <Input
              id="qa-name"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qa-phone">Phone</Label>
            <Input
              id="qa-phone"
              type="tel"
              placeholder="(414) 555-0200"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qa-bike">Bike Interest</Label>
            <Input
              id="qa-bike"
              placeholder="Road Glide ST"
              value={dreamBike}
              onChange={(e) => setDreamBike(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qa-note">Note</Label>
            <Textarea
              id="qa-note"
              placeholder="Walk-in from Bike Night, wife Sarah, payment concern…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
          <p className="text-[11px] text-forge-muted">
            Creates customer + note + 4 follow-up tasks automatically.
          </p>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Save & Open Profile
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function QuickAddButton({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button className={className} onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Quick Add
      </Button>
      <QuickAddSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
