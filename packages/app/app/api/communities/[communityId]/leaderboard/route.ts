import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";
import { getDb, initDb } from "@/lib/db/client";
import { getReputation } from "@/lib/chain";

export async function GET(
  _req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const communityId = BigInt(params.communityId);
    await initDb();
    const db = getDb();

    const members = await db.execute({
      sql: `SELECT cm.wallet_address, u.username
            FROM community_members cm
            LEFT JOIN users u ON u.wallet_address = cm.wallet_address
            WHERE cm.community_id = ?`,
      args: [Number(communityId)],
    });

    const entries = await Promise.all(
      members.rows.map(async (r) => {
        const wallet = r.wallet_address as string;
        const rep = await getReputation(getAddress(wallet) as `0x${string}`, communityId);
        return {
          wallet,
          username: r.username ?? null,
          reputation: Number(rep),
        };
      })
    );

    entries.sort((a, b) => b.reputation - a.reputation);
    const ranked = entries.map((e, i) => ({ ...e, rank: i + 1 }));

    return NextResponse.json(ranked);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
