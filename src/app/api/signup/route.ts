import { NextResponse } from "next/server";
import db from "@/lib/db";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, dealershipName } = body;

    if (!name || !email || !password || !dealershipName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const slug = slugify(dealershipName);
    let dealership = await db.dealership.findUnique({ where: { slug } });

    if (!dealership) {
      dealership = await db.dealership.create({
        data: { name: dealershipName, slug },
      });
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const { auth } = await import("@/lib/auth");
    const result = await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        dealershipId: dealership.id,
      },
    });

    if (!result) {
      return NextResponse.json({ error: "Signup failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
