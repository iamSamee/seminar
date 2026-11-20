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
