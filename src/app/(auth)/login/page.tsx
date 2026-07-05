"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signIn } from "@/lib/auth/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);
  const [error, setError] = useState("");

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn.email({ email, password });

    if (result.error) {
      setError(result.error.message ?? "Invalid credentials");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn.magicLink({ email, callbackURL: "/dashboard" });

    if (result.error) {
      setError(result.error.message ?? "Failed to send magic link");
      setLoading(false);
      return;
    }

    setMagicSent(true);
    setLoading(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="border-forge-border bg-forge-surface/80 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forge-accent shadow-lg shadow-forge-accent/30">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Welcome to Forge</CardTitle>
            <CardDescription className="text-forge-muted-foreground mt-1">
              AI-powered sales OS for powersports dealers
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex rounded-lg bg-forge-background p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                mode === "password"
                  ? "bg-forge-surface text-forge-foreground shadow-sm"
                  : "text-forge-muted hover:text-forge-foreground"
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode("magic")}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                mode === "magic"
                  ? "bg-forge-surface text-forge-foreground shadow-sm"
                  : "text-forge-muted hover:text-forge-foreground"
              }`}
            >
              Magic Link
            </button>
          </div>

          {magicSent ? (
            <div className="text-center py-6 space-y-3">
              <Mail className="h-10 w-10 text-forge-accent mx-auto" />
              <p className="text-sm text-forge-foreground font-medium">Check your email</p>
              <p className="text-xs text-forge-muted">
                We sent a magic link to <span className="text-forge-accent">{email}</span>
              </p>
            </div>
          ) : (
            <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@dealership.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {mode === "password" && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === "password" ? "Sign in" : "Send magic link"}
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-forge-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-forge-accent hover:underline font-medium">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
