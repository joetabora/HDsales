import { describe, it, expect } from "vitest";
import { calculatePayment } from "@/lib/calculators/payment";

describe("calculatePayment", () => {
  it("calculates monthly payment correctly", () => {
    const result = calculatePayment({
      bikePrice: 32999,
      tradeValue: 15000,
      downPayment: 2000,
      apr: 6.99,
      termMonths: 72,
      taxRate: 5.5,
      accessories: 1500,
      warranty: 2000,
      gap: 800,
    });

    expect(result.monthlyPayment).toBeGreaterThan(0);
    expect(result.monthlyPayment).toBeLessThan(600);
    expect(result.totalCost).toBeGreaterThan(result.financedAmount);
  });

  it("handles zero APR", () => {
    const result = calculatePayment({
      bikePrice: 20000,
      apr: 0,
      termMonths: 36,
    });

    expect(result.monthlyPayment).toBeCloseTo(result.financedAmount / 36, 0);
  });
});
