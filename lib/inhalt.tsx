/* Inhalt der Konsole (Texte, Kursbeschreibungen, Kundenstimmen, Bilder) und
   Hilfsfunktionen zur Darstellung. Browser-tauglich — keine Node-Importe. */
import { Fragment, type ReactNode } from "react";
import type { Texte } from "@/lib/texte-standard";

export type Stimme = { text: string; quelle: string; sterne: string };

export type Inhalt = {
  texte: Texte;
  /* je Programm-ID (lib/data.ts PROGRAMME) */
  programme: Record<string, { titel: string; text: string }>;
  /* je Angebots-ID (lib/data.ts ANGEBOTE) — nur die Beschreibung, der amtliche Titel bleibt fest */
  angebote: Record<string, { text: string }>;
  /* feste Anzahl Plätze; leere Stimmen werden nicht angezeigt */
  kundenstimmen: Stimme[];
  /* Bildpfade: logo, oscar, azav, iso, berater_<id> */
  bilder: Record<string, string>;
};

type Werte = Record<string, string | number>;

/* {name} -> Wert, {name:Einzahl|Mehrzahl} -> Wort passend zur Zahl */
export function fill(vorlage: string, werte: Werte = {}): string {
  return vorlage.replace(/\{(\w+)(?::([^|{}]*)\|([^{}]*))?\}/g, (ganz, name: string, eins?: string, mehr?: string) => {
    if (!(name in werte)) return ganz;
    const v = werte[name];
    if (eins !== undefined) return Number(v) === 1 ? eins : (mehr ?? "");
    return String(v);
  });
}

/* **fett** -> <strong>, Zeilenumbrüche bleiben über CSS (white-space) erhalten */
export function md(vorlage: string, werte?: Werte): ReactNode {
  const teile = fill(vorlage, werte).split(/\*\*(.+?)\*\*/g);
  return teile.map((t, i) => (i % 2 ? <strong key={i}>{t}</strong> : <Fragment key={i}>{t}</Fragment>));
}

/* Alle Platzhalter einer Vorlage, z. B. ["n"] — für Hinweise im Editor */
export function platzhalter(vorlage: string): string[] {
  return [...new Set([...vorlage.matchAll(/\{(\w+)(?::[^{}]*)?\}/g)].map((m) => m[1]))];
}

/* Setzt einen Text im verschachtelten Inhalt anhand des Pfads "a.b.0" —
   nur wenn dort bereits ein Text steht (unbekannte Pfade werden ignoriert) */
export function setzePfad(ziel: unknown, pfad: string, wert: string) {
  const teile = pfad.split(".");
  let o = ziel as Record<string, unknown>;
  for (const t of teile.slice(0, -1)) {
    if (!o || typeof o[t] !== "object") return;
    o = o[t] as Record<string, unknown>;
  }
  const letzter = teile[teile.length - 1];
  if (o && typeof o[letzter] === "string") o[letzter] = wert;
}

/* Feste Textstücke einer Vorlage (ohne Platzhalter und **), längste zuerst —
   damit findet die Live-Vorschau den Text auf der Seite wieder */
export function textStuecke(vorlage: string): string[] {
  return vorlage
    .split(/\{\w+(?::[^{}]*)?\}|\*\*|\n/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 2)
    .sort((a, b) => b.length - a.length);
}
