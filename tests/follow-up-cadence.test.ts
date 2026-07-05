import { describe, it, expect } from "vitest";
import { WALK_IN_CADENCE } from "@/server/services/follow-up-cadence.service";

describe("WALK_IN_CADENCE", () => {
  it("defines 4 follow-up steps", () => {
    expect(WALK_IN_CADENCE).toHaveLength(4);
  });

  it("starts with next-day text", () => {
    expect(WALK_IN_CADENCE[0]).toMatchObject({
      delayDays: 1,
      title: "Send follow-up text",
      priority: "HIGH",
    });
  });

  it("ends with 30-day touch", () => {
    expect(WALK_IN_CADENCE[3]).toMatchObject({
      delayDays: 30,
      title: "30-day touch base",
    });
  });
});
