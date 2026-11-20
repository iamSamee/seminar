import { NextResponse } from "next/server";
import { pruefeAnfrage } from "@/lib/admin-auth";
import { bildSpeichern, MAX_BILD } from "@/lib/inhalt-speicher";

export const runtime = "nodejs";

/* Lädt ein Bild hoch und liefert seinen Pfad. Übernommen wird es erst,
   wenn der Editor speichert. */
export async function POST(req: Request) {
  const fehlerAntwort = await pruefeAnfrage(req);
  if (fehlerAntwort) return fehlerAntwort;

  const laenge = Number(req.headers.get("content-length") || 0);
  if (laenge > MAX_BILD + 100_000) return NextResponse.json({ ok: false, error: "zu_gross" }, { status: 413 });

  const form = await req.formData().catch(() => null);
  const datei = form?.get("datei");
  if (!(datei instanceof File)) return NextResponse.json({ ok: false, error: "keine_datei" }, { status: 400 });
  if (datei.size > MAX_BILD) return NextResponse.json({ ok: false, error: "zu_gross" }, { status: 413 });

  const pfad = await bildSpeichern(Buffer.from(await datei.arrayBuffer()));
  if (!pfad) return NextResponse.json({ ok: false, error: "typ" }, { status: 415 });
  return NextResponse.json({ ok: true, pfad });
}
