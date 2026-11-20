/* Nur serverseitig: Anmeldung für den Admin-Bereich.

   ADMIN_PASSWORD  Passwort für /admin (ohne gesetztes Passwort ist der Admin-Bereich aus)
   Die Sitzung ist ein signiertes Cookie (8 Stunden). Wird das Passwort
   geändert, sind alle bestehenden Sitzungen sofort ungültig. */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const COOKIE = "sk_admin";
const DAUER_S = 8 * 60 * 60;

const passwort = () => process.env.ADMIN_PASSWORD || "";
export const adminAktiv = () => passwort().length >= 8;

const signatur = (ablauf: string) =>
  createHmac("sha256", "sk-admin:" + passwort()).update(ablauf).digest("hex");

const gleich = (a: string, b: string) => {
  /* Hash vorher, damit unterschiedliche Längen nichts verraten */
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
};

export function passwortRichtig(eingabe: string) {
  return adminAktiv() && gleich(eingabe, passwort());
}

export function neuesToken() {
  const ablauf = String(Math.floor(Date.now() / 1000) + DAUER_S);
  return { wert: ablauf + "." + signatur(ablauf), maxAge: DAUER_S };
}

export function tokenGueltig(token?: string) {
  if (!adminAktiv() || !token) return false;
  const [ablauf, sig] = token.split(".");
  if (!ablauf || !sig || !/^\d+$/.test(ablauf)) return false;
  if (Number(ablauf) < Date.now() / 1000) return false;
  return gleich(sig, signatur(ablauf));
}

export async function angemeldet() {
  return tokenGueltig((await cookies()).get(COOKIE)?.value);
}

/* Für alle ändernden Admin-Anfragen: angemeldet + gleiche Herkunft */
export async function pruefeAnfrage(req: Request): Promise<NextResponse | null> {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ ok: false, error: "origin" }, { status: 403 });
  }
  if (!(await angemeldet())) return NextResponse.json({ ok: false, error: "auth" }, { status: 401 });
  return null;
}

/* ---------- Schutz gegen Durchprobieren ---------- */
const versuche = new Map<string, { anzahl: number; bis: number }>();
const MAX_VERSUCHE = 8;
const SPERRE_MS = 15 * 60 * 1000;

export const clientIp = (req: Request) =>
  (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || req.headers.get("x-real-ip") || "?";

export function gesperrt(ip: string) {
  const v = versuche.get(ip);
  if (!v) return false;
  if (v.bis < Date.now()) {
    versuche.delete(ip);
    return false;
  }
  return v.anzahl >= MAX_VERSUCHE;
}

export function fehlversuch(ip: string) {
  const v = versuche.get(ip);
  if (!v || v.bis < Date.now()) versuche.set(ip, { anzahl: 1, bis: Date.now() + SPERRE_MS });
  else v.anzahl++;
}

export const erfolg = (ip: string) => versuche.delete(ip);
