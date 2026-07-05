export interface PaymentInput {
  bikePrice: number;
  tradeValue?: number;
  downPayment?: number;
  apr: number;
  termMonths: number;
  taxRate?: number;
  accessories?: number;
  warranty?: number;
  gap?: number;
}

export function calculatePayment(input: PaymentInput) {
  const trade = input.tradeValue ?? 0;
  const down = input.downPayment ?? 0;
  const tax = input.taxRate ?? 0;
  const accessories = input.accessories ?? 0;
  const warranty = input.warranty ?? 0;
  const gap = input.gap ?? 0;

  const subtotal = input.bikePrice + accessories + warranty + gap - trade - down;
  const taxedAmount = subtotal * (1 + tax / 100);
  const monthlyRate = input.apr / 100 / 12;
  const monthlyPayment =
    monthlyRate === 0
      ? taxedAmount / input.termMonths
      : (taxedAmount * monthlyRate * Math.pow(1 + monthlyRate, input.termMonths)) /
        (Math.pow(1 + monthlyRate, input.termMonths) - 1);

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalCost: Math.round(monthlyPayment * input.termMonths * 100) / 100,
    financedAmount: Math.round(taxedAmount * 100) / 100,
  };
}
