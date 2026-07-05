"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CustomerEditFormProps {
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    phone: string | null;
    dreamBike: string | null;
    currentBike: string | null;
    spouseName: string | null;
    kidsInfo: string | null;
    creditConcerns: string | null;
    occupation: string | null;
    referralSource: string | null;
    favoriteLocations: string | null;
    isVeteran: boolean;
  };
}

export function CustomerEditForm({ customer }: CustomerEditFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    dreamBike: customer.dreamBike ?? "",
    currentBike: customer.currentBike ?? "",
    spouseName: customer.spouseName ?? "",
    kidsInfo: customer.kidsInfo ?? "",
    creditConcerns: customer.creditConcerns ?? "",
    occupation: customer.occupation ?? "",
    referralSource: customer.referralSource ?? "",
    favoriteLocations: customer.favoriteLocations ?? "",
    isVeteran: customer.isVeteran,
  });

  function update(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSaved(true);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card id="edit-customer">
      <CardHeader>
        <CardTitle className="text-base">Edit Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" value={form.firstName} onChange={(e) => update("firstName", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="dreamBike">Dream Bike</Label>
              <Input id="dreamBike" value={form.dreamBike} onChange={(e) => update("dreamBike", e.target.value)} placeholder="e.g. Road Glide ST White Onyx Pearl" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="currentBike">Current Bike / Trade</Label>
              <Input id="currentBike" value={form.currentBike} onChange={(e) => update("currentBike", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spouseName">Spouse</Label>
              <Input id="spouseName" value={form.spouseName} onChange={(e) => update("spouseName", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kidsInfo">Kids</Label>
              <Input id="kidsInfo" value={form.kidsInfo} onChange={(e) => update("kidsInfo", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="creditConcerns">Objections / Payment Concerns</Label>
              <Textarea id="creditConcerns" value={form.creditConcerns} onChange={(e) => update("creditConcerns", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="occupation">Occupation</Label>
              <Input id="occupation" value={form.occupation} onChange={(e) => update("occupation", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referralSource">Referral Source</Label>
              <Input id="referralSource" value={form.referralSource} onChange={(e) => update("referralSource", e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="favoriteLocations">Favorite Riding Spots</Label>
              <Input id="favoriteLocations" value={form.favoriteLocations} onChange={(e) => update("favoriteLocations", e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm sm:col-span-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isVeteran}
                onChange={(e) => update("isVeteran", e.target.checked)}
                className="rounded border-forge-border"
              />
              Military / Veteran
            </label>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save changes
            </Button>
            {saved && <span className="text-xs text-emerald-400">Saved</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
