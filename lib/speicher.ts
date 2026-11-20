/* Nur serverseitig: CSV-Datei mit allen Einsendungen. */
import { appendFile, mkdir, readFile, rename } from "node:fs/promises";
import path from "node:path";
import { csvHeader } from "@/lib/submission";

/* SUBMISSIONS_CSV_PATH überschreibt den Standardpfad data/submissions.csv */
const csvPfad = () => process.env.SUBMISSIONS_CSV_PATH || path.join(process.cwd(), "data", "submissions.csv");

/* Auf Vercel ist das Dateisystem schreibgeschützt — dort keine CSV-Datei,
   es sei denn, SUBMISSIONS_CSV_PATH zeigt ausdrücklich auf einen Pfad */
export const csvAktiv = () => !process.env.VERCEL || !!process.env.SUBMISSIONS_CSV_PATH;

export async function anCsvAnhaengen(zeile: string) {
  const datei = csvPfad();
  await mkdir(path.dirname(datei), { recursive: true });
  /* Kopfzeile geändert (neue Spalten)? Alte Datei beiseitelegen statt
     Zeilen mit abweichender Spaltenzahl anzuhängen. */
  const kopf = await readFile(datei, "utf8").then(
    (t) => t.replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0],
    () => null
  );
  if (kopf !== null && kopf !== csvHeader()) {
    await rename(datei, datei.replace(/\.csv$/i, "") + "-bis-" + new Date().toISOString().slice(0, 10) + ".csv");
  }
  const neu = kopf === null || kopf !== csvHeader();
  /* BOM, damit Excel Umlaute korrekt erkennt */
  await appendFile(datei, (neu ? "﻿" + csvHeader() + "\r\n" : "") + zeile + "\r\n", "utf8");
}

export async function csvLesen(): Promise<string> {
  return readFile(csvPfad(), "utf8").catch(() => "﻿" + csvHeader() + "\r\n");
}
