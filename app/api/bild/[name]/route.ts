import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { bildOrdner, MIME } from "@/lib/inhalt-speicher";

export const runtime = "nodejs";

/* Hochgeladene Bilder aus dem Admin-Bereich. Dateinamen sind zufällig und
   werden nie überschrieben — daher dauerhaft cachebar. */
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const m = /^[a-f0-9]{24}\.(png|jpg|webp|gif)$/.exec(name);
  if (!m) return new NextResponse(null, { status: 404 });
  try {
    const daten = await readFile(path.join(bildOrdner(), name));
    return new NextResponse(new Uint8Array(daten), {
      headers: {
        "Content-Type": MIME[m[1]],
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
