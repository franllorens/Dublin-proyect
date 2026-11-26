import { NextRequest, NextResponse } from "next/server";
import { orderStatus } from "@/src/lib/orders";

/** Site polls this for the customer's ticket: { number, status }. The id is an unguessable uuid. */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  const o = await orderStatus(params.id);
  return o ? NextResponse.json(o) : NextResponse.json({ error: "Order not found." }, { status: 404 });
}
