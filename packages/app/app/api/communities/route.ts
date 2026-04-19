import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";
import { getDb, initDb } from "@/lib/db/client";
import { createCommunityOnChain, isHostOnChain } from "@/lib/chain";

export async function GET() {
  try {
    await initDb();
    const db = getDb();
    const result = await db.execute(`
      SELECT c.id, c.name, c.location, c.host_wallet,
             COUNT(cm.wallet_address) AS member_count
      FROM communities c
      LEFT JOIN community_members cm ON cm.community_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    const communities = result.rows.map((r) => ({
      communityId: r.id,
      name: r.name,
      location: r.location,
      memberCount: Number(r.member_count),
    }));
    return NextResponse.json(communities);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { hostWallet, name, location } = body as {
      hostWallet: string;
      name: string;
      location: string;
    };
    if (!hostWallet || !name || !location) {
      return NextResponse.json({ error: "hostWallet, name, location required" }, { status: 400 });
    }

    const checksummed = getAddress(hostWallet) as `0x${string}`;
    const host = await isHostOnChain(checksummed);
    if (!host) {
      return NextResponse.json({ error: "Not an approved host" }, { status: 403 });
    }

    await initDb();
    const communityId = await createCommunityOnChain(name, location);
    const db = getDb();

    await db.execute({
      sql: "INSERT OR IGNORE INTO communities (id, name, location, host_wallet) VALUES (?, ?, ?, ?)",
      args: [Number(communityId), name, location, checksummed],
    });

    return NextResponse.json({ communityId: Number(communityId), name, location }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
