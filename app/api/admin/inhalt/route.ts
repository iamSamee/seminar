import { NextResponse } from "next/server";
import { pruefeAnfrage } from "@/lib/admin-auth";
import { bereinigen, speichereAenderungen, versionen } from "@/lib/inhalt-speicher";

export const runtime = "nodejs";

/* Speichert den kompletten Stand der Änderungen (nur abweichende Felder) */
export async function PUT(req: Request) {
  const fehlerAntwort = await pruefeAnfrage(req);
  if (fehlerAntwort) return fehlerAntwort;

  const roh = await req.text();
  if (roh.length > 2_000_000) return NextResponse.json({ ok: false, error: "zu_gross" }, { status: 413 });
  let daten: unknown;
  try {
    daten = JSON.parse(roh);
  } catch {
    return NextResponse.json({ ok: false, error: "json" }, { status: 400 });
  }
  const { sauber, fehler } = bereinigen((daten as { aenderungen?: unknown })?.aenderungen);
  if (fehler.length) return NextResponse.json({ ok: false, error: "ungueltig", fehler }, { status: 400 });

  await speichereAenderungen(sauber);
  return NextResponse.json({ ok: true, aenderungen: sauber, versionen: await versionen() });
}
