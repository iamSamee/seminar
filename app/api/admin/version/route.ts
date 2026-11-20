import { NextResponse } from "next/server";
import { pruefeAnfrage } from "@/lib/admin-auth";
import { ladeVersion } from "@/lib/inhalt-speicher";

export const runtime = "nodejs";

/* Liefert eine gesicherte Version — der Editor übernimmt sie, gespeichert
   wird erst mit "Speichern" (dabei entsteht wieder eine Sicherung). */
export async function POST(req: Request) {
  const fehlerAntwort = await pruefeAnfrage(req);
  if (fehlerAntwort) return fehlerAntwort;
  const { name } = ((await req.json().catch(() => null)) ?? {}) as { name?: unknown };
  const daten = typeof name === "string" ? await ladeVersion(name) : null;
  if (!daten) return NextResponse.json({ ok: false, error: "nicht_gefunden" }, { status: 404 });
  return NextResponse.json({ ok: true, aenderungen: daten });
}
