import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";
import { getDb, initDb } from "@/lib/db/client";
import { finalizeEventOnChain } from "@/lib/chain";

export async function POST(
  req: NextRequest,
  { params }: { params: { meetupId: string } }
) {
  try {
    const meetupId = Number(params.meetupId);
    const body = await req.json();
    const { hostWallet } = body as { hostWallet: string };
    if (!hostWallet) {
      return NextResponse.json({ error: "hostWallet required" }, { status: 400 });
    }

    const checksummed = getAddress(hostWallet);
    await initDb();
    const db = getDb();

    const meetupRow = await db.execute({
      sql: "SELECT host_wallet, finalized, end_time FROM meetups WHERE id = ?",
      args: [meetupId],
    });

    if (meetupRow.rows.length === 0) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const meetup = meetupRow.rows[0];
    if (meetup.finalized === 1) {
      return NextResponse.json({ error: "Already finalized" }, { status: 400 });
    }
    if (getAddress(meetup.host_wallet as string) !== checksummed) {
      return NextResponse.json({ error: "Not the host" }, { status: 403 });
    }

    const qualifiedResult = await db.execute({
      sql: `SELECT scanner_wallet AS wallet,
              SUM(CASE WHEN scan_type = 'meetup' THEN 1 ELSE 0 END) AS meetup_scans,
              COUNT(DISTINCT CASE WHEN scan_type = 'member' THEN scannee_wallet END) AS member_scans
            FROM check_ins
            WHERE meetup_id = ?
            GROUP BY scanner_wallet
            HAVING meetup_scans >= 1 AND member_scans >= 2`,
      args: [meetupId],
    });

    const attendees = qualifiedResult.rows.map(
      (r) => getAddress(r.wallet as string) as `0x${string}`
    );

    const txHash = await finalizeEventOnChain(BigInt(meetupId), attendees);

    await db.execute({
      sql: "UPDATE meetups SET finalized = 1, finalize_tx_hash = ? WHERE id = ?",
      args: [txHash, meetupId],
    });

    return NextResponse.json({ txnHash: txHash, attendeeCount: attendees.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
