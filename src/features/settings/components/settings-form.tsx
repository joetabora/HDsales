"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SettingsFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    title: string | null;
    bio: string | null;
    qrSlug: string | null;
  };
  dealership: {
    id: string;
    name: string;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    timezone: string;
  };
}

export function SettingsForm({ user, dealership }: SettingsFormProps) {
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone ?? "");
  const [title, setTitle] = useState(user.title ?? "");
  const [bio, setBio] = useState(user.bio ?? "");
  const [dealershipName, setDealershipName] = useState(dealership.name);
  const [dealershipPhone, setDealershipPhone] = useState(dealership.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          title,
          bio,
          dealership: {
            name: dealershipName,
            phone: dealershipPhone,
          },
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setSaved(true);
    } catch {
      // allow retry
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} disabled className="opacity-60" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} />
          </div>
          {user.qrSlug && (
            <p className="text-xs text-forge-muted">
              QR Business Card:{" "}
              <a href={`/card/${user.qrSlug}`} className="text-forge-accent hover:underline" target="_blank" rel="noreferrer">
                /card/{user.qrSlug}
              </a>
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dealership</CardTitle>
          <CardDescription>Dealership settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dealershipName">Dealership Name</Label>
              <Input
                id="dealershipName"
                value={dealershipName}
                onChange={(e) => setDealershipName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dealershipPhone">Phone</Label>
              <Input
                id="dealershipPhone"
                value={dealershipPhone}
                onChange={(e) => setDealershipPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Input value={dealership.timezone} disabled className="opacity-60" />
            </div>
            <div className="space-y-1.5">
              <Label>Location</Label>
              <Input
                value={[dealership.address, dealership.city, dealership.state].filter(Boolean).join(", ")}
                disabled
                className="opacity-60"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </Button>
        {saved && <span className="text-sm text-emerald-400">Settings saved!</span>}
      </div>
    </form>
  );
}
