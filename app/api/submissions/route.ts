import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { csvLesen } from "@/lib/speicher";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Download aller Einsendungen als CSV: /api/submissions?key=<EXPORT_KEY>
   Ohne gesetzten EXPORT_KEY ist der Download abgeschaltet. */
export async function GET(req: Request) {
  const soll = process.env.EXPORT_KEY;
  const ist = new URL(req.url).searchParams.get("key") ?? "";
  const a = Buffer.from(ist);
  const b = Buffer.from(soll ?? "");
  if (!soll || a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  return new NextResponse(await csvLesen(), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="submissions.csv"',
      "Cache-Control": "no-store",
    },
  });
}
