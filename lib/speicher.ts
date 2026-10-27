/* Nur serverseitig: CSV-Datei mit allen Einsendungen. */
import { appendFile, mkdir, readFile, stat } from "node:fs/promises";
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
  const neu = await stat(datei).then(
    () => false,
    () => true
  );
  /* BOM, damit Excel Umlaute korrekt erkennt */
  await appendFile(datei, (neu ? "﻿" + csvHeader() + "\r\n" : "") + zeile + "\r\n", "utf8");
}

export async function csvLesen(): Promise<string> {
  return readFile(csvPfad(), "utf8").catch(() => "﻿" + csvHeader() + "\r\n");
}
