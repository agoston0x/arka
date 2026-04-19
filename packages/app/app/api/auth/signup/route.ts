import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";
import { getDb, initDb } from "@/lib/db/client";
import { mintProfile, hasProfileOnChain } from "@/lib/chain";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wallet, username } = body as { wallet: string; username: string };
    if (!wallet || !username) {
      return NextResponse.json({ error: "wallet and username required" }, { status: 400 });
    }

    const checksummed = getAddress(wallet) as `0x${string}`;
    await initDb();
    const db = getDb();

    const existing = await db.execute({
      sql: "SELECT token_id FROM users WHERE wallet_address = ?",
      args: [checksummed],
    });
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Profile already exists" }, { status: 409 });
    }

    const tokenId = await mintProfile(checksummed, username);

    await db.execute({
      sql: "INSERT INTO users (wallet_address, username, token_id) VALUES (?, ?, ?)",
      args: [checksummed, username, Number(tokenId)],
    });

    return NextResponse.json(
      { tokenId: Number(tokenId), wallet: checksummed, username },
      { status: 201 }
    );
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
