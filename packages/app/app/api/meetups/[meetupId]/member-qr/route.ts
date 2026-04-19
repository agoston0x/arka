import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";
import { getDb, initDb } from "@/lib/db/client";
import { deriveMemberNonce } from "@/lib/qr";

export async function GET(
  req: NextRequest,
  { params }: { params: { meetupId: string } }
) {
  try {
    const meetupId = Number(params.meetupId);
    const walletParam = req.nextUrl.searchParams.get("wallet");
    if (!walletParam) {
      return NextResponse.json({ error: "wallet param required" }, { status: 400 });
    }

    const checksummed = getAddress(walletParam) as `0x${string}`;
    await initDb();
    const db = getDb();

    const result = await db.execute({
      sql: "SELECT master_nonce FROM meetups WHERE id = ?",
      args: [meetupId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const masterNonce = result.rows[0].master_nonce as `0x${string}`;
    const memberNonce = deriveMemberNonce(masterNonce, checksummed);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const qrUrl = `${appUrl}/check-in?type=member&meetupId=${meetupId}&scannee=${checksummed}&key=${memberNonce}`;

    return NextResponse.json({ qrUrl });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
