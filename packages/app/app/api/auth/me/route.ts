import { NextRequest, NextResponse } from "next/server";
import { getAddress } from "viem";
import { getDb, initDb } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet");
    if (!wallet) {
      return NextResponse.json({ error: "wallet param required" }, { status: 400 });
    }

    const checksummed = getAddress(wallet);
    await initDb();
    const db = getDb();

    const result = await db.execute({
      sql: "SELECT token_id, username FROM users WHERE wallet_address = ?",
      args: [checksummed],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ exists: false });
    }

    const row = result.rows[0];
    return NextResponse.json({
      exists: true,
      tokenId: row.token_id,
      username: row.username,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
