import { NextResponse } from "next/server";
import db from "@/lib/db";
import { getDealershipId } from "@/lib/auth/session";

export async function GET(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim();

    const articles = await db.knowledgeArticle.findMany({
      where: {
        dealershipId,
        deletedAt: null,
        isPublished: true,
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { content: { contains: q, mode: "insensitive" } },
                { category: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: [{ category: "asc" }, { title: "asc" }],
    });

    return NextResponse.json(articles);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to search knowledge";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
