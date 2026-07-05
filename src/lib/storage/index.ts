import { mkdir, writeFile, readFile, unlink } from "fs/promises";
import path from "path";
import { nanoid } from "nanoid";
import { env } from "@/lib/env";

export interface StorageAdapter {
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>;
  delete(url: string): Promise<void>;
  getLocalPath?(url: string): string;
}

class LocalStorageAdapter implements StorageAdapter {
  private basePath: string;

  constructor() {
    this.basePath = path.resolve(env.LOCAL_STORAGE_PATH);
  }

  async upload(file: Buffer, filename: string, mimeType: string): Promise<string> {
    const ext = path.extname(filename) || this.extFromMime(mimeType);
    const key = `${nanoid()}${ext}`;
    const dir = path.join(this.basePath, "uploads");
    await mkdir(dir, { recursive: true });
    const filePath = path.join(dir, key);
    await writeFile(filePath, file);
    return `/api/v1/files/${key}`;
  }

  async delete(url: string): Promise<void> {
    const key = url.split("/").pop();
    if (!key) return;
    const filePath = path.join(this.basePath, "uploads", key);
    try {
      await unlink(filePath);
    } catch {
      // file may not exist
    }
  }

  getLocalPath(url: string): string {
    const key = url.split("/").pop()!;
    return path.join(this.basePath, "uploads", key);
  }

  private extFromMime(mime: string): string {
    const map: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "audio/webm": ".webm",
      "audio/mpeg": ".mp3",
      "application/pdf": ".pdf",
    };
    return map[mime] ?? ".bin";
  }
}

let storageInstance: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!storageInstance) {
    storageInstance = new LocalStorageAdapter();
  }
  return storageInstance;
}
