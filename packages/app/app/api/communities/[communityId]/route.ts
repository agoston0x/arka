import { NextRequest, NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: { communityId: string } }
) {
  try {
    const id = Number(params.communityId);
    await initDb();
    const db = getDb();
    const result = await db.execute({
      sql: `SELECT c.id, c.name, c.location, c.host_wallet,
                   COUNT(cm.wallet_address) AS member_count
            FROM communities c
            LEFT JOIN community_members cm ON cm.community_id = c.id
            WHERE c.id = ?
            GROUP BY c.id`,
      args: [id],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Community not found" }, { status: 404 });
    }

    const r = result.rows[0];
    return NextResponse.json({
      communityId: r.id,
      name: r.name,
      location: r.location,
      host: r.host_wallet,
      memberCount: Number(r.member_count),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
