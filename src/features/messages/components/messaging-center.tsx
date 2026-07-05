"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Mail, MessageSquare, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fullName } from "@/lib/utils";

export interface MessageTemplate {
  id: string;
  name: string;
  channel: string;
  subject: string | null;
  body: string;
}

export interface MessageItem {
  id: string;
  channel: string;
  status: string;
  subject: string | null;
  body: string;
  toAddress: string;
  createdAt: string;
  customer: { id: string; firstName: string; lastName: string } | null;
}

interface MessagingCenterProps {
  initialMessages: MessageItem[];
  templates: MessageTemplate[];
}

export function MessagingCenter({ initialMessages, templates }: MessagingCenterProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [channel, setChannel] = useState<"SMS" | "EMAIL">("SMS");
  const [toAddress, setToAddress] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [devOutbox, setDevOutbox] = useState<string[]>([]);

  function applyTemplate(template: MessageTemplate) {
    setChannel(template.channel as "SMS" | "EMAIL");
    setSubject(template.subject ?? "");
    setBody(template.body);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, toAddress, subject: subject || undefined, body }),
      });
      if (!res.ok) throw new Error("Failed");
      const msg = await res.json();
      setMessages((prev) => [
        {
          id: msg.id,
          channel: msg.channel,
          status: msg.status,
          subject: msg.subject,
          body: msg.body,
          toAddress: msg.toAddress,
          createdAt: msg.createdAt,
          customer: msg.customer,
        },
        ...prev,
      ]);
      setDevOutbox((prev) => [
        `[${channel}] to ${toAddress}: ${body.slice(0, 80)}…`,
        ...prev,
      ]);
      setBody("");
      setSubject("");
      setToAddress("");
    } catch {
      // retry allowed
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-forge-accent" />
              Compose Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={sendMessage} className="space-y-4">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={channel === "SMS" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChannel("SMS")}
                >
                  <MessageSquare className="h-3 w-3" />
                  SMS
                </Button>
                <Button
                  type="button"
                  variant={channel === "EMAIL" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChannel("EMAIL")}
                >
                  <Mail className="h-3 w-3" />
                  Email
                </Button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  placeholder={channel === "SMS" ? "(414) 555-0200" : "customer@email.com"}
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  required
                />
              </div>

              {channel === "EMAIL" && (
                <div className="space-y-1.5">
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" disabled={sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Message History</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-forge-border">
            {messages.length === 0 ? (
              <p className="text-sm text-forge-muted py-4 text-center">No messages yet</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{msg.channel}</Badge>
                      <Badge variant={msg.status === "DELIVERED" ? "success" : "outline"}>
                        {msg.status.toLowerCase()}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-forge-muted">
                      {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm mt-1">
                    To: {msg.toAddress}
                    {msg.customer && (
                      <span className="text-forge-muted">
                        {" "}({fullName(msg.customer.firstName, msg.customer.lastName)})
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-forge-muted-foreground mt-1 line-clamp-2">{msg.body}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Templates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t)}
                className="w-full text-left rounded-lg border border-forge-border p-3 hover:bg-forge-surface-hover transition-colors"
              >
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-forge-muted mt-0.5 line-clamp-2">{t.body}</p>
                <Badge variant="outline" className="mt-2">{t.channel}</Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Dev Outbox</CardTitle>
          </CardHeader>
          <CardContent>
            {devOutbox.length === 0 ? (
              <p className="text-xs text-forge-muted">Sent messages appear here in dev mode.</p>
            ) : (
              <div className="space-y-2">
                {devOutbox.map((entry, i) => (
                  <p key={i} className="text-xs font-mono text-emerald-400 bg-emerald-500/5 rounded p-2">
                    {entry}
                  </p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
