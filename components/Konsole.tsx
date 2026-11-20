"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ANBIETER_NR,
  ANGEBOTE,
  ANGEBOTE_URL,
  FORMULAR_URL,
  PROGRAMME,
  RATES,
  SLIDES,
  type Angebot,
  type Exp,
  type SlideId,
  type Size,
} from "@/lib/data";
import type { BeraterOeffentlich } from "@/lib/berater";
import { fill, md, type Inhalt } from "@/lib/inhalt";
import { csvHeader, csvRow, type Submission } from "@/lib/submission";
import type { Req } from "@/lib/texte-standard";

/* ---------- Hilfsfunktionen ---------- */
const num = (v: string, fallback: number) => {
  const n = parseFloat(v);
  return isFinite(n) && n > 0 ? n : fallback;
};
const MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LOCALE = "de-DE";
const REQS: Req[] = ["std", "abschluss", "sv"];
type TnZeile = { vorname: string; name: string; kurs: string; position: string };
type Row = [string, string];
type Sendestatus = "idle" | "sending" | "ok" | "fehler";

const LEERE_ZEILE: TnZeile = { vorname: "", name: "", kurs: "", position: "" };

const START_FELDER = {
  ma: "",
  bgs: "",
  kosten: "9000",
  gehalt: "3500",
  monate: "6",
  stunden: "42",
  regel: "160",
  firma: "",
  name: "",
  rolle: "",
  branche: "",
  mail: "",
  telefon: "",
  strasse: "",
  plz: "",
  ort: "",
};
type Felder = typeof START_FELDER;
type Angabe = "firma" | "name" | "rolle" | "branche" | "mail" | "telefon" | "strasse" | "plz" | "ort";
const PFLICHT: Angabe[] = ["firma", "name", "mail"];

/* Faustregel: 1 Bildungsgutschein je 5 Vollzeit-Mitarbeitende, mindestens 1 */
const bgsVorschlag = (ma: number) => Math.max(1, Math.floor(ma / 5));

/* Kurskosten (Durchschnitt) und Dauer (längste Maßnahme, Wochen -> Monate)
   der gewählten Programme — Vorbelegung für "Ihre Ersparnis" */
function ausProgrammen(progs: string[]) {
  const liste = progs.map((p) => ANGEBOTE[p]?.[0]).filter((a): a is Angebot => !!a);
  if (!liste.length) return null;
  return {
    kosten: String(Math.round(liste.reduce((s, a) => s + a.preis, 0) / liste.length)),
    monate: String(Math.max(...liste.map((a) => Math.round((a.wochen * 12) / 52)))),
  };
}

/* Zwischenablage: moderne Schnittstelle, sonst klassischer Weg */
function kopiere(text: string): Promise<boolean> {
  const klassisch = () => {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "0";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  };
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => klassisch()
    );
  }
  return Promise.resolve(klassisch());
}

function Rows({ rows, id, hervor }: { rows: Row[]; id?: string; hervor?: number[] }) {
  return (
    <div className="breakdown" id={id} style={{ marginTop: 10 }}>
      {rows.map(([a, b], i) => (
        <div key={i} className={hervor?.includes(i) ? "hervor" : undefined}>
          <span>{a}</span>
          <span>{md(b)}</span>
        </div>
      ))}
    </div>
  );
}

function PlanItem({ k, v, filled, money }: { k: string; v: string; filled: boolean; money?: boolean }) {
  return (
    <div className={"plan-item" + (filled ? " filled" : "")}>
      <span className="k">{k}</span>
      <span className={"v" + (money ? " money" : "")}>{v}</span>
    </div>
  );
}

export default function Konsole({ berater, inhalt }: { berater: BeraterOeffentlich; inhalt: Inhalt }) {
  const t = inhalt.texte;
  const bilder = inhalt.bilder;
  /* Anzeigenamen (bearbeitbar) zu Programm-Schlüsseln und Angeboten */
  const progName = (prog: string) => {
    const p = PROGRAMME.find((x) => x.prog === prog);
    return (p && inhalt.programme[p.id]?.titel) || prog;
  };
  const angText = (a: Angebot) => inhalt.angebote[a.id]?.text ?? a.text;
  const stimmen = inhalt.kundenstimmen.filter((q) => q.text.trim());
  /* ---------- Formatierung je Sprache ---------- */
  const eur = (n: number) =>
    new Intl.NumberFormat(LOCALE, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const eur2 = (n: number) =>
    new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  const pct = (n: number) => Math.round(n * 100) + " %";

  /* ---------- Zustand ---------- */
  const [idx, setIdx] = useState(0);
  const [exp, setExp] = useState<Exp | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [req, setReq] = useState<Record<Req, boolean>>({ std: false, abschluss: false, sv: false });
  const [progs, setProgs] = useState<string[]>([]);
  const [angebote, setAngebote] = useState<string[]>([]);
  const [tnZeilen, setTnZeilen] = useState<TnZeile[]>([]);
  const [f, setF] = useState<Felder>(START_FELDER);
  const [toast, setToast] = useState<{ text: string; an: boolean }>({ text: "", an: false });
  const [druckDatum, setDruckDatum] = useState("");
  const [termin, setTermin] = useState<{ anzeige: string; href: string; iso: string }>({
    anzeige: t.terminIdeal + "…",
    href: berater.kalender,
    iso: "",
  });
  const [sende, setSende] = useState<Sendestatus>("idle");
  const [meldung, setMeldung] = useState("");
  /* von Hand geänderte Felder werden nicht mehr automatisch vorbelegt */
  const [manuell, setManuell] = useState<{ bgs: boolean; kosten: boolean; monate: boolean }>({
    bgs: false,
    kosten: false,
    monate: false,
  });

  const stageRef = useRef<HTMLElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const feld = (key: keyof Felder) => ({
    value: f[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      if (key === "ma") {
        /* Gutscheine folgen der Mitarbeiterzahl, solange sie nicht von Hand geändert wurden */
        const n = parseFloat(v);
        const vorschlag = isFinite(n) && n > 0 ? String(bgsVorschlag(Math.round(n))) : "";
        setF((alt) => ({ ...alt, ma: v, ...(manuell.bgs ? {} : { bgs: vorschlag }) }));
        return;
      }
      if (key === "bgs" || key === "kosten" || key === "monate") setManuell((alt) => ({ ...alt, [key]: true }));
      setF((alt) => ({ ...alt, [key]: v }));
    },
  });
  const txt = (key: keyof Felder) => f[key].trim();

  /* ---------- Navigation ---------- */
  const go = (i: number) => {
    setIdx(Math.max(0, Math.min(SLIDES.length - 1, i)));
    if (stageRef.current) stageRef.current.scrollTop = 0;
  };

  /* ---------- Idealer Folgetermin: 5 Tage nach der Beratung ---------- */
  useEffect(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + 5);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2); /* Samstag -> Montag */
    else if (d.getDay() === 0) d.setDate(d.getDate() + 1); /* Sonntag -> Montag */
    const anzeige = d.toLocaleDateString(LOCALE, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const zwei = (n: number) => (n < 10 ? "0" : "") + n;
    const iso = d.getFullYear() + "-" + zwei(d.getMonth() + 1) + "-" + zwei(d.getDate());
    /* Calendly oeffnet damit direkt den Monat/Tag */
    setDruckDatum(new Date().toLocaleDateString(LOCALE, { day: "2-digit", month: "long", year: "numeric" }));
    setTermin({ anzeige: t.terminIdeal + anzeige, href: berater.kalender + "?month=" + iso.slice(0, 7) + "&date=" + iso, iso });
  }, [berater.kalender, t.terminIdeal]);

  /* ---------- Abgeleitete Werte ---------- */
  const r = size ? RATES[size] : null;
  const reqCount = (Object.keys(req) as Req[]).filter((k) => req[k]).length;

  const maNum = parseFloat(f.ma);
  const ma = isFinite(maNum) && maNum > 0 ? Math.round(maNum) : null;
  const vorschlag = ma ? bgsVorschlag(ma) : null;
  const bgsNum = parseFloat(f.bgs);
  const gutscheine = isFinite(bgsNum) && bgsNum > 0 ? Math.round(bgsNum) : null;


  const c = useMemo(() => {
    const kosten = num(f.kosten, 0);
    const gehalt = num(f.gehalt, 0);
    /* eine Teilnehmerzahl fuer alles: Gutscheine aus "Ihr Kontingent" (Folie 9) */
    const tn = gutscheine ?? 1;
    const monate = num(f.monate, 0);
    const stunden = num(f.stunden, 0);
    const regel = num(f.regel, 160);

    const stundenlohn = gehalt / regel;
    const lohnGesamt = stundenlohn * stunden * monate;
    const kursFoerder = r ? kosten * r.kurs : 0;
    const lohnFoerder = r ? lohnGesamt * r.lohn : 0;
    const eigenanteil = kosten - kursFoerder;

    return {
      tn,
      kosten,
      gehalt,
      monate,
      stunden,
      regel,
      stundenlohn,
      lohnGesamt,
      kursFoerder,
      lohnFoerder,
      eigenanteil: eigenanteil * tn,
      gesamt: (kursFoerder + lohnFoerder) * tn,
      lohnProMonat: monate > 0 ? lohnFoerder / monate : 0,
      lohnProMonatGesamt: monate > 0 ? (lohnFoerder / monate) * tn : 0,
    };
  }, [f.kosten, f.gehalt, f.monate, f.stunden, f.regel, gutscheine, r]);

  /* Teilnehmerliste auf Folie "Ablauf": max. 15 Zeilen */
  const tnAnzahl = Math.min(15, c.tn);
  const kurseAuswahl = progs.length ? progs : Object.keys(ANGEBOTE);

  const setTnFeld = (i: number, key: keyof TnZeile, v: string) => {
    setTnZeilen((alt) => {
      const neu = alt.slice();
      while (neu.length <= i) neu.push({ ...LEERE_ZEILE });
      neu[i] = { ...neu[i], [key]: v };
      return neu;
    });
  };

  const waehleProgramm = (prog: string) => {
    const neu = progs.includes(prog) ? progs.filter((x) => x !== prog) : [...progs, prog];
    setProgs(neu);
    const werte = ausProgrammen(neu);
    if (werte)
      setF((alt) => ({
        ...alt,
        ...(manuell.kosten ? {} : { kosten: werte.kosten }),
        ...(manuell.monate ? {} : { monate: werte.monate }),
      }));
  };
  const kostenAusProgramm = !manuell.kosten && progs.length > 0;

  const gewaehlteAngebote = Object.values(ANGEBOTE)
    .flat()
    .filter((a) => angebote.includes(a.nr));

  const firma = txt("firma");
  const person = txt("name");
  const rolle = txt("rolle");
  const branche = txt("branche");

  const z = t.ersparnis.zeilen;
  const breakdown: Row[] = r
    ? [
        [z.kosten, eur(c.kosten)],
        [fill(z.kursFoerder, { p: pct(r.kurs) }), eur(c.kursFoerder)],
        [z.stundenlohn, eur2(c.stundenlohn)],
        [fill(z.lohnGesamt, { m: Math.round(c.monate) }), eur(c.lohnGesamt)],
        [fill(z.lohnFoerder, { p: pct(r.lohn) }), eur(c.lohnFoerder)],
        [z.lohnProMonat, eur(c.lohnProMonat)],
        [z.jeTn, eur(c.kursFoerder + c.lohnFoerder)],
        [fill(z.gesamt, { n: c.tn }), eur(c.gesamt)],
      ]
    : [[t.ersparnis.keineGroesse, "—"]];

  const sz = t.zusammenfassung.zeilen;
  const summary: Row[] = [
    [sz.firma, firma || t.offen],
    [sz.person, person ? person + (rolle ? " (" + rolle + ")" : "") : t.offen],
    [sz.branche, branche || t.offen],
    [sz.exp, exp ? t.vorerfahrung.label[exp] : t.offen],
    [sz.groesse, size ? t.quote.groessen[size] : t.offen],
    [sz.kurs, r ? pct(r.kurs) : t.offen],
    [sz.lohn, r ? pct(r.lohn) : t.offen],
    [sz.req, fill(sz.reqWert, { n: reqCount })],
    [sz.ma, ma !== null ? String(ma) : t.offen],
    [sz.gutscheine, gutscheine !== null ? String(gutscheine) : t.offen],
    [sz.progs, progs.length ? progs.map(progName).join(", ") : t.offen],
    [sz.tn, String(c.tn)],
    [sz.lohnMonatTn, r ? eur(c.lohnProMonat) : t.offen],
    [sz.lohnMonat, r ? eur(c.lohnProMonatGesamt) : t.offen],
    [sz.gesamt, r ? eur(c.gesamt) : t.offen],
  ];

  const offen = t.nochOffen;
  const bz = t.anfordern.zeilen;
  const anschrift = [txt("strasse"), [txt("plz"), txt("ort")].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const bereit: Row[] = [
    [bz.firma, firma || offen],
    [bz.anschrift, anschrift || offen],
    [bz.person, person ? person + (rolle ? " (" + rolle + ")" : "") : offen],
    [bz.telefon, txt("telefon") || offen],
    [bz.mail, txt("mail") || offen],
    [bz.ma, ma !== null ? String(ma) : offen],
    [bz.tn, String(c.tn)],
    [
      bz.kurs,
      gewaehlteAngebote.length
        ? gewaehlteAngebote.map((a) => a.titel + " (" + t.angaben.massnNr + " " + a.nr + ")").join(", ")
        : offen,
    ],
    [bz.traeger, "Seminarkontor GmbH · " + t.angaben.anbieterNr + " " + ANBIETER_NR],
  ];

  /* ---------- Aktionen ---------- */
  const toggleList = (list: string[], set: (l: string[]) => void, v: string) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const zeigeHinweis = (text: string) => {
    setToast({ text, an: true });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((alt) => ({ ...alt, an: false })), 7000);
  };

  const nachrichtKopieren = () =>
    kopiere(t.anfordern.nachricht).then((ok) => zeigeHinweis(ok ? t.kopiertOk : t.kopiertFehler));

  /* Datensatz fuer Webhook, E-Mail und CSV */
  const baueSubmission = (): Submission => ({
    submittedAt: new Date().toISOString(),
    language: "de",
    advisor: berater.id,
    contact: {
      company: firma,
      name: person,
      role: rolle,
      industry: branche,
      email: txt("mail"),
      phone: txt("telefon"),
      street: txt("strasse"),
      postcode: txt("plz"),
      city: txt("ort"),
    },
    /* lesbare Bezeichnungen statt interner Kürzel wie "klein" oder "neu" */
    priorExperience: exp ? t.vorerfahrung.label[exp] : null,
    companySize: size ? t.quote.groessen[size] : null,
    courseFundingRate: r ? r.kurs : null,
    wageSubsidyRate: r ? r.lohn : null,
    requirements: { minHours20: req.std, qualification2Years: req.abschluss, socialInsurance: req.sv, met: reqCount },
    employees: ma,
    possibleVouchers: gutscheine,
    suggestedVouchers: vorschlag,
    programmes: progs,
    offers: gewaehlteAngebote.map((a) => ({ measureNo: a.nr, title: a.titel, teachingUnits: a.ue, dkz: a.dkz })),
    calculation: r
      ? {
          courseCostPerParticipant: c.kosten,
          grossMonthlySalary: c.gehalt,
          participants: c.tn,
          durationMonths: c.monate,
          trainingHoursPerMonth: c.stunden,
          regularHoursPerMonth: c.regel,
          hourlyWage: c.stundenlohn,
          wageCostTrainingHours: c.lohnGesamt,
          courseFundingPerParticipant: c.kursFoerder,
          wageSubsidyPerParticipant: c.lohnFoerder,
          wageSubsidyPerMonth: c.lohnProMonat,
          wageSubsidyPerMonthTotal: c.lohnProMonatGesamt,
          ownContribution: c.eigenanteil,
          totalFunding: c.gesamt,
        }
      : null,
    plannedParticipants: c.tn,
    participantList: Array.from({ length: tnAnzahl }, (_, i) => {
      const zeile = tnZeilen[i] ?? LEERE_ZEILE;
      return {
        firstName: zeile.vorname.trim(),
        lastName: zeile.name.trim(),
        programme: kurseAuswahl.includes(zeile.kurs) ? zeile.kurs : "",
        position: zeile.position.trim(),
      };
    }),
    suggestedFollowUp: termin.iso,
  });

  const csvLaden = () => {
    const daten = baueSubmission();
    const blob = new Blob(["﻿" + csvHeader() + "\r\n" + csvRow(daten) + "\r\n"], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const name = (firma || "angaben").toLowerCase().replace(/[^a-z0-9äöüß]+/gi, "-").replace(/^-|-$/g, "");
    a.href = url;
    a.download = "foerderplan-" + name + "-" + daten.submittedAt.slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const absenden = async () => {
    if (sende === "sending" || sende === "ok") return;
    const fehlend = PFLICHT.filter((k) => !txt(k)).map((k) => t.angaben.felder[k][0]);
    const hinweis = fehlend.length
      ? fill(t.absenden.fehlt, { felder: fehlend.join(", ") })
      : !MAIL_RE.test(txt("mail"))
        ? t.absenden.mailUngueltig
        : "";
    if (hinweis) {
      setMeldung(hinweis);
      zeigeHinweis(hinweis);
      go(SLIDES.indexOf("Ihre Angaben"));
      return;
    }
    setSende("sending");
    setMeldung("");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(baueSubmission()),
      });
      const antwort = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (!res.ok || !antwort?.ok) throw new Error("submit failed: " + res.status);
      setSende("ok");
      setMeldung(t.absenden.ok);
      zeigeHinweis(t.absenden.ok);
    } catch {
      setSende("fehler");
      setMeldung(t.absenden.fehler);
      zeigeHinweis(t.absenden.fehler);
    }
  };

  const knopfText = sende === "sending" ? t.absenden.sendet : sende === "ok" ? t.absenden.gesendet : t.absenden.knopf;

  const reset = () => {
    setExp(null);
    setSize(null);
    setReq({ std: false, abschluss: false, sv: false });
    setProgs([]);
    setAngebote([]);
    setTnZeilen([]);
    setF(START_FELDER);
    setManuell({ bgs: false, kosten: false, monate: false });
    setSende("idle");
    setMeldung("");
    go(0);
  };

  /* Teilnehmerzahl: nur auf "Ihr Kontingent" änderbar, sonst schreibgeschützt */
  const tnFeld = (id: string, label: string) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="text" readOnly value={c.tn} aria-describedby={id + "Hinweis"} />
      <button id={id + "Hinweis"} type="button" className="fhint fhint-link" onClick={() => go(SLIDES.indexOf("Ihr Kontingent"))}>
        {gutscheine !== null ? t.tnHinweis : t.tnHinweisLeer}
      </button>
    </div>
  );

  const slideCls = (id: SlideId) => "slide" + (SLIDES.indexOf(id) === idx ? " active" : "");
  const istLetzte = idx === SLIDES.length - 1;

  /* ---------- Darstellung ---------- */
  return (
    <>
      <div className="shell">
        {/* ================= TOP RAIL ================= */}
        <header className="rail-top">
          <span className="brandplate">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bilder.logo} alt={t.logoAlt} />
          </span>
          <nav className="steps" aria-label={t.navAria}>
            {SLIDES.map((id, i) => (
              <button
                key={id}
                type="button"
                className={"step" + (i < idx ? " done" : "")}
                title={t.folien[id]}
                aria-label={t.folien[id]}
                aria-current={i === idx ? "true" : "false"}
                onClick={() => go(i)}
              />
            ))}
          </nav>
          <button className="toolbtn" type="button" onClick={reset}>
            {md(t.reset)}
          </button>
        </header>

        <div className="print-kopf" aria-hidden="true">
          <h1>{md(t.druckTitel)}</h1>
          <p>{(firma ? firma + " · " : "") + druckDatum}</p>
        </div>

        {/* ================= BODY ================= */}
        <div className="body">
          <main className="stage" ref={stageRef}>
            <div className="stage-inner">
              {/* ---------- KENNENLERNEN ---------- */}
              <section className={slideCls("Kennenlernen")} data-title="Kennenlernen">
                <div className="slide-head">
                  <h2>{md(t.kennenlernen.h2)}</h2>
                  <p className="lede">{md(t.kennenlernen.lede)}</p>
                </div>
                <div className="stack">
                  <div className="card">
                    <h3>{md(t.kennenlernen.fahrplanTitel)}</h3>
                    <ul className="bullets" style={{ marginTop: 12 }}>
                      {t.kennenlernen.fahrplan.map((p, i) => (
                        <li key={i}><span className="tick">{i + 1}</span><span>{md(p)}</span></li>
                      ))}
                    </ul>
                    <p className="footnote" style={{ marginTop: 14 }}>{md(t.kennenlernen.fahrplanNotiz)}</p>
                  </div>
                  <div className="proof">
                    <h3>{md(t.kennenlernen.proofTitel)}</h3>
                    <p className="proof-lede">{md(t.kennenlernen.proofLede)}</p>
                    <div className="proof-grid">
                      {t.kennenlernen.proof.map(([b, s]) => (
                        <div key={b}><b>{md(b)}</b><span>{md(s)}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- VORERFAHRUNG ---------- */}
              <section className={slideCls("Vorerfahrung")} data-title="Vorerfahrung">
                <div className="slide-head">
                  <h2>{md(t.vorerfahrung.h2)}</h2>
                  <p className="lede">{md(t.vorerfahrung.lede)}</p>
                </div>
                <div className="stack">
                  <div className="antworten">
                    {(["genutzt", "gehoert", "neu"] as Exp[]).map((k) => (
                      <button
                        key={k}
                        type="button"
                        className="chip"
                        aria-pressed={exp === k}
                        onClick={() => setExp(exp === k ? null : k)}
                      >
                        {md(t.vorerfahrung.antworten[k])}
                      </button>
                    ))}
                  </div>
                  <div className="verdict">{exp ? t.vorerfahrung.bridge[exp] : t.vorerfahrung.standard}</div>
                  <div className="traeger">
                    <b>{md(t.traeger)}</b>
                    <div className="traeger-siegel">
                      <span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={bilder.azav} alt={t.azavAlt} />
                        <span>{md(t.azavKurz)}</span>
                      </span>
                      <span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={bilder.iso} alt={t.isoAlt} />
                        <span>{md(t.isoKurz)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- SEMINARKONTOR ---------- */}
              <section className={slideCls("Seminarkontor")} data-title="Seminarkontor">
                <div className="slide-head">
                  <h2>{md(t.traeger)}</h2>
                  <p className="lede">{md(t.seminarkontor.lede)}</p>
                </div>
                <div className="stack">
                  <ul className="facts">
                    {t.seminarkontor.fakten.map((x) => (
                      <li key={x}>{md(x)}</li>
                    ))}
                  </ul>
                  <div className="grid-2" style={{ alignItems: "start" }}>
                    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", alignItems: "stretch" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bilder.oscar} alt={t.seminarkontor.oscarName} style={{ width: 132, flex: "none", objectFit: "cover", objectPosition: "top" }} />
                      <div style={{ padding: "16px 18px" }}>
                        <h3>{md(t.seminarkontor.oscarName)}</h3>
                        <p style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13.5, marginBottom: 8 }}>
                          {md(t.seminarkontor.oscarRolle)}
                        </p>
                        <p>{md(t.seminarkontor.oscarText)}</p>
                      </div>
                    </div>
                    <div className="card">
                      <h3>{md(t.seminarkontor.zertTitel)}</h3>
                      <ul className="bullets" style={{ marginTop: 12 }}>
                        {t.seminarkontor.zert.map((x, i) => (
                          <li key={i}><span className="tick">✓</span><span>{md(x)}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="footnote">{md(t.seminarkontor.fussnote)}</p>
                </div>
              </section>

              {/* ---------- UNSERE DOZENTEN ---------- */}
              <section className={slideCls("Unsere Dozenten")} data-title="Unsere Dozenten">
                <div className="slide-head">
                  <h2>{md(t.dozenten.h2)}</h2>
                  <p className="lede">{md(t.dozenten.lede)}</p>
                </div>
                <div className="stack">
                  <div className="proof">
                    <h3>{md(t.dozenten.proofTitel)}</h3>
                    <p className="proof-lede">{md(t.dozenten.proofLede)}</p>
                    <div className="proof-grid vier">
                      {t.dozenten.proof.map(([b, s]) => (
                        <div key={b}><b>{md(b)}</b><span>{md(s)}</span></div>
                      ))}
                    </div>
                  </div>

                  {stimmen.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: 16, marginBottom: 10 }}>{md(t.dozenten.stimmenTitel)}</h3>
                      <div className="quotes">
                        {stimmen.map((q, i) => {
                          const sterne = Math.max(0, Math.min(5, parseInt(q.sterne, 10) || 0));
                          return (
                          <figure className="quote" key={i}>
                            {sterne ? <div className="stars">{"★".repeat(sterne)}</div> : null}
                            <p>„{md(q.text)}“</p>
                            {q.quelle && <figcaption>{q.quelle}</figcaption>}
                          </figure>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="grid-3">
                    {t.dozenten.karten.map(([h, p]) => (
                      <div className="card" key={h}><h3>{md(h)}</h3><p>{md(p)}</p></div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ---------- AUSGANGSLAGE ---------- */}
              <section className={slideCls("Ausgangslage")} data-title="Ausgangslage">
                <div className="slide-head">
                  <h2>{md(t.ausgangslage.h2)}</h2>
                  <p className="lede">{md(t.ausgangslage.lede)}</p>
                </div>
                <div className="stack">
                  <div className="grid-3">
                    {t.ausgangslage.karten.map(([h, p]) => (
                      <div className="card" key={h}><h3>{md(h)}</h3><p>{md(p)}</p></div>
                    ))}
                  </div>
                  <div className="card">
                    <h3>{md(t.ausgangslage.nutzenTitel)}</h3>
                    <ul className="bullets" style={{ marginTop: 12 }}>
                      {t.ausgangslage.nutzen.map((x, i) => (
                        <li key={i}><span className="tick">✓</span><span>{md(x)}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div className="schluss">
                    <b>{md(t.ausgangslage.schluss[0])}</b>
                    <span>{md(t.ausgangslage.schluss[1])}</span>
                  </div>
                </div>
              </section>

              {/* ---------- BILDUNGSGUTSCHEIN ---------- */}
              <section className={slideCls("Bildungsgutschein")} data-title="Bildungsgutschein">
                <div className="slide-head">
                  <h2>{md(t.gutschein.h2)}</h2>
                  <p className="lede">{md(t.gutschein.lede)}</p>
                </div>
                <div className="stack">
                  <div className="grid-3">
                    {t.gutschein.karten.map(([h, p]) => (
                      <div className="card" key={h}><h3>{md(h)}</h3><p>{md(p)}</p></div>
                    ))}
                  </div>
                  <div className="schluss">
                    <b>{md(t.gutschein.schluss[0])}</b>
                    <span>{md(t.gutschein.schluss[1])}</span>
                  </div>
                </div>
              </section>

              {/* ---------- FÖRDERQUOTE ---------- */}
              <section className={slideCls("Förderquote")} data-title="Förderquote">
                <div className="slide-head">
                  <h2>{md(t.quote.h2)}</h2>
                  <p className="lede">{md(t.quote.lede)}</p>
                </div>
                <div className="stack">
                  <div className="ctrl-row">
                    {(Object.keys(RATES) as Size[]).map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="chip"
                        aria-pressed={size === s}
                        onClick={() => setSize(size === s ? null : s)}
                      >
                        {md(t.quote.groessen[s])}
                      </button>
                    ))}
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>{t.quote.kopf.map((k) => <th key={k}>{k}</th>)}</tr>
                      </thead>
                      <tbody>
                        {(Object.keys(RATES) as Size[]).map((s) => (
                          <tr key={s} className={size === s ? "hi" : undefined}>
                            <td>{md(t.quote.zeilen[s])}</td>
                            <td className="n">{pct(RATES[s].kurs)}</td>
                            <td className="n">{pct(RATES[s].lohn)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="figures">
                    <div className="fig"><span className="v">{r ? pct(r.kurs) : "—"}</span><span className="k">{md(t.quote.figs[0])}</span></div>
                    <div className="fig"><span className="v">{r ? pct(r.lohn) : "—"}</span><span className="k">{md(t.quote.figs[1])}</span></div>
                    <div className="fig"><span className="v">{r ? pct(1 - r.kurs) : "—"}</span><span className="k">{md(t.quote.figs[2])}</span></div>
                  </div>
                  <div className="schluss">
                    <b>{md(t.quote.schluss[0])}</b>
                    <span>{md(t.quote.schluss[1])}</span>
                  </div>
                </div>
              </section>

              {/* ---------- VORAUSSETZUNGEN ---------- */}
              <section className={slideCls("Voraussetzungen")} data-title="Voraussetzungen">
                <div className="slide-head">
                  <h2>{md(t.voraus.h2)}</h2>
                  <p className="lede">{md(t.voraus.lede)}</p>
                </div>
                <div className="stack">
                  <div className="stack" style={{ gap: 8 }}>
                    {REQS.map((k) => {
                      const [main, sub] = t.voraus.kriterien[k];
                      return (
                      <button
                        key={k}
                        type="button"
                        className="toggle"
                        aria-pressed={req[k]}
                        onClick={() => setReq((alt) => ({ ...alt, [k]: !alt[k] }))}
                      >
                        <span className="box" aria-hidden="true">✓</span>
                        <span>
                          <span className="t-main">{md(main)}</span>
                          <span className="t-sub">{md(sub)}</span>
                        </span>
                      </button>
                      );
                    })}
                  </div>
                  <div className={"verdict" + (reqCount === 3 ? " ok" : "")}>
                    {reqCount === 3 ? t.voraus.urteilAlle : reqCount > 0 ? fill(t.voraus.urteilTeil, { n: reqCount }) : t.voraus.urteilKeine}
                  </div>
                  <div className="schluss">
                    <b>{md(t.voraus.schluss[0])}</b>
                    <span>{md(t.voraus.schluss[1])}</span>
                  </div>
                </div>
              </section>

              {/* ---------- KONTINGENT ---------- */}
              <section className={slideCls("Ihr Kontingent")} data-title="Ihr Kontingent">
                <div className="slide-head">
                  <h2>{md(t.kontingent.h2)}</h2>
                  <p className="lede">{md(t.kontingent.lede)}</p>
                </div>
                <div className="stack">
                  <div className="grid-2">
                    <div className="card">
                      <h3>{md(t.kontingent.kartenTitel)}</h3>
                      <p style={{ marginBottom: 12 }}>{md(t.kontingent.regel)}</p>
                      <div className="field">
                        <label htmlFor="inMA">{md(t.kontingent.maLabel)}</label>
                        <input id="inMA" type="number" min={1} max={100000} step={1} placeholder={t.kontingent.maPlatzhalter} inputMode="numeric" {...feld("ma")} />
                      </div>
                      <div className="field" style={{ marginTop: 10 }}>
                        <label htmlFor="inBGS">{md(t.kontingent.bgsLabel)}</label>
                        <input id="inBGS" type="number" min={1} max={100000} step={1} inputMode="numeric" aria-describedby="bgsHinweis" {...feld("bgs")} />
                        {vorschlag !== null &&
                          (gutscheine !== vorschlag ? (
                            <button
                              id="bgsHinweis"
                              type="button"
                              className="fhint fhint-link"
                              onClick={() => {
                                setF((alt) => ({ ...alt, bgs: String(vorschlag) }));
                                setManuell((alt) => ({ ...alt, bgs: false }));
                              }}
                            >
                              {fill(t.kontingent.bgsUebernehmen, { n: vorschlag })}
                            </button>
                          ) : (
                            <span id="bgsHinweis" className="fhint">{fill(t.kontingent.bgsVorschlag, { n: vorschlag })}</span>
                          ))}
                      </div>
                    </div>
                    <div className="fig" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <span className="v">{gutscheine !== null ? String(gutscheine) : "—"}</span>
                      <span className="k">{md(t.kontingent.figK)}</span>
                    </div>
                  </div>
                  <div className="empfehlung">
                    <span className="empfehlung-k">{md(t.kontingent.empfK)}</span>
                    <p>{md(t.kontingent.empf)}</p>
                  </div>
                  <p className="footnote">{md(t.kontingent.fussnote)}</p>
                </div>
              </section>

              {/* ---------- WEITERBILDUNGEN ---------- */}
              <section className={slideCls("Weiterbildungen")} data-title="Weiterbildungen">
                <div className="slide-head">
                  <h2>{md(t.weiterbildungen.h2)}</h2>
                  <p className="lede">{md(t.weiterbildungen.lede)}</p>
                </div>
                <div className="stack">
                  <div className="prog">
                    {PROGRAMME.map((p) => {
                      const a = ANGEBOTE[p.prog]?.[0];
                      const anz = inhalt.programme[p.id] ?? p;
                      return (
                      <div className="prog-item" key={p.prog}>
                        <button
                          type="button"
                          className="prog-card"
                          aria-pressed={progs.includes(p.prog)}
                          onClick={() => waehleProgramm(p.prog)}
                        >
                          <span className="pc-t">{md(anz.titel)}</span>
                          <span className="pc-d">{md(anz.text)}</span>
                          {a && <span className="pc-ue">{fill(t.weiterbildungen.kursMeta, { ue: a.ue, wochen: a.wochen })}</span>}
                        </button>
                        <a className="prog-link" href={p.url} target="_blank" rel="noopener noreferrer">
                          {p.url.replace("https://", "").replace(/\/$/, "")} ↗
                        </a>
                      </div>
                      );
                    })}
                    <div className="seals">
                      <div className="seal">
                        <span className="seal-plate">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={bilder.azav} alt={t.azavAlt} />
                        </span>
                        <span className="seal-body">
                          <b>{md(t.azavKurz)}</b>
                          <span>{md(t.weiterbildungen.azav[0])}</span>
                          <em>{md(t.weiterbildungen.azav[1])}</em>
                        </span>
                      </div>
                      <div className="seal">
                        <span className="seal-plate">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={bilder.iso} alt={t.isoAlt} />
                        </span>
                        <span className="seal-body">
                          <b>{md(t.isoKurz)}</b>
                          <span>{md(t.weiterbildungen.iso[0])}</span>
                          <em>{md(t.weiterbildungen.iso[1])}</em>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- IHRE ERSPARNIS ---------- */}
              <section className={slideCls("Ihre Ersparnis")} data-title="Ihre Ersparnis">
                <div className="slide-head">
                  <h2>{md(t.ersparnis.h2)}</h2>
                  <p className="lede">{md(t.ersparnis.lede)}</p>
                </div>
                <div className="stack">
                  <div className="grid-3">
                    <div className="field">
                      <label htmlFor="inKosten">{md(t.ersparnis.kosten)}</label>
                      <input id="inKosten" type="number" min={0} step={100} inputMode="numeric" aria-describedby={kostenAusProgramm ? "kostenHinweis" : undefined} {...feld("kosten")} />
                      {kostenAusProgramm && <span id="kostenHinweis" className="fhint">{md(t.ersparnis.kostenHinweis)}</span>}
                    </div>
                    <div className="field"><label htmlFor="inGehalt">{md(t.ersparnis.gehalt)}</label><input id="inGehalt" type="number" min={0} step={100} inputMode="numeric" {...feld("gehalt")} /></div>
                    {tnFeld("inTN", t.ersparnis.tn)}
                    <div className="field"><label htmlFor="inMonate">{md(t.ersparnis.monate)}</label><input id="inMonate" type="number" min={1} max={24} step={1} inputMode="numeric" {...feld("monate")} /></div>
                    <div className="field"><label htmlFor="inStunden">{md(t.ersparnis.stunden)}</label><input id="inStunden" type="number" min={1} step={1} inputMode="numeric" {...feld("stunden")} /></div>
                    <div className="field"><label htmlFor="inRegel">{md(t.ersparnis.regel)}</label><input id="inRegel" type="number" min={1} step={1} inputMode="numeric" {...feld("regel")} /></div>
                  </div>
                  <div className="figures">
                    <div className="fig hero"><span className="v">{r ? eur(c.gesamt) : "—"}</span><span className="k">{md(t.ersparnis.figGesamt)}</span></div>
                    <div className="fig"><span className="v">{r ? eur(c.eigenanteil) : "—"}</span><span className="k">{md(t.ersparnis.figEigen)}</span></div>
                  </div>
                  <div className="card">
                    <h3>{md(t.ersparnis.aufschluesselung)}</h3>
                    {/* hervorgehoben: "davon gefördert" und "Lohnkosten der Weiterbildungsstunden" */}
                    <Rows rows={breakdown} hervor={r ? [1, 3] : []} />
                  </div>
                  <p className="footnote">{md(t.ersparnis.fussnote)}</p>
                </div>
              </section>

              {/* ---------- ABLAUF ---------- */}
              <section className={slideCls("Ablauf")} data-title="Ablauf">
                <div className="slide-head">
                  <h2>{md(t.ablauf.h2)}</h2>
                  <p className="lede">{md(t.ablauf.lede)}</p>
                </div>
                <div className="stack">
                  <div className="ablauf-raster">
                    <ol className="flow">
                      {t.ablauf.schritte.map(([s, e], i) => (
                        <li key={i} className={i === 1 ? "mark" : undefined}><span><strong>{md(s)}</strong><em>{md(e)}</em></span></li>
                      ))}
                    </ol>
                    <div className="ablauf-spalte">
                      <div className="card">
                        <h3>{md(t.ablauf.todoTitel)}</h3>
                        <ul className="bullets" style={{ marginTop: 12 }}>
                          {t.ablauf.todo.map((x, i) => (
                            <li key={i}><span className="tick">{i + 1}</span><span>{fill(x, { berater: berater.name })}</span></li>
                          ))}
                        </ul>
                      </div>
                      <div className="card" id="tnKarte">
                        <h3>{md(t.ablauf.tnTitel)}</h3>
                        <p>{fill(t.ablauf.tnText, { n: c.tn })}</p>
                        <div style={{ marginTop: 14, maxWidth: 260 }}>
                          {tnFeld("stepAnzahl", t.ablauf.anzahl)}
                        </div>
                        <div className="tn-liste">
                          <div className="tn-kopf">
                            <span></span>
                            {t.ablauf.spalten.map((s) => <span key={s}>{md(s)}</span>)}
                          </div>
                          {Array.from({ length: tnAnzahl }, (_, i) => {
                            const zeile = tnZeilen[i] ?? LEERE_ZEILE;
                            const kurs = kurseAuswahl.includes(zeile.kurs) ? zeile.kurs : "";
                            return (
                              <div className="tn-zeile" key={i}>
                                <span className="idx">{i + 1}.</span>
                                <input type="text" aria-label={fill(t.ablauf.aria.vorname, { i: i + 1 })} placeholder={t.ablauf.spalten[0]} value={zeile.vorname} onChange={(e) => setTnFeld(i, "vorname", e.target.value)} />
                                <input type="text" aria-label={fill(t.ablauf.aria.name, { i: i + 1 })} placeholder={t.ablauf.spalten[1]} value={zeile.name} onChange={(e) => setTnFeld(i, "name", e.target.value)} />
                                <select aria-label={fill(t.ablauf.aria.kurs, { i: i + 1 })} value={kurs} onChange={(e) => setTnFeld(i, "kurs", e.target.value)}>
                                  <option value="">{md(t.nochOffen)}</option>
                                  {kurseAuswahl.map((k) => (
                                    <option key={k} value={k}>{progName(k)}</option>
                                  ))}
                                </select>
                                <input type="text" aria-label={fill(t.ablauf.aria.position, { i: i + 1 })} placeholder={t.ablauf.positionPlatzhalter} value={zeile.position} onChange={(e) => setTnFeld(i, "position", e.target.value)} />
                              </div>
                            );
                          })}
                          <p className="tn-hinweis">{md(t.ablauf.hinweis)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- IHRE ANGABEN ---------- */}
              <section className={slideCls("Ihre Angaben")} data-title="Ihre Angaben">
                <div className="slide-head">
                  <h2>{md(t.angaben.h2)}</h2>
                  <p className="lede">{md(t.angaben.lede)}</p>
                </div>
                <div className="stack">
                  <div className="abschluss-raster">
                    <div className="spalte">
                      <div className="card" id="formKarte">
                        <h3>{md(t.angaben.formTitel)}</h3>
                        <div className="grid-3" style={{ gap: "10px 12px", marginTop: 12 }}>
                          {(
                            [
                              ["firma", "inFirma", "text"],
                              ["name", "inName", "text"],
                              ["rolle", "inRolle", "text"],
                              ["branche", "inBranche", "text"],
                              ["mail", "inMail", "email"],
                              ["telefon", "inTelefon", "tel"],
                              ["strasse", "inStrasse", "text"],
                              ["plz", "inPlz", "text"],
                              ["ort", "inOrt", "text"],
                            ] as [Angabe, string, string][]
                          ).map(([key, id, typ]) => {
                            const [label, platzhalter] = t.angaben.felder[key];
                            const pflicht = PFLICHT.includes(key);
                            return (
                              <div className="field" key={key}>
                                <label htmlFor={id}>
                                  {label}
                                  {pflicht && <span aria-hidden="true"> *</span>}
                                </label>
                                <input
                                  id={id}
                                  type={typ}
                                  autoComplete="off"
                                  inputMode={key === "plz" ? "numeric" : undefined}
                                  placeholder={platzhalter}
                                  aria-required={pflicht || undefined}
                                  {...feld(key)}
                                />
                              </div>
                            );
                          })}
                        </div>
                        <p className="footnote" style={{ marginTop: 14 }}>
                          {md(t.angaben.formNotiz)} <span aria-hidden="true">* {md(t.angaben.pflicht)}</span>
                        </p>
                      </div>
                      <div className="card">
                        <h3>{md(t.angaben.auswahlTitel)}</h3>
                        {angebote.length === 0 && (
                          <p className="ang-hinweis" id="angHinweis">{md(t.angaben.auswahlHinweis)}</p>
                        )}
                        <div className="ang-auswahl">
                          {gewaehlteAngebote.map((a) => (
                            <div className="ang-detail" key={a.nr}>
                              <b className="ang-dtitel">{a.titel}</b>
                              <p className="ang-text">{md(angText(a))}</p>
                              <p className="ang-doc">
                                <a href={ANGEBOTE_URL} title={a.pdf} target="_blank" rel="noopener noreferrer">{md(t.angaben.angebotOeffnen)}</a>
                                {" · "}
                                <a href={a.web} target="_blank" rel="noopener noreferrer">{md(t.angaben.kursseite)}</a>
                                <span className="ang-zul">{a.ue} {md(t.angaben.ue)} · {a.wochen} {md(t.angaben.wochen)} · {eur(a.preis)} {md(t.angaben.jeTn)} · {md(t.angaben.massnNr)} {a.nr} · DKZ {a.dkz}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="footnote" style={{ marginTop: 12 }}>
                          <a href={ANGEBOTE_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>
                            {md(t.angaben.alleUnterlagen)}
                          </a>{" "}
                          · {md(t.angaben.anbieterNr)} <span className="num">{ANBIETER_NR}</span> · {md(t.angaben.alleNotiz)}
                        </p>
                      </div>
                    </div>
                    <div className="spalte">
                      <div className="card" id="angListeKarte">
                        <h3>{md(t.angaben.listeTitel)}</h3>
                        <p style={{ fontSize: 14.5, color: "var(--ink-2)", marginTop: 6 }}>{md(t.angaben.listeText)}</p>
                        <div className="ang-liste">
                          {Object.entries(ANGEBOTE).flatMap(([prog, liste]) =>
                            liste.map((a) => {
                              const an = angebote.includes(a.nr);
                              return (
                                <div className={"ang-item" + (an ? " an" : "")} key={a.nr}>
                                  <button
                                    type="button"
                                    className="ang-toggle"
                                    aria-pressed={an}
                                    onClick={() => toggleList(angebote, setAngebote, a.nr)}
                                  >
                                    <span className="ang-box">✓</span>
                                    <span className="ang-kopf">
                                      <b>{a.titel}</b>
                                      <span className="ang-meta">{a.ue} {md(t.angaben.ue)} · {a.wochen} {md(t.angaben.wochen)} · {eur(a.preis)} · {md(t.angaben.massnNr)} {a.nr}</span>
                                    </span>
                                    {!an && progs.includes(prog) && <span className="ang-tag">{md(t.angaben.vorschlag)}</span>}
                                  </button>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- ERHEBUNGSBOGEN ANFORDERN ---------- */}
              <section className={slideCls("Erhebungsbogen anfordern")} data-title="Erhebungsbogen anfordern">
                <div className="slide-head">
                  <h2>{md(t.anfordern.h2)}</h2>
                  <p className="lede">
                    <strong>{md(t.anfordern.ledeStark)}</strong>
                    {md(t.anfordern.ledeVor)}
                    <a
                      href={FORMULAR_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={nachrichtKopieren}
                      style={{ color: "var(--accent)", fontWeight: 650, textDecoration: "none" }}
                    >
                      {md(t.anfordern.ledeLink)}
                    </a>
                    .
                  </p>
                </div>
                <div className="stack">
                  <div className="kanaele">
                    <a className="kanal" href={"tel:+49" + t.anfordern.telV.replace(/\D/g, "").replace(/^0/, "")}>
                      <span className="kanal-k">{md(t.anfordern.telK)}</span>
                      <span className="kanal-v">{md(t.anfordern.telV)}</span>
                      <span className="kanal-s">{md(t.anfordern.telS)}</span>
                    </a>
                    <a className="kanal kanal-web" href={FORMULAR_URL} target="_blank" rel="noopener noreferrer" onClick={nachrichtKopieren}>
                      <span className="kanal-k">{md(t.anfordern.webK)}</span>
                      <span className="kanal-v">{md(t.anfordern.webV)}</span>
                      <span className="kanal-s">{md(t.anfordern.webS)}</span>
                    </a>
                  </div>
                  <div className="anfordern-raster">
                    <div className="card">
                      <h3>{md(t.anfordern.bereitTitel)}</h3>
                      <p style={{ marginTop: 2 }}>{md(t.anfordern.bereitText)}</p>
                      <Rows rows={bereit} id="bereit" />
                    </div>
                    <div className="card">
                      <h3>{md(t.anfordern.nachrichtTitel)}</h3>
                      <p style={{ marginTop: 2 }}>{md(t.anfordern.nachrichtText)}</p>
                      <div className="nachricht">{md(t.anfordern.nachricht)}</div>
                      <button className="btn-quiet" id="nachrichtKopieren" type="button" onClick={nachrichtKopieren}>
                        {md(t.anfordern.kopieren)}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- ZUSAMMENFASSUNG ---------- */}
              <section className={slideCls("Zusammenfassung")} data-title="Zusammenfassung">
                <div className="slide-head">
                  <h2>{md(t.zusammenfassung.h2)}</h2>
                  <p className="lede">{md(t.zusammenfassung.lede)}</p>
                </div>
                <div className="stack">
                  <div className="abschluss-raster">
                    <div className="spalte">
                      <div className="card">
                        <h3>{md(t.zusammenfassung.titel)}</h3>
                        <Rows rows={summary} id="summary" />
                      </div>
                      <div className="card" id="absendenKarte">
                        <h3>{md(t.absenden.titel)}</h3>
                        <p style={{ marginTop: 2 }}>{md(t.absenden.text)}</p>
                        <div className="absenden-aktionen">
                          <button
                            className="nav-btn primary"
                            type="button"
                            onClick={absenden}
                            disabled={sende === "sending" || sende === "ok"}
                          >
                            {knopfText}
                          </button>
                          <button className="btn-quiet" type="button" onClick={csvLaden}>
                            {md(t.absenden.csv)}
                          </button>
                        </div>
                        {meldung && (
                          <div className={"verdict" + (sende === "ok" ? " ok" : "")} role="status" style={{ marginTop: 12 }}>
                            {meldung}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="spalte">
                      <div className="card">
                        <h3>{md(t.zusammenfassung.weiterTitel)}</h3>
                        <ol className="fahrplan">
                          {t.zusammenfassung.weiter.map(([b, s]) => (
                            <li key={b}><b>{md(b)}</b><span>{md(s)}</span></li>
                          ))}
                        </ol>
                        <p className="fahrplan-fazit">{md(t.zusammenfassung.fazit)}</p>
                      </div>
                      <div className="card" id="beraterKarte">
                        <h3>{md(t.zusammenfassung.beraterTitel)}</h3>
                        <div className="kontakt-foto">
                          {berater.foto && (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={berater.foto} alt={berater.name} />
                          )}
                          <div className="contact">
                            <span><strong>{berater.name}</strong> · Seminarkontor GmbH</span>
                            <span className="termin-ideal"><b>{termin.anzeige}</b></span>
                            <a className="termin-btn" href={termin.href} target="_blank" rel="noopener noreferrer">{md(t.zusammenfassung.buchen)}</a>
                            <a href="https://www.seminarkontor.com" target="_blank" rel="noopener noreferrer">www.seminarkontor.com</a>
                            <span className="berater-adresse">{md(t.zusammenfassung.adresse)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </main>

          {/* ================= PLAN RAIL ================= */}
          <aside className="rail-plan" aria-label={t.agenda.titel}>
            <div>
              <h3>{md(t.agenda.titel)}</h3>
              {(firma || person) && (
                <p className="footnote" style={{ marginTop: 4 }}>
                  {md(t.agenda.fuer)}
                  {firma || person}
                  {firma && person ? " · " + person : ""}
                </p>
              )}
            </div>
            <div className="plan-list">
              <PlanItem k={t.agenda.groesse} v={size ? t.quote.groessen[size] : t.nochOffen} filled={!!r} />
              <PlanItem k={t.agenda.satz} v={r ? fill(t.agenda.satzWert, { k: pct(r.kurs), l: pct(r.lohn) }) : t.nochOffen} filled={!!r} />
              <PlanItem
                k={t.agenda.req}
                v={reqCount === 3 ? t.agenda.reqAlle : reqCount > 0 ? fill(t.agenda.reqTeil, { n: reqCount }) : t.nochOffen}
                filled={reqCount === 3}
              />
              <PlanItem
                k={t.agenda.gutscheine}
                v={gutscheine !== null && ma !== null ? fill(t.agenda.gutscheineWert, { g: gutscheine, ma }) : t.nochOffen}
                filled={gutscheine !== null}
              />
              <PlanItem k={t.agenda.progs} v={progs.length ? progs.map(progName).join(" · ") : t.nochOffen} filled={progs.length > 0} />
              <PlanItem k={t.agenda.foerderung} v={r ? eur(c.gesamt) : t.nochOffen} filled={!!r} money />
            </div>
          </aside>
        </div>

        {/* ================= BOTTOM RAIL ================= */}
        <footer className="rail-bottom">
          <button className="nav-btn" type="button" disabled={idx === 0} onClick={() => go(idx - 1)}>
            {md(t.zurueck)}
          </button>
          {istLetzte ? (
            <button className="nav-btn primary" type="button" disabled={sende === "sending" || sende === "ok"} onClick={absenden}>
              {knopfText}
            </button>
          ) : (
            <button className="nav-btn primary" type="button" onClick={() => go(idx + 1)}>
              {md(t.weiter)}
            </button>
          )}
          <span className="counter">
            {String(idx + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
          </span>
        </footer>
      </div>

      <div className={"toast" + (toast.an ? " an" : "")} role="status" aria-live="polite">
        {toast.text}
      </div>
    </>
  );
}
