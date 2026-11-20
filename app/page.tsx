import Konsole from "@/components/Konsole";
import { findeBerater, oeffentlich } from "@/lib/berater";

/* Berater-Link: /?berater=<id> (Liste in lib/berater.ts) */
export default async function Page({ searchParams }: { searchParams: Promise<{ berater?: string | string[] }> }) {
  const { berater } = await searchParams;
  return <Konsole berater={oeffentlich(findeBerater(Array.isArray(berater) ? berater[0] : berater))} />;
}
