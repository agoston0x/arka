import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";
import { getDb, initDb } from "@/lib/db/client";
import { joinCommunityOnChain, hasProfileOnChain } from "@/lib/chain";

export async function POST(
  req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const communityId = BigInt(params.communityId);
    const body = await req.json();
    const { wallet } = body as { wallet: string };
    if (!wallet) {
      return NextResponse.json({ error: "wallet required" }, { status: 400 });
    }

    const checksummed = getAddress(wallet) as `0x${string}`;
    await initDb();
    const db = getDb();

    const communityRow = await db.execute({
      sql: "SELECT id FROM communities WHERE id = ?",
      args: [Number(communityId)],
    });
    if (communityRow.rows.length === 0) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const hasProfile = await hasProfileOnChain(checksummed);
    if (!hasProfile) {
      return NextResponse.json({ error: "Must have a profile first" }, { status: 400 });
    }

    await joinCommunityOnChain(communityId, checksummed);

    await db.execute({
      sql: "INSERT OR IGNORE INTO community_members (community_id, wallet_address) VALUES (?, ?)",
      args: [Number(communityId), checksummed],
    });

    return NextResponse.json({ joined: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
