import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";
import { getDb, initDb } from "@/lib/db/client";
import { verifyMemberNonce } from "@/lib/qr";

async function getProgress(
  db: Awaited<ReturnType<typeof getDb>>,
  meetupId: number,
  scanner: string
) {
  const scans = await db.execute({
    sql: `SELECT scan_type, scannee_wallet FROM check_ins
          WHERE meetup_id = ? AND scanner_wallet = ?`,
    args: [meetupId, scanner],
  });

  const meetupScan = scans.rows.some((r) => r.scan_type === "meetup");
  const memberScans = new Set(
    scans.rows
      .filter((r) => r.scan_type === "member" && r.scannee_wallet)
      .map((r) => r.scannee_wallet)
  ).size;

  return { meetupScan, memberScans, qualified: meetupScan && memberScans >= 2 };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, meetupId, scanner } = body as {
      type: "meetup" | "member";
      meetupId: number;
      scanner: string;
      communityId?: number;
      nonce?: string;
      scannee?: string;
      key?: string;
    };

    if (!type || !meetupId || !scanner) {
      return NextResponse.json({ error: "type, meetupId, scanner required" }, { status: 400 });
    }

    const scannerAddr = getAddress(scanner);
    await initDb();
    const db = getDb();

    const meetupRow = await db.execute({
      sql: "SELECT start_time, end_time, master_nonce FROM meetups WHERE id = ?",
      args: [meetupId],
    });

    if (meetupRow.rows.length === 0) {
      return NextResponse.json({ error: "Meetup not found" }, { status: 404 });
    }

    const meetup = meetupRow.rows[0];
    const now = Math.floor(Date.now() / 1000);
    if (now < Number(meetup.start_time) || now > Number(meetup.end_time)) {
      return NextResponse.json({ error: "Check-in window not active" }, { status: 400 });
    }

    if (type === "meetup") {
      const { nonce } = body as { nonce: string };
      if (!nonce) {
        return NextResponse.json({ error: "nonce required for meetup scan" }, { status: 400 });
      }
      if (nonce !== (meetup.master_nonce as string)) {
        return NextResponse.json({ error: "Invalid nonce" }, { status: 400 });
      }

      await db.execute({
        sql: `INSERT OR IGNORE INTO check_ins (meetup_id, scanner_wallet, scan_type, scannee_wallet)
              VALUES (?, ?, 'meetup', NULL)`,
        args: [meetupId, scannerAddr],
      });
    } else if (type === "member") {
      const { scannee, key } = body as { scannee: string; key: string };
      if (!scannee || !key) {
        return NextResponse.json({ error: "scannee and key required for member scan" }, { status: 400 });
      }

      const scanneeAddr = getAddress(scannee) as `0x${string}`;
      if (scanneeAddr === scannerAddr) {
        return NextResponse.json({ error: "Cannot scan yourself" }, { status: 400 });
      }

      const masterNonce = meetup.master_nonce as `0x${string}`;
      const valid = verifyMemberNonce(masterNonce, scanneeAddr, key as `0x${string}`);
      if (!valid) {
        return NextResponse.json({ error: "Invalid member key" }, { status: 400 });
      }

      await db.execute({
        sql: `INSERT OR IGNORE INTO check_ins (meetup_id, scanner_wallet, scan_type, scannee_wallet)
              VALUES (?, ?, 'member', ?)`,
        args: [meetupId, scannerAddr, scanneeAddr],
      });
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }

    const progress = await getProgress(db, meetupId, scannerAddr);
    return NextResponse.json(progress);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
