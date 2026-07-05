"use client";

import { openDB, type IDBPDatabase } from "idb";

interface OfflineAction {
  id: string;
  type: string;
  payload: unknown;
  createdAt: number;
  retries: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("forge-offline", 1, {
      upgrade(db) {
        db.createObjectStore("queue", { keyPath: "id" });
        db.createObjectStore("cache", { keyPath: "key" });
      },
    });
  }
  return dbPromise;
}

export async function enqueueOfflineAction(type: string, payload: unknown) {
  const db = await getDB();
  const action: OfflineAction = {
    id: crypto.randomUUID(),
    type,
    payload,
    createdAt: Date.now(),
    retries: 0,
  };
  await db.add("queue", action);
  return action.id;
}

export async function getOfflineQueue(): Promise<OfflineAction[]> {
  const db = await getDB();
  return db.getAll("queue");
}

export async function removeOfflineAction(id: string) {
  const db = await getDB();
  await db.delete("queue", id);
}

export async function replayOfflineQueue() {
  const queue = await getOfflineQueue();
  for (const action of queue) {
    try {
      const response = await fetch(`/api/v1/offline/${action.type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action.payload),
      });
      if (response.ok) {
        await removeOfflineAction(action.id);
      }
    } catch {
      // Will retry on next online event
    }
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    replayOfflineQueue();
  });
}
