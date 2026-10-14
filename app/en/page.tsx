import type { Metadata } from "next";
import Konsole from "@/components/Konsole";

export const metadata: Metadata = {
  title: "Funding Plan Console",
  description: "Interactive consultation on the education voucher (Bildungsgutschein) — Seminarkontor GmbH",
};

export default function Page() {
  return <Konsole lang="en" />;
}
