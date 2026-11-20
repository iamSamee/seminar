/* Nur serverseitig: Lead-Benachrichtigung per E-Mail an die zuständige
   Beraterin / den zuständigen Berater.

   Zwei Versandwege (siehe .env.example):
   1. Microsoft 365 über die Graph-API (empfohlen bei M365):
        GRAPH_TENANT_ID, GRAPH_CLIENT_ID, GRAPH_CLIENT_SECRET, MAIL_FROM
   2. Beliebiger SMTP-Server:
        SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
   Ist Graph konfiguriert, wird Graph genutzt, sonst SMTP. */
import nodemailer from "nodemailer";
import type { Berater } from "@/lib/berater";
import type { Submission } from "@/lib/submission";

type Anhang = { name: string; inhalt: string; typ: string };
type Mail = { an: string[]; cc: string[]; antwortAn?: string; betreff: string; html: string; text: string; anhang: Anhang };

const env = (k: string) => process.env[k]?.trim() || "";
const liste = (k: string) =>
  env(k)
    .split(/[,;\s]+/)
    .filter(Boolean);

export const mailWeg = (): "graph" | "smtp" | null =>
  env("GRAPH_TENANT_ID") && env("GRAPH_CLIENT_ID") && env("GRAPH_CLIENT_SECRET") && env("MAIL_FROM")
    ? "graph"
    : env("SMTP_HOST") && env("MAIL_FROM")
      ? "smtp"
      : null;

/* ---------- Inhalt ---------- */
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const eur = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
const pct = (n: number | null) => (n === null ? "—" : Math.round(n * 100) + " %");

function zeilen(s: Submission): [string, string][] {
  const k = s.calculation;
  const c = s.contact;
  const anschrift = [c.street, [c.postcode, c.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const tn = s.participantList
    .filter((t) => t.firstName || t.lastName)
    .map((t) => [t.firstName, t.lastName].filter(Boolean).join(" ") + (t.programme ? " — " + t.programme : ""));
  return [
    ["Unternehmen", c.company],
    ["Ansprechpartner", c.name + (c.role ? " (" + c.role + ")" : "")],
    ["E-Mail", c.email],
    ["Telefon", c.phone],
    ["Anschrift", anschrift],
    ["Branche", c.industry],
    ["Vorerfahrung", s.priorExperience ?? ""],
    ["Unternehmensgröße", s.companySize ?? ""],
    ["Fördersätze", s.courseFundingRate === null ? "" : pct(s.courseFundingRate) + " Kurskosten · " + pct(s.wageSubsidyRate) + " Lohnkosten"],
    ["Voraussetzungen erfüllt", s.requirements.met + " von 3"],
    ["Vollzeit-Mitarbeitende", s.employees === null ? "" : String(s.employees)],
    [
      "Bildungsgutscheine",
      s.possibleVouchers === null
        ? ""
        : s.possibleVouchers + (s.suggestedVouchers !== null && s.suggestedVouchers !== s.possibleVouchers ? " (Vorschlag war " + s.suggestedVouchers + ")" : ""),
    ],
    ["Programme", s.programmes.join(", ")],
    ["Bildungsangebote", s.offers.map((a) => a.title + " (" + a.measureNo + ")").join(", ")],
    ["Geschätzte Gesamtförderung", k ? eur(k.totalFunding) : ""],
    ["Eigenanteil Kurskosten", k ? eur(k.ownContribution) : ""],
    ["Teilnehmende", tn.join("\n")],
    ["Vorgeschlagener Folgetermin", s.suggestedFollowUp],
  ];
}

function baueMail(s: Submission, berater: Berater, csv: string, csvName: string): Mail {
  const z = zeilen(s).filter(([, v]) => v);
  const titel = "Neuer Lead: " + (s.contact.company || s.contact.name || s.contact.email);
  const html =
    '<div style="font-family:Segoe UI,Arial,sans-serif;font-size:14px;color:#1a1a1a">' +
    "<p>Hallo " + esc(berater.name) + ",</p>" +
    "<p>über die Förderplan-Konsole ist ein neuer Lead für Sie eingegangen:</p>" +
    '<table cellpadding="6" style="border-collapse:collapse">' +
    z
      .map(
        ([k, v]) =>
          '<tr><td style="vertical-align:top;color:#666;border-bottom:1px solid #eee">' + esc(k) +
          '</td><td style="border-bottom:1px solid #eee">' + esc(v).replace(/\n/g, "<br>") + "</td></tr>"
      )
      .join("") +
    "</table>" +
    '<p style="color:#666">Alle Angaben stehen zusätzlich in der angehängten CSV-Datei. Antworten auf diese E-Mail gehen direkt an den Kunden.</p>' +
    "</div>";
  const text =
    "Hallo " + berater.name + ",\n\nüber die Förderplan-Konsole ist ein neuer Lead für Sie eingegangen:\n\n" +
    z.map(([k, v]) => k + ": " + v.replace(/\n/g, "; ")).join("\n") +
    "\n\nAlle Angaben stehen zusätzlich in der angehängten CSV-Datei.\n";
  return {
    an: [berater.email],
    cc: liste("LEADS_CC").filter((a) => a.toLowerCase() !== berater.email.toLowerCase()),
    antwortAn: s.contact.email || undefined,
    betreff: titel,
    html,
    text,
    anhang: { name: csvName, inhalt: csv, typ: "text/csv" },
  };
}

/* ---------- Versand ---------- */
async function graphSenden(m: Mail) {
  const tokenRes = await fetch(
    "https://login.microsoftonline.com/" + encodeURIComponent(env("GRAPH_TENANT_ID")) + "/oauth2/v2.0/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env("GRAPH_CLIENT_ID"),
        client_secret: env("GRAPH_CLIENT_SECRET"),
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
      signal: AbortSignal.timeout(10_000),
    }
  );
  if (!tokenRes.ok) throw new Error("Graph-Token: " + tokenRes.status + " " + (await tokenRes.text()).slice(0, 300));
  const { access_token } = (await tokenRes.json()) as { access_token: string };

  const adr = (a: string) => ({ emailAddress: { address: a } });
  const res = await fetch("https://graph.microsoft.com/v1.0/users/" + encodeURIComponent(env("MAIL_FROM")) + "/sendMail", {
    method: "POST",
    headers: { Authorization: "Bearer " + access_token, "Content-Type": "application/json" },
    body: JSON.stringify({
      message: {
        subject: m.betreff,
        body: { contentType: "HTML", content: m.html },
        toRecipients: m.an.map(adr),
        ccRecipients: m.cc.map(adr),
        replyTo: m.antwortAn ? [adr(m.antwortAn)] : [],
        attachments: [
          {
            "@odata.type": "#microsoft.graph.fileAttachment",
            name: m.anhang.name,
            contentType: m.anhang.typ,
            contentBytes: Buffer.from(m.anhang.inhalt, "utf8").toString("base64"),
          },
        ],
      },
      saveToSentItems: true,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error("Graph-sendMail: " + res.status + " " + (await res.text()).slice(0, 300));
}

async function smtpSenden(m: Mail) {
  const port = Number(env("SMTP_PORT")) || 587;
  const transport = nodemailer.createTransport({
    host: env("SMTP_HOST"),
    port,
    secure: port === 465,
    auth: env("SMTP_USER") ? { user: env("SMTP_USER"), pass: env("SMTP_PASS") } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  await transport.sendMail({
    from: env("MAIL_FROM"),
    to: m.an,
    cc: m.cc.length ? m.cc : undefined,
    replyTo: m.antwortAn,
    subject: m.betreff,
    html: m.html,
    text: m.text,
    attachments: [{ filename: m.anhang.name, content: m.anhang.inhalt, contentType: m.anhang.typ }],
  });
}

/* true = gesendet, false = Fehler, null = kein Versandweg konfiguriert */
export async function leadMailSenden(s: Submission, berater: Berater, csv: string, csvName: string): Promise<boolean | null> {
  const weg = mailWeg();
  if (!weg) return null;
  const m = baueMail(s, berater, csv, csvName);
  try {
    await (weg === "graph" ? graphSenden(m) : smtpSenden(m));
    return true;
  } catch (e) {
    console.error("[submit] E-Mail an " + berater.id + " fehlgeschlagen:", e);
    return false;
  }
}
