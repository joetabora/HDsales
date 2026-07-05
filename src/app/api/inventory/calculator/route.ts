import { NextResponse } from "next/server";
import { getDealershipId } from "@/lib/auth/session";
import { calculatePayment } from "@/lib/calculators/payment";
import { savePaymentQuote } from "@/server/services/deal.service";

export async function POST(request: Request) {
  try {
    const dealershipId = await getDealershipId();
    const body = await request.json();

    const input = {
      bikePrice: Number(body.bikePrice),
      tradeValue: body.tradeValue != null ? Number(body.tradeValue) : undefined,
      downPayment: body.downPayment != null ? Number(body.downPayment) : undefined,
      apr: Number(body.apr),
      termMonths: Number(body.termMonths),
      taxRate: body.taxRate != null ? Number(body.taxRate) : undefined,
      accessories: body.accessories != null ? Number(body.accessories) : undefined,
      warranty: body.warranty != null ? Number(body.warranty) : undefined,
      gap: body.gap != null ? Number(body.gap) : undefined,
    };

    const result = calculatePayment(input);

    if (body.save) {
      await savePaymentQuote(dealershipId, body.customerId, input);
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to calculate payment";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
