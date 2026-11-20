import { NextResponse } from "next/server";
import { findeBerater } from "@/lib/berater";
import { leadMailSenden } from "@/lib/mail";
import { anCsvAnhaengen, csvAktiv } from "@/lib/speicher";
import { csvHeader, csvRow, flatten, isSubmission } from "@/lib/submission";

export const runtime = "nodejs";

/* Konfiguration über Umgebungsvariablen (siehe .env.example):
   WEBHOOK_URL           Ziel für den JSON-POST (z. B. Make, Zapier, n8n)
   SUBMISSIONS_CSV_PATH  CSV-Datei, an die jede Einsendung angehängt wird
   GRAPH_* / SMTP_*      E-Mail an den zuständigen Berater (lib/mail.ts) */
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

  /* Berater immer serverseitig aus der Liste bestimmen — nie eine
     E-Mail-Adresse aus dem Browser übernehmen */
  const berater = findeBerater(daten.advisor);
  daten.advisor = berater.id;

  const zeile = csvRow(daten);
  const csvDatei = csvHeader() + "\r\n" + zeile + "\r\n";
  const csvName = "submission-" + daten.submittedAt.replace(/[:.]/g, "-") + ".csv";

  const [csv, webhook, mail] = await Promise.all([
    csvAktiv()
      ? anCsvAnhaengen(zeile).then(
          () => true,
          (e) => {
            console.error("[submit] CSV konnte nicht geschrieben werden:", e);
            return false;
          }
        )
      : false,
    process.env.WEBHOOK_URL
      ? fetch(process.env.WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "form_submission",
            ...daten,
            flat: flatten(daten),
            /* fertige CSV (Kopfzeile + Datenzeile) und Dateiname für den Empfänger */
            csv: csvDatei,
            csvFilename: csvName,
          }),
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
    /* BOM, damit Excel den Anhang mit Umlauten korrekt öffnet */
    leadMailSenden(daten, berater, "\uFEFF" + csvDatei, csvName),
  ]);

  if (webhook === null) console.warn("[submit] WEBHOOK_URL ist nicht gesetzt.");
  if (mail === null) console.warn("[submit] Kein E-Mail-Versand konfiguriert (GRAPH_* oder SMTP_* fehlt).");

  /* Erfolgreich, sobald die Einsendung mindestens an einer Stelle gespeichert ist */
  const ok = csv || webhook === true || mail === true;
  return NextResponse.json({ ok, csv, webhook, mail }, { status: ok ? 200 : 502 });
}
