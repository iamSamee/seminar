import { NextResponse } from "next/server";
import { anCsvAnhaengen } from "@/lib/speicher";
import { csvRow, flatten, isSubmission } from "@/lib/submission";

export const runtime = "nodejs";

/* Konfiguration über Umgebungsvariablen (siehe .env.example):
   WEBHOOK_URL           Ziel für den JSON-POST (z. B. Make, Zapier, n8n)
   SUBMISSIONS_CSV_PATH  CSV-Datei, an die jede Einsendung angehängt wird */
const MAX_BYTES = 100_000;

export async function POST(req: Request) {
  const roh = await req.text();
  if (roh.length > MAX_BYTES) return NextResponse.json({ ok: false, error: "too_large" }, { status: 413 });

  let daten: unknown;
  try {
    daten = JSON.parse(roh);
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!isSubmission(daten)) return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });

  const zeile = csvRow(daten);

  const [csv, webhook] = await Promise.all([
    anCsvAnhaengen(zeile).then(
      () => true,
      (e) => {
        console.error("[submit] CSV konnte nicht geschrieben werden:", e);
        return false;
      }
    ),
    process.env.WEBHOOK_URL
      ? fetch(process.env.WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ event: "form_submission", ...daten, flat: flatten(daten) }),
          signal: AbortSignal.timeout(10_000),
        }).then(
          (r) => {
            if (!r.ok) console.error("[submit] Webhook antwortete mit", r.status);
            return r.ok;
          },
          (e) => {
            console.error("[submit] Webhook nicht erreichbar:", e);
            return false;
          }
        )
      : null,
  ]);

  if (webhook === null) console.warn("[submit] WEBHOOK_URL ist nicht gesetzt — nur CSV gespeichert.");

  /* Erfolgreich, sobald die Einsendung mindestens an einer Stelle gespeichert ist */
  const ok = csv || webhook === true;
  return NextResponse.json({ ok, csv, webhook }, { status: ok ? 200 : 502 });
}
