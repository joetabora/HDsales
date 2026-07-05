import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getCurrentUser, getDealershipId } from "@/lib/auth/session";

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    const dealershipId = await getDealershipId();
    const body = await request.json();

    await db.user.update({
      where: { id: user.id },
      data: {
        ...(body.name ? { name: body.name } : {}),
        ...(body.phone !== undefined ? { phone: body.phone || null } : {}),
        ...(body.title !== undefined ? { title: body.title || null } : {}),
        ...(body.bio !== undefined ? { bio: body.bio || null } : {}),
      },
    });

    if (body.dealership) {
      await db.dealership.update({
        where: { id: dealershipId },
        data: {
          ...(body.dealership.name ? { name: body.dealership.name } : {}),
          ...(body.dealership.phone !== undefined ? { phone: body.dealership.phone || null } : {}),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save settings";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
