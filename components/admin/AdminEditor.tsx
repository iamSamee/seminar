"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SLIDES } from "@/lib/data";
import { platzhalter, textStuecke } from "@/lib/inhalt";

type Werte = Record<string, string>;
type Version = { name: string; zeit: string; anzahl: number };
type Nav = "alle" | "rahmen" | number;
type Ordnung = { key: string; inFolie: boolean; sichtbar: boolean; y: number; x: number }[];

/* Reihenfolge und Überschriften der Abschnitte (entspricht den Folien) */
const GRUPPEN: [string, string][] = [
  ["allgemein", "Allgemein & Navigation"],
  ["folien", "Folientitel (Navigation oben)"],
  ["kennenlernen", "Folie 1 · Kennenlernen"],
  ["vorerfahrung", "Folie 2 · Vorerfahrung"],
  ["seminarkontor", "Folie 3 · Seminarkontor"],
  ["dozenten", "Folie 4 · Unsere Dozenten"],
  ["kundenstimmen", "Folie 4 · Kundenstimmen (leere Einträge bleiben unsichtbar)"],
  ["ausgangslage", "Folie 5 · Ausgangslage"],
  ["gutschein", "Folie 6 · Bildungsgutschein"],
  ["quote", "Folie 7 · Förderquote"],
  ["voraus", "Folie 8 · Voraussetzungen"],
  ["kontingent", "Folie 9 · Ihr Kontingent"],
  ["weiterbildungen", "Folie 10 · Weiterbildungen"],
  ["programme", "Folie 10 · Programm-Karten"],
  ["ersparnis", "Folie 11 · Ihre Ersparnis"],
  ["ablauf", "Folie 12 · Ablauf"],
  ["angaben", "Folie 13 · Ihre Angaben"],
  ["angebote", "Folie 13 · Beschreibungen der Bildungsangebote"],
  ["anfordern", "Folie 14 · Erhebungsbogen anfordern"],
  ["zusammenfassung", "Folie 15 · Zusammenfassung"],
  ["absenden", "Folie 15 · Absenden"],
  ["agenda", "Seitenleiste · Unsere Agenda"],
  ["meta", "Browser-Tab & Suchmaschinen"],
];

const WORT: Record<string, string> = {
  h2: "Überschrift",
  lede: "Einleitung",
  titel: "Titel",
  text: "Text",
  beschreibung: "Beschreibung",
  karten: "Karte",
  proof: "Punkt",
  proofTitel: "Kasten · Überschrift",
  proofLede: "Kasten · Text",
  fussnote: "Fußnote",
  schluss: "Abschluss",
  fahrplan: "Fahrplan-Punkt",
  fahrplanTitel: "Fahrplan · Überschrift",
  fahrplanNotiz: "Fahrplan · Hinweis",
  zeilen: "Zeile",
  quelle: "Quelle / Name",
  sterne: "Sterne (1–5)",
  kriterien: "Kriterium",
  label: "Bezeichnung",
  antworten: "Antwort-Knopf",
  bridge: "Reaktion auf Antwort",
  groessen: "Größe (Knopf)",
  kopf: "Tabellenkopf",
  figs: "Kennzahl",
  felder: "Feld",
  spalten: "Spalte",
  schritte: "Schritt",
  todo: "To-do",
  weiter: "Nächster Schritt",
  aria: "Vorlesetext (Barrierefreiheit)",
  nutzen: "Nutzen-Punkt",
  zert: "Zertifizierung",
  fakten: "Fakt",
  empf: "Empfehlung",
  empfK: "Empfehlung · Überschrift",
  regel: "Faustregel",
  bgsLabel: "Gutscheine · Feldname",
  bgsVorschlag: "Gutscheine · Vorschlagstext",
  bgsUebernehmen: "Gutscheine · Link „Vorschlag übernehmen“",
  maLabel: "Mitarbeitende · Feldname",
  maPlatzhalter: "Mitarbeitende · Beispiel im leeren Feld",
  figK: "Text unter der großen Zahl",
  kartenTitel: "Karten-Überschrift",
  kursMeta: "Zeile unter jeder Karte (UE/Wochen)",
  urteilAlle: "Ergebnis · alle erfüllt",
  urteilTeil: "Ergebnis · teilweise erfüllt",
  urteilKeine: "Ergebnis · noch nichts gewählt",
  nachricht: "Nachricht für das Kontaktformular",
  telV: "Telefonnummer",
  telK: "Telefon · Überschrift",
  telS: "Telefon · Unterzeile",
  kostenHinweis: "Hinweis unter Kurskosten",
  oscarName: "Name",
  oscarRolle: "Rolle",
  oscarText: "Text",
  meta: "Seite",
};

const BILD_NAMEN: Record<string, string> = {
  logo: "Logo (oben links)",
  oscar: "Foto auf Folie „Seminarkontor“",
  azav: "Siegel AZAV",
  iso: "Siegel ISO 9001",
};

/* "texte.kennenlernen.proof.0.1" -> Gruppe "kennenlernen", Rest ["proof","0","1"] */
function zerlege(pfad: string): { gruppe: string; rest: string[] } {
  const t = pfad.split(".");
  if (t[0] === "texte") return t.length === 2 ? { gruppe: "allgemein", rest: [t[1]] } : { gruppe: t[1], rest: t.slice(2) };
  return { gruppe: t[0], rest: t.slice(1) };
}

function beschriftung(rest: string[], namen: Record<string, string>) {
  return rest
    .map((s) =>
      /^\d+$/.test(s)
        ? "Nr. " + (Number(s) + 1)
        : namen[s] ?? WORT[s] ?? s.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase())
    )
    .join(" › ");
}

const zeitText = (iso: string) => {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export default function AdminEditor({
  standard,
  gespeichert: gespeichertStart,
  versionenStart,
  namen,
}: {
  standard: Werte;
  gespeichert: Werte;
  versionenStart: Version[];
  namen: Record<string, string>;
}) {
  const [gespeichert, setGespeichert] = useState<Werte>(gespeichertStart);
  const [werte, setWerte] = useState<Werte>(gespeichertStart);
  const [versionen, setVersionen] = useState<Version[]>(versionenStart);
  const [suche, setSuche] = useState("");
  const [status, setStatus] = useState<{ text: string; art: "ok" | "fehler" | "info" } | null>(null);
  const [speichert, setSpeichert] = useState(false);
  const [sicher, setSicher] = useState<string | null>(null); /* Zwei-Klick-Bestätigung */
  const sicherTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wert = (k: string) => werte[k] ?? standard[k];
  const geaendert = useMemo(() => {
    const keys = new Set([...Object.keys(werte), ...Object.keys(gespeichert)]);
    return [...keys].filter((k) => werte[k] !== gespeichert[k]).length;
  }, [werte, gespeichert]);

  useEffect(() => {
    if (!geaendert) return;
    const warnen = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warnen);
    return () => window.removeEventListener("beforeunload", warnen);
  }, [geaendert]);

  const setze = (k: string, v: string) =>
    setWerte((alt) => {
      const neu = { ...alt };
      if (v === standard[k]) delete neu[k];
      else neu[k] = v;
      return neu;
    });

  const bestaetigen = (id: string, aktion: () => void) => {
    if (sicher === id) {
      setSicher(null);
      aktion();
      return;
    }
    setSicher(id);
    if (sicherTimer.current) clearTimeout(sicherTimer.current);
    sicherTimer.current = setTimeout(() => setSicher(null), 4000);
  };

  const abgelaufen = () => {
    setStatus({ text: "Sitzung abgelaufen — bitte neu anmelden. Ungespeicherte Änderungen gehen dabei verloren.", art: "fehler" });
  };

  /* ---------- Speichern ---------- */
  const speichern = async () => {
    setSpeichert(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/inhalt", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aenderungen: werte }),
      });
      if (res.status === 401) return abgelaufen();
      const antwort = (await res.json()) as { ok: boolean; aenderungen?: Werte; versionen?: Version[]; fehler?: string[] };
      if (!res.ok || !antwort.ok) throw new Error(antwort.fehler?.join(", ") || String(res.status));
      setGespeichert(antwort.aenderungen ?? {});
      setWerte(antwort.aenderungen ?? {});
      if (antwort.versionen) setVersionen(antwort.versionen);
      setStatus({ text: "Gespeichert — die Änderungen sind sofort online.", art: "ok" });
    } catch (e) {
      setStatus({ text: "Speichern fehlgeschlagen: " + (e instanceof Error ? e.message : "unbekannter Fehler"), art: "fehler" });
    } finally {
      setSpeichert(false);
    }
  };

  /* ---------- Bilder ---------- */
  const hochladen = async (k: string, datei: File) => {
    if (datei.size > 5 * 1024 * 1024) {
      setStatus({ text: "Bild ist größer als 5 MB.", art: "fehler" });
      return;
    }
    setStatus({ text: "Bild wird hochgeladen …", art: "info" });
    const form = new FormData();
    form.append("datei", datei);
    const res = await fetch("/api/admin/bild", { method: "POST", body: form }).catch(() => null);
    if (res?.status === 401) return abgelaufen();
    const antwort = (await res?.json().catch(() => null)) as { ok?: boolean; pfad?: string; error?: string } | null;
    if (!res?.ok || !antwort?.pfad) {
      setStatus({
        text: antwort?.error === "typ" ? "Nur PNG, JPG, WebP oder GIF möglich." : "Hochladen fehlgeschlagen.",
        art: "fehler",
      });
      return;
    }
    setze(k, antwort.pfad);
    setStatus({ text: "Bild hochgeladen — zum Übernehmen „Speichern“ klicken.", art: "info" });
  };

  /* ---------- Versionen ---------- */
  const versionLaden = async (name: string) => {
    const res = await fetch("/api/admin/version", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    }).catch(() => null);
    if (res?.status === 401) return abgelaufen();
    const antwort = (await res?.json().catch(() => null)) as { aenderungen?: Werte } | null;
    if (!res?.ok || !antwort?.aenderungen) {
      setStatus({ text: "Version konnte nicht geladen werden.", art: "fehler" });
      return;
    }
    setWerte(antwort.aenderungen);
    setStatus({ text: "Version geladen — zum Übernehmen „Speichern“ klicken.", art: "info" });
  };

  const abmelden = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => null);
    window.location.reload();
  };

  /* ---------- Felder gruppieren und filtern ---------- */
  const q = suche.trim().toLowerCase();
  const gruppen = useMemo(() => {
    const map = new Map<string, { k: string; label: string }[]>();
    for (const k of Object.keys(standard)) {
      if (k.startsWith("bilder.")) continue;
      const { gruppe, rest } = zerlege(k);
      const label = beschriftung(rest, namen);
      if (!map.has(gruppe)) map.set(gruppe, []);
      map.get(gruppe)!.push({ k, label });
    }
    const bekannt = GRUPPEN.filter(([g]) => map.has(g));
    const sonst = [...map.keys()].filter((g) => !GRUPPEN.some(([x]) => x === g)).map((g) => [g, g] as [string, string]);
    return [...bekannt, ...sonst].map(([g, titel]) => {
      /* "Folie 9 · …" -> Folienindex 8 (für die Vorschau, falls der Text erst nach einer Auswahl erscheint) */
      const m = /^Folie (\d+)/.exec(titel);
      return { g, titel, folie: m ? Number(m[1]) - 1 : null, felder: map.get(g)! };
    });
  }, [standard, namen]);

  const bildKeys = Object.keys(standard).filter((k) => k.startsWith("bilder."));
  const bildName = (k: string) => {
    const kurz = k.slice("bilder.".length);
    return BILD_NAMEN[kurz] ?? namen[kurz] ?? kurz;
  };
  const feldInfo = useMemo(() => {
    const info: Record<string, { label: string; gruppe: string; titel: string; folie: number | null }> = {};
    for (const gr of gruppen) for (const f of gr.felder) info[f.k] = { label: f.label, gruppe: gr.g, titel: gr.titel, folie: gr.folie };
    return info;
  }, [gruppen]);

  /* ---------- Live-Vorschau ---------- */
  const [ansicht, setAnsicht] = useState<"desktop" | "mobil" | "aus">("desktop");
  const [aktiv, setAktiv] = useState<string | null>(null);
  const [offen, setOffen] = useState<Set<string>>(() => new Set(["bilder"]));
  const [nichtSichtbar, setNichtSichtbar] = useState<string | null>(null);
  const iframe = useRef<HTMLIFrameElement>(null);
  const flaeche = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [skala, setSkala] = useState(1);

  /* ---------- Navigator ---------- */
  const [nav, setNav] = useState<Nav>(0);
  const [folgen, setFolgen] = useState(true);
  const [vorschauFolie, setVorschauFolie] = useState(0);
  const [ordnung, setOrdnung] = useState<Record<number, Ordnung>>({});
  const [ordnenTick, setOrdnenTick] = useState(0);

  const senden = useCallback((msg: unknown) => {
    iframe.current?.contentWindow?.postMessage(msg, window.location.origin);
  }, []);

  /* alle Texte (Standard + Änderungen) an die Vorschau, leicht verzögert beim Tippen */
  const alle = useMemo(() => ({ ...standard, ...werte }), [standard, werte]);
  useEffect(() => {
    const id = setTimeout(() => senden({ typ: "werte", werte: alle }), 120);
    return () => clearTimeout(id);
  }, [alle, senden]);

  const anzeigeLabel = useCallback(
    (k: string) => {
      if (k.startsWith("bilder.")) return bildName(k);
      const info = feldInfo[k];
      return info ? info.titel.replace(/^Folie \d+ · /, "") + " › " + info.label : k;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feldInfo]
  );

  const fokussieren = useCallback(
    (k: string, still = false) => {
      setAktiv(k);
      if (!still) setNichtSichtbar(null);
      senden({ typ: "fokus", key: k, wert: alle[k] ?? "", label: anzeigeLabel(k), folie: feldInfo[k]?.folie ?? null, still });
    },
    [alle, anzeigeLabel, feldInfo, senden]
  );

  const hover = (k: string | null) =>
    senden(k ? { typ: "hover", key: k, wert: alle[k] ?? "", label: anzeigeLabel(k) } : { typ: "hover-aus" });

  /* beim Tippen: Markierung dem geänderten Text nachführen */
  useEffect(() => {
    if (!aktiv) return;
    const id = setTimeout(() => fokussieren(aktiv, true), 160);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aktiv ? alle[aktiv] : null]);

  /* Felder einer Folie: eigene Abschnitte + allgemeine Texte und Bilder, die dort stehen */
  const kandidaten = useCallback(
    (i: number) => [
      ...gruppen.filter((g) => g.folie === i).flatMap((g) => g.felder.map((f) => f.k)),
      ...gruppen.filter((g) => g.g === "allgemein").flatMap((g) => g.felder.map((f) => f.k)),
      ...bildKeys,
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gruppen]
  );

  /* Reihenfolge auf dem Bildschirm von der Vorschau erfragen */
  useEffect(() => {
    if (typeof nav !== "number" || nav !== vorschauFolie || ansicht === "aus") return;
    const id = setTimeout(
      () => senden({ typ: "ordnen", folie: nav, felder: kandidaten(nav).map((k) => ({ key: k, wert: alle[k] ?? "" })) }),
      120
    );
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nav, vorschauFolie, ansicht, ordnenTick, kandidaten, senden]);

  const folienListe = useMemo(() => {
    if (typeof nav !== "number") return null;
    const eigene = gruppen.filter((g) => g.folie === nav).flatMap((g) => g.felder.map((f) => f.k));
    const eigenSet = new Set(eigene);
    const o = ordnung[nav];
    if (!o || ansicht === "aus") return { sichtbar: eigene, spaeter: [] as string[], geordnet: false };
    const sichtbar = o
      .filter((e) => e.sichtbar && e.inFolie && (eigenSet.has(e.key) || !e.key.startsWith("texte.") || feldInfo[e.key]?.gruppe === "allgemein"))
      .sort((a, b) => a.y - b.y || a.x - b.x)
      .map((e) => e.key)
      .filter((k, i, arr) => arr.indexOf(k) === i);
    return { sichtbar, spaeter: eigene.filter((k) => !sichtbar.includes(k)), geordnet: true };
  }, [nav, gruppen, ordnung, ansicht, feldInfo]);

  const waehleFolie = (i: number) => {
    setNav(i);
    setAktiv(null);
    senden({ typ: "gehe", folie: i });
    panel.current?.scrollTo({ top: 0 });
  };

  /* Feld im Editor öffnen, hinscrollen, fokussieren */
  const feldOeffnen = useCallback(
    (k: string) => {
      const inFolie = !!folienListe && (folienListe.sichtbar.includes(k) || folienListe.spaeter.includes(k));
      if (!inFolie) {
        const gruppe = k.startsWith("bilder.") ? "bilder" : feldInfo[k]?.gruppe;
        if (!gruppe) return;
        setNav("alle");
        setOffen((alt) => new Set(alt).add(gruppe));
      }
      setSuche("");
      setTimeout(() => {
        const el = document.getElementById("f-" + k);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (el instanceof HTMLTextAreaElement) el.focus({ preventScroll: true });
        else fokussieren(k);
      }, 40);
    },
    [feldInfo, fokussieren, folienListe]
  );

  /* Nachrichten aus der Vorschau */
  useEffect(() => {
    const empfang = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== iframe.current?.contentWindow) return;
      const d = e.data as { typ?: string; text?: string; src?: string; key?: string; ok?: boolean; folie?: number; liste?: Ordnung };
      if (d.typ === "bereit") {
        senden({ typ: "werte", werte: alle });
        if (typeof nav === "number") senden({ typ: "gehe", folie: nav });
        if (aktiv) fokussieren(aktiv);
      } else if (d.typ === "gefunden" && d.key) {
        setNichtSichtbar(d.ok ? null : d.key);
      } else if (d.typ === "folie" && typeof d.folie === "number") {
        const f = d.folie;
        setVorschauFolie(f);
        /* Navigator folgt der Vorschau (nur in der Folienansicht, nicht bei Suche) */
        if (folgen && typeof nav === "number" && !suche && f !== nav) {
          setNav(f);
          setAktiv(null);
        }
        setOrdnenTick((t) => t + 1);
      } else if (d.typ === "ordnung" && typeof d.folie === "number" && d.liste) {
        setOrdnung((alt) => ({ ...alt, [d.folie!]: d.liste! }));
      } else if (d.typ === "klick") {
        setTimeout(() => setOrdnenTick((t) => t + 1), 250); /* Klick kann Texte sichtbar machen */
        if (d.src) {
          const k = bildKeys.find((b) => alle[b] === d.src);
          if (k) feldOeffnen(k);
          return;
        }
        const text = d.text ?? "";
        /* Feld, dessen feste Textstücke am besten im angeklickten Text vorkommen */
        let best: string | null = null;
        let bestPunkte = 0;
        for (const k of Object.keys(feldInfo)) {
          const stuecke = textStuecke(alle[k] ?? "");
          if (!stuecke.length || !text.includes(stuecke[0])) continue;
          const punkte = stuecke.filter((s) => text.includes(s)).reduce((n, s) => n + s.length, 0) - Math.abs(text.length - (alle[k] ?? "").length) / 1000;
          if (punkte > bestPunkte) {
            bestPunkte = punkte;
            best = k;
          }
        }
        if (best) feldOeffnen(best);
      }
    };
    window.addEventListener("message", empfang);
    return () => window.removeEventListener("message", empfang);
  }, [alle, aktiv, bildKeys, feldInfo, feldOeffnen, fokussieren, senden, folgen, nav, suche]);

  /* Vorschau als Desktop (1440 px breit, verkleinert) oder Mobil (390 px) */
  const BREITE = ansicht === "mobil" ? 390 : 1440;
  useEffect(() => {
    const el = flaeche.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSkala(Math.min(1, (el.clientWidth - 32) / BREITE)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [BREITE, ansicht]);

  const gruppeOffen = (g: string) => !!q || offen.has(g);
  const umschalten = (g: string, an: boolean) =>
    setOffen((alt) => {
      const neu = new Set(alt);
      if (an) neu.add(g);
      else neu.delete(g);
      return neu;
    });

  /* ---------- Bausteine ---------- */
  const kurz = (v: string) => {
    const t = v.replace(/\*\*/g, "").replace(/\s+/g, " ").trim();
    return t.length > 70 ? t.slice(0, 68) + "…" : t || "—";
  };

  const feldKarte = (k: string, label: string) => {
    if (k.startsWith("bilder.")) return bildKarte(k);
    const v = wert(k);
    const ph = platzhalter(standard[k]);
    const fehlt = ph.filter((p) => !platzhalter(v).includes(p));
    const zeilen = Math.min(10, Math.max(1, Math.ceil(v.length / 60) + (v.match(/\n/g)?.length ?? 0)));
    return (
      <div
        className={"adm-feld" + (k in werte ? " geaendert" : "") + (aktiv === k ? " aktiv" : "")}
        key={k}
        onMouseEnter={() => hover(k)}
        onMouseLeave={() => hover(null)}
      >
        <label htmlFor={"f-" + k}>{label}</label>
        <textarea
          id={"f-" + k}
          rows={zeilen}
          value={v}
          onFocus={() => fokussieren(k)}
          onChange={(e) => {
            setze(k, e.target.value);
            if (status) setStatus(null);
          }}
        />
        <div className="adm-feld-fuss">
          {ph.length > 0 && (
            <span className={fehlt.length ? "adm-warn" : undefined}>
              Platzhalter: {ph.map((p) => "{" + p + "}").join(" ")}
              {fehlt.length > 0 && " — fehlt: " + fehlt.map((p) => "{" + p + "}").join(" ")}
            </span>
          )}
          {aktiv === k && nichtSichtbar === k && ansicht !== "aus" && (
            <span className="adm-info">Erscheint erst nach einer Auswahl in der Konsole</span>
          )}
          {k in werte && (
            <button className="adm-link" type="button" onClick={() => setze(k, standard[k])} title={standard[k]}>
              Original wiederherstellen
            </button>
          )}
        </div>
      </div>
    );
  };

  function bildKarte(k: string) {
    const src = wert(k);
    return (
      <div
        className={"adm-bild" + (aktiv === k ? " aktiv" : "")}
        key={k}
        id={"f-" + k}
        onMouseEnter={() => hover(k)}
        onMouseLeave={() => hover(null)}
      >
        <button type="button" className="adm-bild-vorschau" onClick={() => fokussieren(k)} title="In der Vorschau zeigen">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {src ? <img src={src} alt="" /> : <span>kein Bild</span>}
        </button>
        <b>{bildName(k)}</b>
        <label className="adm-btn klein">
          Bild ersetzen …
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            hidden
            onChange={(e) => {
              const d = e.target.files?.[0];
              e.target.value = "";
              if (d) hochladen(k, d);
            }}
          />
        </label>
        {k in werte && (
          <button className="adm-link" type="button" onClick={() => setze(k, standard[k])}>
            Original wiederherstellen
          </button>
        )}
      </div>
    );
  }

  const labelIn = (k: string) =>
    k.startsWith("bilder.") ? bildName(k) : feldInfo[k]?.gruppe === "allgemein" ? "Allgemein › " + feldInfo[k].label : feldInfo[k]?.label ?? k;

  const gruppenAnsicht = (filter: (g: (typeof gruppen)[number]) => boolean, mitBildern: (k: string) => boolean) => (
    <>
      {!q && bildKeys.some(mitBildern) && (
        <details className="adm-gruppe" open={gruppeOffen("bilder")} onToggle={(e) => umschalten("bilder", e.currentTarget.open)}>
          <summary>
            Bilder
            {bildKeys.filter(mitBildern).some((k) => k in werte) && <span className="adm-badge">geändert</span>}
          </summary>
          <div className="adm-bilder">{bildKeys.filter(mitBildern).map((k) => bildKarte(k))}</div>
          <p className="adm-hinweis">PNG, JPG, WebP oder GIF, höchstens 5 MB. Am besten in ähnlichem Format wie das bisherige Bild.</p>
        </details>
      )}
      {gruppen.filter(filter).map(({ g, titel, felder }) => {
        const sichtbar = q
          ? felder.filter(
              ({ k, label }) =>
                label.toLowerCase().includes(q) || wert(k).toLowerCase().includes(q) || standard[k].toLowerCase().includes(q)
            )
          : felder;
        if (!sichtbar.length) return null;
        const anzahl = felder.filter(({ k }) => k in werte).length;
        return (
          <details className="adm-gruppe" key={g} open={gruppeOffen(g)} onToggle={(e) => !q && umschalten(g, e.currentTarget.open)}>
            <summary>
              {titel}
              {anzahl > 0 && <span className="adm-badge">{anzahl} geändert</span>}
            </summary>
            {gruppeOffen(g) && sichtbar.map(({ k, label }) => feldKarte(k, label))}
          </details>
        );
      })}
    </>
  );

  const folienTitel = (i: number) => alle["texte.folien." + SLIDES[i]] ?? SLIDES[i];

  return (
    <div className={"adm adm-split" + (ansicht === "aus" ? " ohne-vorschau" : "")}>
      <header className="adm-kopf">
        <div>
          <h1>Admin · Förderplan-Konsole</h1>
          <p>
            Folie im Navigator wählen oder in der Vorschau blättern — Feld anklicken markiert die Stelle, Klick in die Vorschau öffnet das Feld.{" "}
            <code>**fett**</code> hebt hervor, Platzhalter wie <code>{"{n}"}</code> bitte stehen lassen.
          </p>
        </div>
        <div className="adm-kopf-aktionen">
          <div className="adm-segment" role="group" aria-label="Vorschau">
            {(
              [
                ["desktop", "Desktop"],
                ["mobil", "Mobil"],
                ["aus", "Ohne Vorschau"],
              ] as const
            ).map(([v, l]) => (
              <button key={v} type="button" aria-pressed={ansicht === v} onClick={() => setAnsicht(v)}>
                {l}
              </button>
            ))}
          </div>
          <a className="adm-btn" href="/" target="_blank" rel="noopener noreferrer">
            Konsole öffnen ↗
          </a>
          <button className="adm-btn" type="button" onClick={abmelden}>
            Abmelden
          </button>
        </div>
      </header>

      <div className="adm-arbeit">
        <div className="adm-panel" ref={panel}>
          <div className="adm-nav">
            <div className="adm-nav-kopf">
              <b>Navigator</b>
              {ansicht !== "aus" && (
                <label>
                  <input type="checkbox" checked={folgen} onChange={(e) => setFolgen(e.target.checked)} /> folgt der Vorschau
                </label>
              )}
            </div>
            <div className="adm-nav-leiste" role="group" aria-label="Folien">
              <button type="button" aria-pressed={nav === "alle"} onClick={() => setNav("alle")} title="Alle Texte nach Abschnitten">
                Alle
              </button>
              <button type="button" aria-pressed={nav === "rahmen"} onClick={() => setNav("rahmen")} title="Kopfzeile, Agenda, Navigation — auf allen Folien">
                Rahmen
              </button>
              {SLIDES.map((id, i) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={nav === i}
                  className={vorschauFolie === i && ansicht !== "aus" ? "live" : undefined}
                  title={i + 1 + " · " + folienTitel(i)}
                  onClick={() => waehleFolie(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="adm-suche">
              <input
                type="search"
                placeholder="In allen Texten suchen …"
                aria-label="Texte durchsuchen"
                value={suche}
                onChange={(e) => setSuche(e.target.value)}
              />
            </div>
          </div>

          {q ? (
            <>
              {gruppenAnsicht(() => true, () => false)}
              {!gruppen.some(({ felder }) => felder.some(({ k, label }) => (label + wert(k) + standard[k]).toLowerCase().includes(q))) && (
                <p className="adm-hinweis">Keine Treffer.</p>
              )}
            </>
          ) : typeof nav === "number" && folienListe ? (
            <>
              <div className="adm-folie-kopf">
                <span>
                  Folie {nav + 1} von {SLIDES.length}
                </span>
                <h2>{folienTitel(nav)}</h2>
              </div>
              <details className="adm-gruppe adm-elemente" open>
                <summary>
                  Elemente auf dieser Folie <span className="adm-zahl">{folienListe.sichtbar.length}</span>
                </summary>
                <ol>
                  {folienListe.sichtbar.map((k) => (
                    <li key={k}>
                      <button
                        type="button"
                        className={(aktiv === k ? "aktiv " : "") + (k in werte ? "geaendert" : "")}
                        onMouseEnter={() => hover(k)}
                        onMouseLeave={() => hover(null)}
                        onClick={() => feldOeffnen(k)}
                      >
                        <span className="adm-el-typ">{k.startsWith("bilder.") ? "Bild" : labelIn(k)}</span>
                        <span className="adm-el-text">{k.startsWith("bilder.") ? bildName(k) : kurz(wert(k))}</span>
                      </button>
                    </li>
                  ))}
                </ol>
                {!folienListe.geordnet && ansicht !== "aus" && <p className="adm-hinweis">Reihenfolge wird aus der Vorschau gelesen …</p>}
              </details>
              <div className="adm-gruppe adm-folie-felder">
                {folienListe.sichtbar.map((k) =>
                  k.startsWith("bilder.") ? (
                    <div className="adm-bilder einzeln" key={k}>
                      {bildKarte(k)}
                    </div>
                  ) : (
                    feldKarte(k, labelIn(k))
                  )
                )}
              </div>
              {folienListe.spaeter.length > 0 && (
                <details className="adm-gruppe" open={gruppeOffen("spaeter-" + nav)} onToggle={(e) => umschalten("spaeter-" + nav, e.currentTarget.open)}>
                  <summary>
                    Erscheint erst nach einer Auswahl <span className="adm-zahl">{folienListe.spaeter.length}</span>
                  </summary>
                  <p className="adm-hinweis">Texte, die erst nach einem Klick oder einer Eingabe auf dieser Folie sichtbar werden (z. B. Reaktionen auf Antworten).</p>
                  {gruppeOffen("spaeter-" + nav) && folienListe.spaeter.map((k) => feldKarte(k, labelIn(k)))}
                </details>
              )}
              <div className="adm-folie-blaettern">
                <button className="adm-btn klein" type="button" disabled={nav === 0} onClick={() => waehleFolie(nav - 1)}>
                  ← Folie {nav}
                </button>
                <button className="adm-btn klein" type="button" disabled={nav === SLIDES.length - 1} onClick={() => waehleFolie(nav + 1)}>
                  Folie {nav + 2} →
                </button>
              </div>
            </>
          ) : nav === "rahmen" ? (
            gruppenAnsicht((g) => g.folie === null, (k) => k === "bilder.logo")
          ) : (
            gruppenAnsicht(() => true, () => true)
          )}

          <details className="adm-gruppe" open={gruppeOffen("versionen")} onToggle={(e) => umschalten("versionen", e.currentTarget.open)}>
            <summary>Versionen &amp; Zurücksetzen</summary>
            <div className="adm-versionen-box">
              <p className="adm-hinweis">Vor jedem Speichern wird der bisherige Stand gesichert (die letzten 50).</p>
              {versionen.length === 0 ? (
                <p className="adm-hinweis">Noch keine Sicherungen.</p>
              ) : (
                <ul className="adm-versionen">
                  {versionen.map((v) => (
                    <li key={v.name}>
                      <span>
                        {zeitText(v.zeit)}
                        <small>{v.anzahl} Änderungen</small>
                      </span>
                      <button className="adm-link" type="button" onClick={() => versionLaden(v.name)}>
                        Laden
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button
                className="adm-btn klein"
                type="button"
                onClick={() =>
                  bestaetigen("standard", () => {
                    setWerte({});
                    setStatus({ text: "Alles auf Originaltexte gesetzt — zum Übernehmen „Speichern“ klicken.", art: "info" });
                  })
                }
              >
                {sicher === "standard" ? "Wirklich? Nochmal klicken" : "Alles auf Original zurücksetzen"}
              </button>
            </div>
          </details>
        </div>

        {ansicht !== "aus" && (
          <div className="adm-vorschau" ref={flaeche}>
            <div className="adm-vorschau-rahmen" style={{ width: BREITE * skala }}>
              <iframe
                ref={iframe}
                src="/?vorschau=1"
                title="Live-Vorschau der Konsole"
                style={{ width: BREITE, height: `calc((100% / ${skala}))`, transform: `scale(${skala})` }}
              />
            </div>
          </div>
        )}
      </div>

      <footer className="adm-leiste">
        <span className={"adm-status" + (status ? " " + status.art : "")} role="status">
          {status?.text ?? (geaendert ? geaendert + " ungespeicherte Änderung" + (geaendert === 1 ? "" : "en") + " — in der Vorschau schon sichtbar" : "Alles gespeichert.")}
        </span>
        <button className="adm-btn" type="button" disabled={!geaendert || speichert} onClick={() => bestaetigen("verwerfen", () => setWerte(gespeichert))}>
          {sicher === "verwerfen" ? "Wirklich verwerfen?" : "Verwerfen"}
        </button>
        <button className="adm-btn primaer" type="button" disabled={!geaendert || speichert} onClick={speichern}>
          {speichert ? "Speichert …" : "Speichern"}
        </button>
      </footer>
    </div>
  );
}
