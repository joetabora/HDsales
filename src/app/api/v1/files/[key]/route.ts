import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { getStorage } from "@/lib/storage";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    const storage = getStorage();
    if (!storage.getLocalPath) {
      return NextResponse.json({ error: "Not supported" }, { status: 404 });
    }
    const filePath = storage.getLocalPath(`/api/v1/files/${key}`);
    const buffer = await readFile(filePath);
    const ext = key.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webm: "audio/webm",
      mp3: "audio/mpeg",
      pdf: "application/pdf",
    };
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeTypes[ext ?? ""] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
