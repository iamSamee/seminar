"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ANBIETER_NR,
  ANGEBOTE,
  ANGEBOTE_URL,
  BILDER,
  FORMULAR_TEXT,
  FORMULAR_URL,
  KALENDER_URL,
  KUNDENSTIMMEN,
  PROGRAMME,
  RATES,
  SLIDES,
  type Angebot,
  type Exp,
  type SlideId,
  type Size,
} from "@/lib/data";
import { csvHeader, csvRow, type Submission } from "@/lib/submission";
import { TEXTE, type Lang } from "@/lib/texte";

/* ---------- Hilfsfunktionen ---------- */
const num = (v: string, fallback: number) => {
  const n = parseFloat(v);
  return isFinite(n) && n > 0 ? n : fallback;
};
const MAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Req = "std" | "abschluss" | "sv";
type TnZeile = { vorname: string; name: string; kurs: string; position: string };
type Row = [string, string];
type Sendestatus = "idle" | "sending" | "ok" | "fehler";

const LEERE_ZEILE: TnZeile = { vorname: "", name: "", kurs: "", position: "" };

const START_FELDER = {
  ma: "",
  kosten: "9000",
  gehalt: "3500",
  tn: "1",
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
          <span>{b}</span>
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

export default function Konsole({ lang = "de" }: { lang?: Lang }) {
  const t = TEXTE[lang];

  /* ---------- Formatierung je Sprache ---------- */
  const eur = (n: number) =>
    new Intl.NumberFormat(t.locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  const eur2 = (n: number) =>
    new Intl.NumberFormat(t.locale, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  const pct = (n: number) => Math.round(n * 100) + t.pctSuffix;
  const progName = (prog: string) => (lang === "en" ? PROGRAMME.find((p) => p.prog === prog)?.en.name ?? prog : prog);
  const angTitel = (a: Angebot) => (lang === "en" ? a.titelEn : a.titel);
  const angText = (a: Angebot) => (lang === "en" ? a.textEn : a.text);

  /* ---------- Zustand ---------- */
  const [idx, setIdx] = useState(0);
  const [exp, setExp] = useState<Exp | null>(null);
  const [size, setSize] = useState<Size | null>(null);
  const [req, setReq] = useState<Record<Req, boolean>>({ std: false, abschluss: false, sv: false });
  const [progs, setProgs] = useState<string[]>([]);
  const [angebote, setAngebote] = useState<string[]>([]);
  const [tnManual, setTnManual] = useState(false);
  const [anzManual, setAnzManual] = useState(false);
  const [anzahl, setAnzahl] = useState("");
  const [tnZeilen, setTnZeilen] = useState<TnZeile[]>([]);
  const [f, setF] = useState<Felder>(START_FELDER);
  const [toast, setToast] = useState<{ text: string; an: boolean }>({ text: "", an: false });
  const [druckDatum, setDruckDatum] = useState("");
  const [termin, setTermin] = useState<{ anzeige: string; href: string; iso: string }>({
    anzeige: t.terminIdeal + "…",
    href: KALENDER_URL,
    iso: "",
  });
  const [sende, setSende] = useState<Sendestatus>("idle");
  const [meldung, setMeldung] = useState("");

  const stageRef = useRef<HTMLElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const feld = (key: keyof Felder) => ({
    value: f[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setF((alt) => ({ ...alt, [key]: v }));
    },
  });
  const txt = (key: keyof Felder) => f[key].trim();

  /* ---------- Navigation ---------- */
  const go = (i: number) => {
    setIdx(Math.max(0, Math.min(SLIDES.length - 1, i)));
    if (stageRef.current) stageRef.current.scrollTop = 0;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  /* ---------- Idealer Folgetermin: 5 Tage nach der Beratung ---------- */
  useEffect(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + 5);
    if (d.getDay() === 6) d.setDate(d.getDate() + 2); /* Samstag -> Montag */
    else if (d.getDay() === 0) d.setDate(d.getDate() + 1); /* Sonntag -> Montag */
    const anzeige = d.toLocaleDateString(t.locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const zwei = (n: number) => (n < 10 ? "0" : "") + n;
    const iso = d.getFullYear() + "-" + zwei(d.getMonth() + 1) + "-" + zwei(d.getDate());
    /* Calendly oeffnet damit direkt den Monat/Tag */
    setDruckDatum(new Date().toLocaleDateString(t.locale, { day: "2-digit", month: "long", year: "numeric" }));
    setTermin({ anzeige: t.terminIdeal + anzeige, href: KALENDER_URL + "?month=" + iso.slice(0, 7) + "&date=" + iso, iso });
  }, [t.locale, t.terminIdeal]);

  /* ---------- Abgeleitete Werte ---------- */
  const r = size ? RATES[size] : null;
  const reqCount = (Object.keys(req) as Req[]).filter((k) => req[k]).length;

  const maNum = parseFloat(f.ma);
  const ma = isFinite(maNum) && maNum > 0 ? Math.round(maNum) : null;
  const gutscheine = ma ? Math.max(1, Math.floor(ma / 3)) : null;

  /* Teilnehmende aus dem Kontingent uebernehmen, solange nicht manuell gesetzt */
  const tnWert = !tnManual && gutscheine !== null ? String(gutscheine) : f.tn;

  const c = useMemo(() => {
    const kosten = num(f.kosten, 0);
    const gehalt = num(f.gehalt, 0);
    const tn = Math.max(1, Math.round(num(tnWert, 1)));
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
  }, [f.kosten, f.gehalt, f.monate, f.stunden, f.regel, tnWert, r]);

  /* Anzahl Personen auf Folie "Ablauf": folgt der Rechnung, bis manuell gesetzt */
  const anzahlWert = anzManual ? anzahl : String(c.tn);
  let tnAnzahl = parseInt(anzahlWert, 10);
  if (!isFinite(tnAnzahl) || tnAnzahl < 1) tnAnzahl = 1;
  if (tnAnzahl > 15) tnAnzahl = 15;
  const kurseAuswahl = progs.length ? progs : Object.keys(ANGEBOTE);
  const anzahlN = parseInt(anzahlWert, 10);

  const setTnFeld = (i: number, key: keyof TnZeile, v: string) => {
    setTnZeilen((alt) => {
      const neu = alt.slice();
      while (neu.length <= i) neu.push({ ...LEERE_ZEILE });
      neu[i] = { ...neu[i], [key]: v };
      return neu;
    });
  };

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
        [z.kursFoerder(pct(r.kurs)), eur(c.kursFoerder)],
        [z.stundenlohn, eur2(c.stundenlohn)],
        [z.lohnGesamt(Math.round(c.monate)), eur(c.lohnGesamt)],
        [z.lohnFoerder(pct(r.lohn)), eur(c.lohnFoerder)],
        [z.lohnProMonat, eur(c.lohnProMonat)],
        [z.jeTn, eur(c.kursFoerder + c.lohnFoerder)],
        [z.gesamt(c.tn), eur(c.gesamt)],
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
    [sz.req, sz.reqWert(reqCount)],
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
  const geplanteTn = (anzManual && anzahl.trim()) || String(c.tn);
  const bereit: Row[] = [
    [bz.firma, firma || offen],
    [bz.anschrift, anschrift || offen],
    [bz.person, person ? person + (rolle ? " (" + rolle + ")" : "") : offen],
    [bz.telefon, txt("telefon") || offen],
    [bz.mail, txt("mail") || offen],
    [bz.ma, ma !== null ? String(ma) : offen],
    [bz.tn, geplanteTn],
    [
      bz.kurs,
      gewaehlteAngebote.length
        ? gewaehlteAngebote.map((a) => angTitel(a) + " (" + t.angaben.massnNr + " " + a.nr + ")").join(", ")
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
    kopiere(FORMULAR_TEXT).then((ok) => zeigeHinweis(ok ? t.kopiertOk : t.kopiertFehler));

  /* Datensatz fuer Webhook und CSV — Programme und Massnahmen mit ihren
     amtlichen (deutschen) Bezeichnungen, unabhaengig von der Sprache */
  const baueSubmission = (): Submission => ({
    submittedAt: new Date().toISOString(),
    language: lang,
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
    priorExperience: exp,
    companySize: size,
    courseFundingRate: r ? r.kurs : null,
    wageSubsidyRate: r ? r.lohn : null,
    requirements: { minHours20: req.std, qualification2Years: req.abschluss, socialInsurance: req.sv, met: reqCount },
    employees: ma,
    possibleVouchers: gutscheine,
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
    plannedParticipants: parseInt(geplanteTn, 10) || c.tn,
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
    a.download = (lang === "en" ? "funding-plan-" : "foerderplan-") + name + "-" + daten.submittedAt.slice(0, 10) + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const absenden = async () => {
    if (sende === "sending" || sende === "ok") return;
    const fehlend = PFLICHT.filter((k) => !txt(k)).map((k) => t.angaben.felder[k][0]);
    const hinweis = fehlend.length
      ? t.absenden.fehlt(fehlend)
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
    setTnManual(false);
    setAnzManual(false);
    setAnzahl("");
    setTnZeilen([]);
    setF(START_FELDER);
    setSende("idle");
    setMeldung("");
    go(0);
  };

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
            <img src={BILDER.logo} alt={t.logoAlt} />
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
          <a className="toolbtn" href={t.wechsel.href} aria-label={t.wechsel.aria} hrefLang={lang === "de" ? "en" : "de"}>
            {t.wechsel.label}
          </a>
          <button className="toolbtn" type="button" onClick={reset}>
            {t.reset}
          </button>
        </header>

        <div className="print-kopf" aria-hidden="true">
          <h1>{t.druckTitel}</h1>
          <p>{(firma ? firma + " · " : "") + druckDatum}</p>
        </div>

        {/* ================= BODY ================= */}
        <div className="body">
          <main className="stage" ref={stageRef}>
            <div className="stage-inner">
              {/* ---------- KENNENLERNEN ---------- */}
              <section className={slideCls("Kennenlernen")} data-title="Kennenlernen">
                <div className="slide-head">
                  <h2>{t.kennenlernen.h2}</h2>
                  <p className="lede">{t.kennenlernen.lede}</p>
                </div>
                <div className="stack">
                  <div className="card">
                    <h3>{t.kennenlernen.fahrplanTitel}</h3>
                    <ul className="bullets" style={{ marginTop: 12 }}>
                      {t.kennenlernen.fahrplan.map((p, i) => (
                        <li key={i}><span className="tick">{i + 1}</span><span>{p}</span></li>
                      ))}
                    </ul>
                    <p className="footnote" style={{ marginTop: 14 }}>{t.kennenlernen.fahrplanNotiz}</p>
                  </div>
                  <div className="proof">
                    <h3>{t.kennenlernen.proofTitel}</h3>
                    <p className="proof-lede">{t.kennenlernen.proofLede}</p>
                    <div className="proof-grid">
                      {t.kennenlernen.proof.map(([b, s]) => (
                        <div key={b}><b>{b}</b><span>{s}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- VORERFAHRUNG ---------- */}
              <section className={slideCls("Vorerfahrung")} data-title="Vorerfahrung">
                <div className="slide-head">
                  <h2>{t.vorerfahrung.h2}</h2>
                  <p className="lede">{t.vorerfahrung.lede}</p>
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
                        {t.vorerfahrung.antworten[k]}
                      </button>
                    ))}
                  </div>
                  <div className="verdict">{exp ? t.vorerfahrung.bridge[exp] : t.vorerfahrung.standard}</div>
                  <div className="traeger">
                    <b>{t.traeger}</b>
                    <div className="traeger-siegel">
                      <span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={BILDER.azav} alt={t.azavAlt} />
                        <span>{t.azavKurz}</span>
                      </span>
                      <span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={BILDER.iso} alt={t.isoAlt} />
                        <span>{t.isoKurz}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- SEMINARKONTOR ---------- */}
              <section className={slideCls("Seminarkontor")} data-title="Seminarkontor">
                <div className="slide-head">
                  <h2>{t.traeger}</h2>
                  <p className="lede">{t.seminarkontor.lede}</p>
                </div>
                <div className="stack">
                  <ul className="facts">
                    {t.seminarkontor.fakten.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                  <div className="grid-2" style={{ alignItems: "start" }}>
                    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", alignItems: "stretch" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={BILDER.oscar} alt="Oscar Nobre" style={{ width: 132, flex: "none", objectFit: "cover", objectPosition: "top" }} />
                      <div style={{ padding: "16px 18px" }}>
                        <h3>Oscar Nobre</h3>
                        <p style={{ color: "var(--accent)", fontWeight: 600, fontSize: 13.5, marginBottom: 8 }}>
                          {t.seminarkontor.oscarRolle}
                        </p>
                        <p>{t.seminarkontor.oscarText}</p>
                      </div>
                    </div>
                    <div className="card">
                      <h3>{t.seminarkontor.zertTitel}</h3>
                      <ul className="bullets" style={{ marginTop: 12 }}>
                        {t.seminarkontor.zert.map((x, i) => (
                          <li key={i}><span className="tick">✓</span><span>{x}</span></li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="footnote">{t.seminarkontor.fussnote}</p>
                </div>
              </section>

              {/* ---------- UNSERE DOZENTEN ---------- */}
              <section className={slideCls("Unsere Dozenten")} data-title="Unsere Dozenten">
                <div className="slide-head">
                  <h2>{t.dozenten.h2}</h2>
                  <p className="lede">{t.dozenten.lede}</p>
                </div>
                <div className="stack">
                  <div className="proof">
                    <h3>{t.dozenten.proofTitel}</h3>
                    <p className="proof-lede">{t.dozenten.proofLede}</p>
                    <div className="proof-grid vier">
                      {t.dozenten.proof.map(([b, s]) => (
                        <div key={b}><b>{b}</b><span>{s}</span></div>
                      ))}
                    </div>
                  </div>

                  {KUNDENSTIMMEN.length > 0 && (
                    <div>
                      <h3 style={{ fontSize: 16, marginBottom: 10 }}>{t.dozenten.stimmenTitel}</h3>
                      <div className="quotes">
                        {KUNDENSTIMMEN.map((q, i) => (
                          <figure className="quote" key={i}>
                            {q.sterne ? (
                              <div className="stars">{"★".repeat(Math.max(0, Math.min(5, q.sterne)))}</div>
                            ) : null}
                            <p>„{q.text}“</p>
                            {q.quelle && <figcaption>{q.quelle}</figcaption>}
                          </figure>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid-3">
                    {t.dozenten.karten.map(([h, p]) => (
                      <div className="card" key={h}><h3>{h}</h3><p>{p}</p></div>
                    ))}
                  </div>
                </div>
              </section>

              {/* ---------- AUSGANGSLAGE ---------- */}
              <section className={slideCls("Ausgangslage")} data-title="Ausgangslage">
                <div className="slide-head">
                  <h2>{t.ausgangslage.h2}</h2>
                  <p className="lede">{t.ausgangslage.lede}</p>
                </div>
                <div className="stack">
                  <div className="grid-3">
                    {t.ausgangslage.karten.map(([h, p]) => (
                      <div className="card" key={h}><h3>{h}</h3><p>{p}</p></div>
                    ))}
                  </div>
                  <div className="card">
                    <h3>{t.ausgangslage.nutzenTitel}</h3>
                    <ul className="bullets" style={{ marginTop: 12 }}>
                      {t.ausgangslage.nutzen.map((x, i) => (
                        <li key={i}><span className="tick">✓</span><span>{x}</span></li>
                      ))}
                    </ul>
                  </div>
                  <div className="schluss">
                    <b>{t.ausgangslage.schluss[0]}</b>
                    <span>{t.ausgangslage.schluss[1]}</span>
                  </div>
                </div>
              </section>

              {/* ---------- BILDUNGSGUTSCHEIN ---------- */}
              <section className={slideCls("Bildungsgutschein")} data-title="Bildungsgutschein">
                <div className="slide-head">
                  <h2>{t.gutschein.h2}</h2>
                  <p className="lede">{t.gutschein.lede}</p>
                </div>
                <div className="stack">
                  <div className="grid-3">
                    {t.gutschein.karten.map(([h, p]) => (
                      <div className="card" key={h}><h3>{h}</h3><p>{p}</p></div>
                    ))}
                  </div>
                  <div className="schluss">
                    <b>{t.gutschein.schluss[0]}</b>
                    <span>{t.gutschein.schluss[1]}</span>
                  </div>
                </div>
              </section>

              {/* ---------- FÖRDERQUOTE ---------- */}
              <section className={slideCls("Förderquote")} data-title="Förderquote">
                <div className="slide-head">
                  <h2>{t.quote.h2}</h2>
                  <p className="lede">{t.quote.lede}</p>
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
                        {t.quote.groessen[s]}
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
                            <td>{t.quote.zeilen[s]}</td>
                            <td className="n">{pct(RATES[s].kurs)}</td>
                            <td className="n">{pct(RATES[s].lohn)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="figures">
                    <div className="fig"><span className="v">{r ? pct(r.kurs) : "—"}</span><span className="k">{t.quote.figs[0]}</span></div>
                    <div className="fig"><span className="v">{r ? pct(r.lohn) : "—"}</span><span className="k">{t.quote.figs[1]}</span></div>
                    <div className="fig"><span className="v">{r ? pct(1 - r.kurs) : "—"}</span><span className="k">{t.quote.figs[2]}</span></div>
                  </div>
                  <div className="schluss">
                    <b>{t.quote.schluss[0]}</b>
                    <span>{t.quote.schluss[1]}</span>
                  </div>
                </div>
              </section>

              {/* ---------- VORAUSSETZUNGEN ---------- */}
              <section className={slideCls("Voraussetzungen")} data-title="Voraussetzungen">
                <div className="slide-head">
                  <h2>{t.voraus.h2}</h2>
                  <p className="lede">{t.voraus.lede}</p>
                </div>
                <div className="stack">
                  <div className="stack" style={{ gap: 8 }}>
                    {t.voraus.kriterien.map(([k, main, sub]) => (
                      <button
                        key={k}
                        type="button"
                        className="toggle"
                        aria-pressed={req[k]}
                        onClick={() => setReq((alt) => ({ ...alt, [k]: !alt[k] }))}
                      >
                        <span className="box" aria-hidden="true">✓</span>
                        <span>
                          <span className="t-main">{main}</span>
                          <span className="t-sub">{sub}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className={"verdict" + (reqCount === 3 ? " ok" : "")}>{t.voraus.urteil(reqCount)}</div>
                  <div className="schluss">
                    <b>{t.voraus.schluss[0]}</b>
                    <span>{t.voraus.schluss[1]}</span>
                  </div>
                </div>
              </section>

              {/* ---------- KONTINGENT ---------- */}
              <section className={slideCls("Ihr Kontingent")} data-title="Ihr Kontingent">
                <div className="slide-head">
                  <h2>{t.kontingent.h2}</h2>
                  <p className="lede">{t.kontingent.lede}</p>
                </div>
                <div className="stack">
                  <div className="grid-2">
                    <div className="card">
                      <h3>{t.kontingent.kartenTitel}</h3>
                      <p style={{ marginBottom: 12 }}>{t.kontingent.regel}</p>
                      <div className="field">
                        <label htmlFor="inMA">{t.kontingent.maLabel}</label>
                        <input id="inMA" type="number" min={1} max={100000} step={1} placeholder={t.kontingent.maPlatzhalter} inputMode="numeric" {...feld("ma")} />
                      </div>
                    </div>
                    <div className="fig" style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <span className="v">{gutscheine !== null ? String(gutscheine) : "—"}</span>
                      <span className="k">{t.kontingent.figK}</span>
                    </div>
                  </div>
                  <div className="empfehlung">
                    <span className="empfehlung-k">{t.kontingent.empfK}</span>
                    <p>{t.kontingent.empf}</p>
                  </div>
                  <p className="footnote">{t.kontingent.fussnote}</p>
                </div>
              </section>

              {/* ---------- WEITERBILDUNGEN ---------- */}
              <section className={slideCls("Weiterbildungen")} data-title="Weiterbildungen">
                <div className="slide-head">
                  <h2>{t.weiterbildungen.h2}</h2>
                  <p className="lede">{t.weiterbildungen.lede}</p>
                </div>
                <div className="stack">
                  <div className="prog">
                    {PROGRAMME.map((p) => {
                      const anz = lang === "en" ? p.en : p;
                      return (
                        <div className="prog-item" key={p.prog}>
                          <button
                            type="button"
                            className="prog-card"
                            aria-pressed={progs.includes(p.prog)}
                            onClick={() => toggleList(progs, setProgs, p.prog)}
                          >
                            <span className="pc-t">{anz.titel}</span>
                            <span className="pc-d">{anz.text}</span>
                            <span className="pc-ue">{anz.ue}</span>
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
                          <img src={BILDER.azav} alt={t.azavAlt} />
                        </span>
                        <span className="seal-body">
                          <b>{t.azavKurz}</b>
                          <span>{t.weiterbildungen.azav[0]}</span>
                          <em>{t.weiterbildungen.azav[1]}</em>
                        </span>
                      </div>
                      <div className="seal">
                        <span className="seal-plate">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={BILDER.iso} alt={t.isoAlt} />
                        </span>
                        <span className="seal-body">
                          <b>{t.isoKurz}</b>
                          <span>{t.weiterbildungen.iso[0]}</span>
                          <em>{t.weiterbildungen.iso[1]}</em>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- IHRE ERSPARNIS ---------- */}
              <section className={slideCls("Ihre Ersparnis")} data-title="Ihre Ersparnis">
                <div className="slide-head">
                  <h2>{t.ersparnis.h2}</h2>
                  <p className="lede">{t.ersparnis.lede}</p>
                </div>
                <div className="stack">
                  <div className="grid-3">
                    <div className="field"><label htmlFor="inKosten">{t.ersparnis.kosten}</label><input id="inKosten" type="number" min={0} step={100} inputMode="numeric" {...feld("kosten")} /></div>
                    <div className="field"><label htmlFor="inGehalt">{t.ersparnis.gehalt}</label><input id="inGehalt" type="number" min={0} step={100} inputMode="numeric" {...feld("gehalt")} /></div>
                    <div className="field">
                      <label htmlFor="inTN">{t.ersparnis.tn}</label>
                      <input
                        id="inTN"
                        type="number"
                        min={1}
                        step={1}
                        inputMode="numeric"
                        value={tnWert}
                        onChange={(e) => {
                          const v = e.target.value;
                          setTnManual(true);
                          setF((alt) => ({ ...alt, tn: v }));
                        }}
                      />
                      {tnManual ? (
                        <span className="fhint">{t.ersparnis.manuell}</span>
                      ) : gutscheine !== null && ma !== null ? (
                        <span className="fhint">{t.ersparnis.ausKontingent(ma)}</span>
                      ) : null}
                    </div>
                    <div className="field"><label htmlFor="inMonate">{t.ersparnis.monate}</label><input id="inMonate" type="number" min={1} max={24} step={1} inputMode="numeric" {...feld("monate")} /></div>
                    <div className="field"><label htmlFor="inStunden">{t.ersparnis.stunden}</label><input id="inStunden" type="number" min={1} step={1} inputMode="numeric" {...feld("stunden")} /></div>
                    <div className="field"><label htmlFor="inRegel">{t.ersparnis.regel}</label><input id="inRegel" type="number" min={1} step={1} inputMode="numeric" {...feld("regel")} /></div>
                  </div>
                  <div className="figures">
                    <div className="fig hero"><span className="v">{r ? eur(c.gesamt) : "—"}</span><span className="k">{t.ersparnis.figGesamt}</span></div>
                    <div className="fig"><span className="v">{r ? eur(c.eigenanteil) : "—"}</span><span className="k">{t.ersparnis.figEigen}</span></div>
                  </div>
                  <div className="card">
                    <h3>{t.ersparnis.aufschluesselung}</h3>
                    {/* hervorgehoben: "davon gefördert" und "Lohnkosten der Weiterbildungsstunden" */}
                    <Rows rows={breakdown} hervor={r ? [1, 3] : []} />
                  </div>
                  <p className="footnote">{t.ersparnis.fussnote}</p>
                </div>
              </section>

              {/* ---------- ABLAUF ---------- */}
              <section className={slideCls("Ablauf")} data-title="Ablauf">
                <div className="slide-head">
                  <h2>{t.ablauf.h2}</h2>
                  <p className="lede">{t.ablauf.lede}</p>
                </div>
                <div className="stack">
                  <div className="ablauf-raster">
                    <ol className="flow">
                      {t.ablauf.schritte.map(([s, e], i) => (
                        <li key={i} className={i === 1 ? "mark" : undefined}><span><strong>{s}</strong><em>{e}</em></span></li>
                      ))}
                    </ol>
                    <div className="ablauf-spalte">
                      <div className="card">
                        <h3>{t.ablauf.todoTitel}</h3>
                        <ul className="bullets" style={{ marginTop: 12 }}>
                          {t.ablauf.todo.map((x, i) => (
                            <li key={i}><span className="tick">{i + 1}</span><span>{x}</span></li>
                          ))}
                        </ul>
                      </div>
                      <div className="card" id="tnKarte">
                        <h3>{t.ablauf.tnTitel}</h3>
                        <p>{isFinite(anzahlN) && anzahlN > 0 ? t.ablauf.tnText(anzahlN) : t.ablauf.tnTextLeer}</p>
                        <div style={{ marginTop: 14, maxWidth: 260 }}>
                          <div className="field">
                            <label htmlFor="stepAnzahl">{t.ablauf.anzahl}</label>
                            <input
                              id="stepAnzahl"
                              type="number"
                              min={1}
                              max={15}
                              step={1}
                              inputMode="numeric"
                              value={anzahlWert}
                              onChange={(e) => {
                                setAnzManual(true);
                                setAnzahl(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                        <div className="tn-liste">
                          <div className="tn-kopf">
                            <span></span>
                            {t.ablauf.spalten.map((s) => <span key={s}>{s}</span>)}
                          </div>
                          {Array.from({ length: tnAnzahl }, (_, i) => {
                            const zeile = tnZeilen[i] ?? LEERE_ZEILE;
                            const kurs = kurseAuswahl.includes(zeile.kurs) ? zeile.kurs : "";
                            return (
                              <div className="tn-zeile" key={i}>
                                <span className="idx">{i + 1}.</span>
                                <input type="text" aria-label={t.ablauf.aria.vorname(i + 1)} placeholder={t.ablauf.spalten[0]} value={zeile.vorname} onChange={(e) => setTnFeld(i, "vorname", e.target.value)} />
                                <input type="text" aria-label={t.ablauf.aria.name(i + 1)} placeholder={t.ablauf.spalten[1]} value={zeile.name} onChange={(e) => setTnFeld(i, "name", e.target.value)} />
                                <select aria-label={t.ablauf.aria.kurs(i + 1)} value={kurs} onChange={(e) => setTnFeld(i, "kurs", e.target.value)}>
                                  <option value="">{t.nochOffen}</option>
                                  {kurseAuswahl.map((k) => (
                                    <option key={k} value={k}>{progName(k)}</option>
                                  ))}
                                </select>
                                <input type="text" aria-label={t.ablauf.aria.position(i + 1)} placeholder={t.ablauf.positionPlatzhalter} value={zeile.position} onChange={(e) => setTnFeld(i, "position", e.target.value)} />
                              </div>
                            );
                          })}
                          <p className="tn-hinweis">{t.ablauf.hinweis}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- IHRE ANGABEN ---------- */}
              <section className={slideCls("Ihre Angaben")} data-title="Ihre Angaben">
                <div className="slide-head">
                  <h2>{t.angaben.h2}</h2>
                  <p className="lede">{t.angaben.lede}</p>
                </div>
                <div className="stack">
                  <div className="abschluss-raster">
                    <div className="spalte">
                      <div className="card" id="formKarte">
                        <h3>{t.angaben.formTitel}</h3>
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
                          {t.angaben.formNotiz} <span aria-hidden="true">* {t.angaben.pflicht}</span>
                        </p>
                      </div>
                      <div className="card">
                        <h3>{t.angaben.auswahlTitel}</h3>
                        {angebote.length === 0 && (
                          <p className="ang-hinweis" id="angHinweis">{t.angaben.auswahlHinweis}</p>
                        )}
                        <div className="ang-auswahl">
                          {gewaehlteAngebote.map((a) => (
                            <div className="ang-detail" key={a.nr}>
                              <b className="ang-dtitel">{angTitel(a)}</b>
                              <p className="ang-text">{angText(a)}</p>
                              <p className="ang-doc">
                                <a href={ANGEBOTE_URL} title={a.pdf} target="_blank" rel="noopener noreferrer">{t.angaben.angebotOeffnen}</a>
                                {" · "}
                                <a href={a.web} target="_blank" rel="noopener noreferrer">{t.angaben.kursseite}</a>
                                <span className="ang-zul">{a.ue} {t.angaben.ue} · {t.angaben.massnNr} {a.nr} · DKZ {a.dkz}</span>
                              </p>
                            </div>
                          ))}
                        </div>
                        <p className="footnote" style={{ marginTop: 12 }}>
                          <a href={ANGEBOTE_URL} target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)", fontWeight: 600 }}>
                            {t.angaben.alleUnterlagen}
                          </a>{" "}
                          · {t.angaben.anbieterNr} <span className="num">{ANBIETER_NR}</span> · {t.angaben.alleNotiz}
                        </p>
                      </div>
                    </div>
                    <div className="spalte">
                      <div className="card" id="angListeKarte">
                        <h3>{t.angaben.listeTitel}</h3>
                        <p style={{ fontSize: 14.5, color: "var(--ink-2)", marginTop: 6 }}>{t.angaben.listeText}</p>
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
                                      <b>{angTitel(a)}</b>
                                      <span className="ang-meta">{a.ue} {t.angaben.ue} · {t.angaben.massnNr} {a.nr}</span>
                                    </span>
                                    {!an && progs.includes(prog) && <span className="ang-tag">{t.angaben.vorschlag}</span>}
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
                  <h2>{t.anfordern.h2}</h2>
                  <p className="lede">
                    <strong>{t.anfordern.ledeStark}</strong>
                    {t.anfordern.ledeVor}
                    <a
                      href={FORMULAR_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={nachrichtKopieren}
                      style={{ color: "var(--accent)", fontWeight: 650, textDecoration: "none" }}
                    >
                      {t.anfordern.ledeLink}
                    </a>
                    .
                  </p>
                </div>
                <div className="stack">
                  <div className="kanaele">
                    <a className="kanal" href="tel:+498004555520">
                      <span className="kanal-k">{t.anfordern.telK}</span>
                      <span className="kanal-v">0800 4 555520</span>
                      <span className="kanal-s">{t.anfordern.telS}</span>
                    </a>
                    <a className="kanal kanal-web" href={FORMULAR_URL} target="_blank" rel="noopener noreferrer" onClick={nachrichtKopieren}>
                      <span className="kanal-k">{t.anfordern.webK}</span>
                      <span className="kanal-v">{t.anfordern.webV}</span>
                      <span className="kanal-s">{t.anfordern.webS}</span>
                    </a>
                  </div>
                  <div className="anfordern-raster">
                    <div className="card">
                      <h3>{t.anfordern.bereitTitel}</h3>
                      <p style={{ marginTop: 2 }}>{t.anfordern.bereitText}</p>
                      <Rows rows={bereit} id="bereit" />
                    </div>
                    <div className="card">
                      <h3>{t.anfordern.nachrichtTitel}</h3>
                      <p style={{ marginTop: 2 }}>{t.anfordern.nachrichtText}</p>
                      <div className="nachricht" lang="de">{FORMULAR_TEXT}</div>
                      {t.anfordern.nachrichtUebersetzung && (
                        <p className="footnote" style={{ marginTop: 8 }}>{t.anfordern.nachrichtUebersetzung}</p>
                      )}
                      <button className="btn-quiet" id="nachrichtKopieren" type="button" onClick={nachrichtKopieren}>
                        {t.anfordern.kopieren}
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* ---------- ZUSAMMENFASSUNG ---------- */}
              <section className={slideCls("Zusammenfassung")} data-title="Zusammenfassung">
                <div className="slide-head">
                  <h2>{t.zusammenfassung.h2}</h2>
                  <p className="lede">{t.zusammenfassung.lede}</p>
                </div>
                <div className="stack">
                  <div className="abschluss-raster">
                    <div className="spalte">
                      <div className="card">
                        <h3>{t.zusammenfassung.titel}</h3>
                        <Rows rows={summary} id="summary" />
                      </div>
                      <div className="card" id="absendenKarte">
                        <h3>{t.absenden.titel}</h3>
                        <p style={{ marginTop: 2 }}>{t.absenden.text}</p>
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
                            {t.absenden.csv}
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
                        <h3>{t.zusammenfassung.weiterTitel}</h3>
                        <ol className="fahrplan">
                          {t.zusammenfassung.weiter.map(([b, s]) => (
                            <li key={b}><b>{b}</b><span>{s}</span></li>
                          ))}
                        </ol>
                        <p className="fahrplan-fazit">{t.zusammenfassung.fazit}</p>
                      </div>
                      <div className="card" id="beraterKarte">
                        <h3>{t.zusammenfassung.beraterTitel}</h3>
                        <div className="kontakt-foto">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={BILDER.oscar} alt="Oscar Nobre" />
                          <div className="contact">
                            <span><strong>Oscar Nobre</strong> · Seminarkontor GmbH</span>
                            <span className="termin-ideal"><b>{termin.anzeige}</b></span>
                            <a className="termin-btn" href={termin.href} target="_blank" rel="noopener noreferrer">{t.zusammenfassung.buchen}</a>
                            <a href="https://www.seminarkontor.com" target="_blank" rel="noopener noreferrer">www.seminarkontor.com</a>
                            <span className="berater-adresse">{t.zusammenfassung.adresse}</span>
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
              <h3>{t.agenda.titel}</h3>
              {(firma || person) && (
                <p className="footnote" style={{ marginTop: 4 }}>
                  {t.agenda.fuer}
                  {firma || person}
                  {firma && person ? " · " + person : ""}
                </p>
              )}
            </div>
            <div className="plan-list">
              <PlanItem k={t.agenda.groesse} v={size ? t.quote.groessen[size] : t.nochOffen} filled={!!r} />
              <PlanItem k={t.agenda.satz} v={r ? t.agenda.satzWert(pct(r.kurs), pct(r.lohn)) : t.nochOffen} filled={!!r} />
              <PlanItem
                k={t.agenda.req}
                v={reqCount === 3 ? t.agenda.reqAlle : reqCount > 0 ? t.agenda.reqTeil(reqCount) : t.nochOffen}
                filled={reqCount === 3}
              />
              <PlanItem
                k={t.agenda.gutscheine}
                v={gutscheine !== null && ma !== null ? t.agenda.gutscheineWert(gutscheine, ma) : t.nochOffen}
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
            {t.zurueck}
          </button>
          {istLetzte ? (
            <button className="nav-btn primary" type="button" disabled={sende === "sending" || sende === "ok"} onClick={absenden}>
              {knopfText}
            </button>
          ) : (
            <button className="nav-btn primary" type="button" onClick={() => go(idx + 1)}>
              {t.weiter}
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
