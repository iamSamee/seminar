import { NextResponse } from "next/server";
import { adminAktiv, clientIp, COOKIE, erfolg, fehlversuch, gesperrt, neuesToken, passwortRichtig } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  if (!adminAktiv()) return NextResponse.json({ ok: false, error: "inaktiv" }, { status: 404 });
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) return NextResponse.json({ ok: false }, { status: 403 });

  const ip = clientIp(req);
  if (gesperrt(ip)) return NextResponse.json({ ok: false, error: "gesperrt" }, { status: 429 });

  const daten = (await req.json().catch(() => null)) as { passwort?: unknown } | null;
  const eingabe = typeof daten?.passwort === "string" ? daten.passwort.slice(0, 200) : "";
  if (!passwortRichtig(eingabe)) {
    fehlversuch(ip);
    return NextResponse.json({ ok: false, error: "falsch" }, { status: 401 });
  }
  erfolg(ip);
  const { wert, maxAge } = neuesToken();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, wert, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
  return res;
}
