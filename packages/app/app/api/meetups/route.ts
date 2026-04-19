import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";
import { getDb, initDb } from "@/lib/db/client";
import { createEventOnChain, isHostOnChain } from "@/lib/chain";
import { generateMasterNonce, computeQrHash } from "@/lib/qr";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      communityId,
      hostWallet,
      name,
      startTime,
      endTime,
      reputationReward = 0,
      minReputationRequired = 0,
    } = body as {
      communityId: number;
      hostWallet: string;
      name: string;
      startTime: number;
      endTime: number;
      reputationReward?: number;
      minReputationRequired?: number;
    };

    if (!communityId || !hostWallet || !name || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const checksummed = getAddress(hostWallet) as `0x${string}`;
    const host = await isHostOnChain(checksummed);
    if (!host) {
      return NextResponse.json({ error: "Not an approved host" }, { status: 403 });
    }

    await initDb();
    const db = getDb();

    const communityRow = await db.execute({
      sql: "SELECT id FROM communities WHERE id = ?",
      args: [communityId],
    });
    if (communityRow.rows.length === 0) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const masterNonce = generateMasterNonce();
    const qrHash = computeQrHash(BigInt(communityId), masterNonce);

    const meetupId = await createEventOnChain(
      BigInt(communityId),
      name,
      BigInt(startTime),
      BigInt(endTime),
      qrHash,
      BigInt(reputationReward),
      BigInt(minReputationRequired)
    );

    await db.execute({
      sql: `INSERT INTO meetups
              (id, community_id, name, start_time, end_time, master_nonce, qr_hash,
               reputation_reward, min_reputation_required, host_wallet)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        Number(meetupId),
        communityId,
        name,
        startTime,
        endTime,
        masterNonce,
        qrHash,
        reputationReward,
        minReputationRequired,
        checksummed,
      ],
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
    const masterMeetupQrUrl = `${appUrl}/check-in?type=meetup&meetupId=${meetupId}&communityId=${communityId}&nonce=${masterNonce}`;

    return NextResponse.json({ meetupId: Number(meetupId), masterMeetupQrUrl }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
