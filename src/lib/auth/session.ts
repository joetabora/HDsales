import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function getCurrentUser() {
  const session = await requireAuth();
  return session.user;
}

type SessionUser = NonNullable<Awaited<ReturnType<typeof getServerSession>>>["user"] & {
  dealershipId?: string;
};

export async function getDealershipId() {
  const session = await requireAuth();
  const dealershipId = (session.user as SessionUser).dealershipId;
  if (!dealershipId) {
    redirect("/login");
  }
  return dealershipId;
}
