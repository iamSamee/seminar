import type { Metadata } from "next";
import Konsole from "@/components/Konsole";
import VorschauKonsole from "@/components/admin/VorschauKonsole";
import { angemeldet } from "@/lib/admin-auth";
import { findeBerater, oeffentlich } from "@/lib/berater";
import { ladeInhalt } from "@/lib/inhalt-speicher";

/* Inhalte aus dem Admin-Bereich wirken sofort — daher bei jedem Aufruf laden */
export const dynamic = "force-dynamic";

type Params = { berater?: string | string[]; vorschau?: string };

export async function generateMetadata(): Promise<Metadata> {
  const { texte } = await ladeInhalt();
  return { title: texte.meta.titel, description: texte.meta.beschreibung };
}

/* Berater-Link: /?berater=<id> (Liste in lib/berater.ts)
   Live-Vorschau für den Admin-Bereich: /?vorschau=1 (nur angemeldet) */
export default async function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const { berater, vorschau } = await searchParams;
  const b = findeBerater(Array.isArray(berater) ? berater[0] : berater);
  const inhalt = await ladeInhalt();
  if (vorschau === "1" && (await angemeldet())) {
    return <VorschauKonsole berater={oeffentlich(b)} start={inhalt} />;
  }
  return <Konsole berater={{ ...oeffentlich(b), foto: inhalt.bilder["berater_" + b.id] || undefined }} inhalt={inhalt} />;
}
