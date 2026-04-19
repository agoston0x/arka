import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";
import { getDb, initDb } from "@/lib/db/client";

export async function GET(
  req: NextRequest,
  { params }: { params: { meetupId: string } }
) {
  try {
    const meetupId = Number(params.meetupId);
    const walletParam = req.nextUrl.searchParams.get("wallet");

    await initDb();
    const db = getDb();

    const result = await db.execute({
      sql: "SELECT id, community_id, name, start_time, end_time, finalized FROM meetups WHERE id = ?",
      args: [meetupId],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const m = result.rows[0];
    let callerProgress = null;

    if (walletParam) {
      const checksummed = getAddress(walletParam);
      const scans = await db.execute({
        sql: `SELECT scan_type, scannee_wallet FROM check_ins
              WHERE meetup_id = ? AND scanner_wallet = ?`,
        args: [meetupId, checksummed],
      });

      const meetupScan = scans.rows.some((r) => r.scan_type === "meetup");
      const memberScans = new Set(
        scans.rows
          .filter((r) => r.scan_type === "member" && r.scannee_wallet)
          .map((r) => r.scannee_wallet)
      ).size;

      callerProgress = {
        meetupScan,
        memberScans,
        qualified: meetupScan && memberScans >= 2,
      };
    }

    return NextResponse.json({
      meetupId: m.id,
      communityId: m.community_id,
      name: m.name,
      startTime: m.start_time,
      endTime: m.end_time,
      finalized: m.finalized === 1,
      callerProgress,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
