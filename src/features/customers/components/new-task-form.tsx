"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NewTaskFormProps {
  customerId?: string;
  customerName?: string;
}

export function NewTaskForm({ customerId, customerName }: NewTaskFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [dueInDays, setDueInDays] = useState("1");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      const dueAt = new Date();
      dueAt.setDate(dueAt.getDate() + parseInt(dueInDays || "1", 10));
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          customerId,
          dueAt: dueAt.toISOString(),
          priority: "MEDIUM",
        }),
      });
      if (res.ok) {
        setTitle("");
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button variant="outline" className="w-full gap-2" onClick={() => setOpen(true)}>
        <CheckSquare className="h-4 w-4" />
        New Task{customerName ? ` for ${customerName.split(" ")[0]}` : ""}
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">New Task</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="taskTitle">Task</Label>
            <Input
              id="taskTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Follow up on financing"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueInDays">Due in (days)</Label>
            <Input
              id="dueInDays"
              type="number"
              min="0"
              value={dueInDays}
              onChange={(e) => setDueInDays(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create
            </Button>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
