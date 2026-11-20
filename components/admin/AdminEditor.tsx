"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { platzhalter } from "@/lib/inhalt";

type Werte = Record<string, string>;
type Version = { name: string; zeit: string; anzahl: number };

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
    return [...bekannt, ...sonst].map(([g, titel]) => ({ g, titel, felder: map.get(g)! }));
  }, [standard, namen]);

  const bildKeys = Object.keys(standard).filter((k) => k.startsWith("bilder."));

  return (
    <div className="adm">
      <header className="adm-kopf">
        <div>
          <h1>Admin · Förderplan-Konsole</h1>
          <p>
            Texte und Bilder bearbeiten. <code>**fett**</code> hebt Text hervor. Platzhalter wie <code>{"{n}"}</code> werden
            live ersetzt und sollten erhalten bleiben.
          </p>
        </div>
        <div className="adm-kopf-aktionen">
          <a className="adm-btn" href="/" target="_blank" rel="noopener noreferrer">
            Konsole öffnen ↗
          </a>
          <button className="adm-btn" type="button" onClick={abmelden}>
            Abmelden
          </button>
        </div>
      </header>

      <div className="adm-suche">
        <input
          type="search"
          placeholder="Text suchen, z. B. „Faustregel“ …"
          aria-label="Texte durchsuchen"
          value={suche}
          onChange={(e) => setSuche(e.target.value)}
        />
      </div>

      <div className="adm-raster">
        <main className="adm-felder">
          {!q && (
            <details className="adm-gruppe" open>
              <summary>
                Bilder
                {bildKeys.some((k) => k in werte) && <span className="adm-badge">geändert</span>}
              </summary>
              <div className="adm-bilder">
                {bildKeys.map((k) => {
                  const kurz = k.slice("bilder.".length);
                  const src = wert(k);
                  return (
                    <div className="adm-bild" key={k}>
                      <div className="adm-bild-vorschau">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {src ? <img src={src} alt="" /> : <span>kein Bild</span>}
                      </div>
                      <b>{BILD_NAMEN[kurz] ?? namen[kurz] ?? kurz}</b>
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
                })}
              </div>
              <p className="adm-hinweis">PNG, JPG, WebP oder GIF, höchstens 5 MB. Am besten in ähnlichem Format wie das bisherige Bild.</p>
            </details>
          )}

          {gruppen.map(({ g, titel, felder }) => {
            const sichtbar = q
              ? felder.filter(
                  ({ k, label }) =>
                    label.toLowerCase().includes(q) || wert(k).toLowerCase().includes(q) || standard[k].toLowerCase().includes(q)
                )
              : felder;
            if (!sichtbar.length) return null;
            const anzahl = felder.filter(({ k }) => k in werte).length;
            return (
              <details className="adm-gruppe" key={g} open={!!q}>
                <summary>
                  {titel}
                  {anzahl > 0 && <span className="adm-badge">{anzahl} geändert</span>}
                </summary>
                {sichtbar.map(({ k, label }) => {
                  const v = wert(k);
                  const ph = platzhalter(standard[k]);
                  const fehlt = ph.filter((p) => !platzhalter(v).includes(p));
                  const zeilen = Math.min(10, Math.max(1, Math.ceil(v.length / 90) + (v.match(/\n/g)?.length ?? 0)));
                  return (
                    <div className={"adm-feld" + (k in werte ? " geaendert" : "")} key={k}>
                      <label htmlFor={"f-" + k}>{label}</label>
                      <textarea id={"f-" + k} rows={zeilen} value={v} onChange={(e) => {
                          setze(k, e.target.value);
                          if (status) setStatus(null);
                        }} />
                      <div className="adm-feld-fuss">
                        {ph.length > 0 && (
                          <span className={fehlt.length ? "adm-warn" : undefined}>
                            Platzhalter: {ph.map((p) => "{" + p + "}").join(" ")}
                            {fehlt.length > 0 && " — fehlt: " + fehlt.map((p) => "{" + p + "}").join(" ")}
                          </span>
                        )}
                        {k in werte && (
                          <button className="adm-link" type="button" onClick={() => setze(k, standard[k])} title={standard[k]}>
                            Original wiederherstellen
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </details>
            );
          })}
          {q && !gruppen.some(({ felder }) => felder.some(({ k, label }) => (label + wert(k) + standard[k]).toLowerCase().includes(q))) && (
            <p className="adm-hinweis">Keine Treffer.</p>
          )}
        </main>

        <aside className="adm-seite">
          <div className="adm-karte">
            <h2>Versionen</h2>
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
            <hr />
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
        </aside>
      </div>

      <footer className="adm-leiste">
        <span className={"adm-status" + (status ? " " + status.art : "")} role="status">
          {status?.text ?? (geaendert ? geaendert + " ungespeicherte Änderung" + (geaendert === 1 ? "" : "en") : "Alles gespeichert.")}
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
