/* Nur serverseitig: Standardinhalt + Änderungen aus dem Admin-Bereich.

   Ablage (Standard data/inhalt/, änderbar über CONTENT_DIR):
     aenderungen.json      nur die geänderten Felder, { "pfad.zum.feld": "Text" }
     versionen/*.json      Sicherung vor jedem Speichern (die letzten 50)
     bilder/*              hochgeladene Bilder, ausgeliefert über /api/bild/<datei>
   data/ liegt nicht im Git-Repository — ein Deploy überschreibt nichts davon. */
import { randomBytes } from "node:crypto";
import { mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { BERATER } from "@/lib/berater";
import { ANGEBOTE, PROGRAMME, STANDARD_BILDER } from "@/lib/data";
import { setzePfad, type Inhalt } from "@/lib/inhalt";
import { STANDARD_TEXTE } from "@/lib/texte-standard";

export type Aenderungen = Record<string, string>;

const ANZAHL_STIMMEN = 6;
const MAX_VERSIONEN = 50;
const MAX_TEXT = 10_000;

export const inhaltOrdner = () => process.env.CONTENT_DIR || path.join(process.cwd(), "data", "inhalt");
const aenderungsDatei = () => path.join(inhaltOrdner(), "aenderungen.json");
const versionsOrdner = () => path.join(inhaltOrdner(), "versionen");
export const bildOrdner = () => path.join(inhaltOrdner(), "bilder");

/* ---------- Standardinhalt ---------- */
export function standardInhalt(): Inhalt {
  return {
    texte: STANDARD_TEXTE,
    programme: Object.fromEntries(PROGRAMME.map((p) => [p.id, { titel: p.titel, text: p.text }])),
    angebote: Object.fromEntries(
      Object.values(ANGEBOTE)
        .flat()
        .map((a) => [a.id, { text: a.text }])
    ),
    kundenstimmen: Array.from({ length: ANZAHL_STIMMEN }, () => ({ text: "", quelle: "", sterne: "" })),
    bilder: {
      ...STANDARD_BILDER,
      ...Object.fromEntries(BERATER.map((b) => ["berater_" + b.id, b.foto ?? ""])),
    },
  };
}

/* Verschachteltes Objekt -> { "a.b.0": "Text" } (nur Texte) */
export function flach(obj: unknown, prefix = ""): Aenderungen {
  const out: Aenderungen = {};
  if (typeof obj === "string") out[prefix] = obj;
  else if (obj && typeof obj === "object")
    for (const [k, v] of Object.entries(obj)) Object.assign(out, flach(v, prefix ? prefix + "." + k : k));
  return out;
}

/* ---------- Lesen ---------- */
async function leseJson<T>(datei: string, ersatz: T): Promise<T> {
  try {
    return JSON.parse(await readFile(datei, "utf8")) as T;
  } catch {
    return ersatz;
  }
}

export async function ladeAenderungen(): Promise<Aenderungen> {
  const roh = await leseJson<Aenderungen>(aenderungsDatei(), {});
  return bereinigen(roh).sauber;
}

export async function ladeInhalt(): Promise<Inhalt> {
  const inhalt = structuredClone(standardInhalt());
  for (const [pfad, wert] of Object.entries(await ladeAenderungen())) setzePfad(inhalt, pfad, wert);
  return inhalt;
}

/* ---------- Prüfen ---------- */
const BILD_RE = /^\/api\/bild\/[a-f0-9]{24}\.(png|jpg|webp|gif)$/;

/* Nur bekannte Felder, nur Texte, keine Werte gleich dem Standard */
export function bereinigen(roh: unknown): { sauber: Aenderungen; fehler: string[] } {
  const standard = flach(standardInhalt());
  const sauber: Aenderungen = {};
  const fehler: string[] = [];
  if (!roh || typeof roh !== "object") return { sauber, fehler: ["Ungültige Daten"] };
  for (const [pfad, wert] of Object.entries(roh as Record<string, unknown>)) {
    if (!(pfad in standard)) continue; /* Feld gibt es nicht (mehr) — still ignorieren */
    if (typeof wert !== "string") {
      fehler.push(pfad + ": kein Text");
      continue;
    }
    if (wert.length > MAX_TEXT) {
      fehler.push(pfad + ": zu lang");
      continue;
    }
    if (pfad.startsWith("bilder.") && wert !== standard[pfad] && !BILD_RE.test(wert)) {
      fehler.push(pfad + ": ungültiger Bildpfad");
      continue;
    }
    if (wert !== standard[pfad]) sauber[pfad] = wert;
  }
  return { sauber, fehler };
}

/* ---------- Schreiben ---------- */
async function schreibeAtomar(datei: string, inhalt: string) {
  await mkdir(path.dirname(datei), { recursive: true });
  const tmp = datei + "." + randomBytes(4).toString("hex") + ".tmp";
  await writeFile(tmp, inhalt, "utf8");
  await rename(tmp, datei);
}

export async function speichereAenderungen(neu: Aenderungen) {
  const alt = await leseJson<Aenderungen | null>(aenderungsDatei(), null);
  if (alt) {
    /* Sicherung des bisherigen Stands */
    const name = new Date().toISOString().replace(/[:.]/g, "-") + ".json";
    await schreibeAtomar(path.join(versionsOrdner(), name), JSON.stringify(alt, null, 2));
    const liste = (await versionen()).slice(MAX_VERSIONEN);
    await Promise.all(liste.map((v) => rm(path.join(versionsOrdner(), v.name), { force: true })));
  }
  await schreibeAtomar(aenderungsDatei(), JSON.stringify(neu, null, 2));
}

/* neueste zuerst */
export async function versionen(): Promise<{ name: string; zeit: string; anzahl: number }[]> {
  const namen = await readdir(versionsOrdner()).catch(() => [] as string[]);
  const liste = namen.filter((n) => /^[\w-]+\.json$/.test(n)).sort().reverse();
  return Promise.all(
    liste.map(async (name) => {
      const daten = await leseJson<Aenderungen>(path.join(versionsOrdner(), name), {});
      /* 2026-11-20T15-04-05-123Z -> ISO */
      const zeit = name.replace(/\.json$/, "").replace(/T(\d\d)-(\d\d)-(\d\d)-(\d+)Z/, "T$1:$2:$3.$4Z");
      return { name, zeit, anzahl: Object.keys(daten).length };
    })
  );
}

export async function ladeVersion(name: string): Promise<Aenderungen | null> {
  if (!/^[\w-]+\.json$/.test(name)) return null;
  const daten = await leseJson<Aenderungen | null>(path.join(versionsOrdner(), name), null);
  return daten && bereinigen(daten).sauber;
}

/* ---------- Bilder ---------- */
const TYPEN: { ext: string; mime: string; passt: (b: Buffer) => boolean }[] = [
  { ext: "png", mime: "image/png", passt: (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: "jpg", mime: "image/jpeg", passt: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "webp", mime: "image/webp", passt: (b) => b.subarray(0, 4).toString("latin1") === "RIFF" && b.subarray(8, 12).toString("latin1") === "WEBP" },
  { ext: "gif", mime: "image/gif", passt: (b) => /^GIF8[79]a$/.test(b.subarray(0, 6).toString("latin1")) },
];
export const MIME = Object.fromEntries(TYPEN.map((t) => [t.ext, t.mime]));
export const MAX_BILD = 5 * 1024 * 1024;

/* Prüft den Dateiinhalt (nicht nur die Endung) und legt das Bild ab.
   SVG ist bewusst nicht erlaubt (kann Skripte enthalten). */
export async function bildSpeichern(daten: Buffer): Promise<string | null> {
  const typ = TYPEN.find((t) => t.passt(daten));
  if (!typ) return null;
  const name = randomBytes(12).toString("hex") + "." + typ.ext;
  await mkdir(bildOrdner(), { recursive: true });
  await writeFile(path.join(bildOrdner(), name), daten);
  return "/api/bild/" + name;
}
