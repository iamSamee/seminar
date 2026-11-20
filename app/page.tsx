import type { Metadata } from "next";
import Konsole from "@/components/Konsole";
import { findeBerater, oeffentlich } from "@/lib/berater";
import { ladeInhalt } from "@/lib/inhalt-speicher";

/* Inhalte aus dem Admin-Bereich wirken sofort — daher bei jedem Aufruf laden */
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { texte } = await ladeInhalt();
  return { title: texte.meta.titel, description: texte.meta.beschreibung };
}

/* Berater-Link: /?berater=<id> (Liste in lib/berater.ts) */
export default async function Page({ searchParams }: { searchParams: Promise<{ berater?: string | string[] }> }) {
  const { berater } = await searchParams;
  const b = findeBerater(Array.isArray(berater) ? berater[0] : berater);
  const inhalt = await ladeInhalt();
  return <Konsole berater={{ ...oeffentlich(b), foto: inhalt.bilder["berater_" + b.id] || undefined }} inhalt={inhalt} />;
}
