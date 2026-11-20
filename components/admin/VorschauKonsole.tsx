"use client";

/* Live-Vorschau für den Admin-Bereich (läuft im iframe unter /?vorschau=1).
   Nachrichten vom Editor (gleiche Herkunft):
     { typ: "werte", werte }               alle Texte inkl. ungespeicherter Änderungen
     { typ: "fokus", key, wert, label, folie }  Element suchen, hinspringen, markieren
     { typ: "gehe", folie }                 Folie anzeigen (Navigator)
     { typ: "hover", key, wert, label }     Element leicht markieren (Navigator)
     { typ: "ordnen", folie, felder }       Reihenfolge der Elemente auf der Folie ermitteln
   Nachrichten an den Editor:
     { typ: "bereit" }                      Vorschau geladen
     { typ: "klick", text, src }            Klick auf einen Text / ein Bild
     { typ: "gefunden", key, ok }           ob das Element sichtbar gefunden wurde
     { typ: "folie", folie }                Folienwechsel in der Vorschau
     { typ: "ordnung", folie, liste }       Elemente der Folie in Bildschirm-Reihenfolge */
import { useCallback, useEffect, useRef, useState } from "react";
import Konsole from "@/components/Konsole";
import type { BeraterOeffentlich } from "@/lib/berater";
import { SLIDES } from "@/lib/data";
import { setzePfad, textStuecke, type Inhalt } from "@/lib/inhalt";

type Fokus = { key: string; wert: string; label: string; folie: number | null; nonce: number };

const an = (msg: unknown) => window.parent?.postMessage(msg, window.location.origin);

/* Element zum Text/Bild finden. Ein Text gilt als gefunden, wenn er den
   Großteil des Elements ausmacht (sonst wäre z. B. „Leinfelden-Echterdingen“
   im längeren Einleitungstext ein Fehltreffer). Bevorzugt: sichtbar auf der
   aktiven Folie oder außerhalb der Folien, dann bester Anteil. */
const ANTEIL_MIN = 0.4;

function finde(f: Fokus): HTMLElement | null {
  const shell = document.querySelector(".shell");
  if (!shell) return null;
  const kandidaten: { el: HTMLElement; anteil: number }[] = [];

  if (f.key.startsWith("bilder.")) {
    shell.querySelectorAll("img").forEach((i) => {
      if (i.getAttribute("src") === f.wert) kandidaten.push({ el: i, anteil: 1 });
    });
  } else {
    const stuecke = textStuecke(f.wert);
    const stueck = stuecke[0];
    if (!stueck) return null;
    const summe = stuecke.reduce((n, s) => n + s.length, 0);
    const anteil = (text: string) => Math.min(1, summe / Math.max(1, text.replace(/\s+/g, " ").trim().length));
    const walker = document.createTreeWalker(shell, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (n.nodeValue?.includes(stueck) && n.parentElement) {
        let el = n.parentElement;
        if (el.tagName === "STRONG" || el.tagName === "EM") el = el.parentElement ?? el;
        kandidaten.push({ el, anteil: anteil(el.textContent ?? "") });
      }
    }
    /* Texte, die nur als Platzhalter in Eingabefeldern stehen */
    shell.querySelectorAll<HTMLElement>("[placeholder]").forEach((el) => {
      const ph = el.getAttribute("placeholder") ?? "";
      if (ph.includes(stueck)) kandidaten.push({ el, anteil: anteil(ph) });
    });
  }
  const passend = kandidaten.filter((k) => k.anteil >= ANTEIL_MIN);
  if (!passend.length) return null;
  const aktiv = (el: HTMLElement) => {
    const folie = el.closest(".slide");
    return (!folie || folie.classList.contains("active")) && el.getClientRects().length > 0;
  };
  passend.sort((a, b) => Number(aktiv(b.el)) - Number(aktiv(a.el)) || b.anteil - a.anteil);
  return passend[0].el;
}

/* Nur den nächsten scrollbaren Bereich (z. B. die Folienfläche) bewegen —
   scrollIntoView würde auch die ganze Seite verschieben */
function scrolleZu(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
    const oy = getComputedStyle(p).overflowY;
    if ((oy === "auto" || oy === "scroll") && p.scrollHeight > p.clientHeight) {
      const pr = p.getBoundingClientRect();
      p.scrollTo({ top: p.scrollTop + (r.top - pr.top) - (pr.height - r.height) / 2, behavior: "smooth" });
      return;
    }
  }
  window.scrollTo({ top: window.scrollY + r.top - (window.innerHeight - r.height) / 2, behavior: "smooth" });
}

export default function VorschauKonsole({ berater, start }: { berater: BeraterOeffentlich; start: Inhalt }) {
  const [inhalt, setInhalt] = useState<Inhalt>(start);
  const [fokus, setFokus] = useState<Fokus | null>(null);
  const [ziel, setZiel] = useState<{ folie: number; nonce: number }>();
  const [hinweis, setHinweis] = useState("");
  const ziel_el = useRef<HTMLElement | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const hoverBox = useRef<HTMLDivElement>(null);
  const hoverEl = useRef<HTMLElement | null>(null);
  const [hoverLabel, setHoverLabel] = useState("");
  const nonce = useRef(0);

  /* ---------- Nachrichten vom Editor ---------- */
  useEffect(() => {
    document.body.classList.add("vorschau-modus");
    const empfang = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== window.parent) return;
      const d = e.data as { typ?: string; werte?: Record<string, string> } & Partial<Fokus>;
      if (d.typ === "werte" && d.werte) {
        const neu = structuredClone(start);
        for (const [k, v] of Object.entries(d.werte)) setzePfad(neu, k, v);
        setInhalt(neu);
      } else if (d.typ === "fokus" && typeof d.key === "string") {
        const key = d.key;
        /* "still": gleiches Feld, nur Text geändert -> nicht erneut springen */
        setFokus((alt) => ({
          key,
          wert: d.wert ?? "",
          label: d.label ?? "",
          folie: d.folie ?? null,
          nonce: (d as { still?: boolean }).still && alt?.key === key ? alt.nonce : ++nonce.current,
        }));
      } else if (d.typ === "fokus-aus") {
        setFokus(null);
      } else if (d.typ === "gehe" && typeof d.folie === "number") {
        setFokus(null);
        setZiel({ folie: d.folie, nonce: ++nonce.current });
      } else if (d.typ === "hover" && typeof d.key === "string") {
        const el = finde({ key: d.key, wert: d.wert ?? "", label: "", folie: null, nonce: 0 });
        const aktiv = document.querySelector(".slide.active");
        hoverEl.current = el && (!el.closest(".slide") || aktiv?.contains(el)) ? el : null;
        setHoverLabel(d.label ?? "");
      } else if (d.typ === "hover-aus") {
        hoverEl.current = null;
      } else if (d.typ === "ordnen") {
        const { folie, felder } = e.data as { folie: number; felder: { key: string; wert: string }[] };
        const aktiv = document.querySelector<HTMLElement>(".slide.active");
        if (!aktiv || SLIDES.indexOf(aktiv.dataset.title as (typeof SLIDES)[number]) !== folie) return;
        const liste = felder.map(({ key, wert }) => {
          const el = finde({ key, wert, label: "", folie: null, nonce: 0 });
          const inFolie = !!el && aktiv.contains(el);
          const r = inFolie ? el!.getBoundingClientRect() : null;
          return { key, inFolie, sichtbar: !!r && r.width > 0, y: r ? Math.round(r.top) : 0, x: r ? Math.round(r.left) : 0 };
        });
        an({ typ: "ordnung", folie, liste });
      }
    };
    window.addEventListener("message", empfang);
    an({ typ: "bereit" });
    return () => window.removeEventListener("message", empfang);
  }, [start]);

  /* ---------- Element suchen, Folie wechseln, hinscrollen ---------- */
  const markieren = useCallback(
    (f: Fokus, scrollen: boolean) => {
      const el = finde(f);
      ziel_el.current = el;
      const folieEl = el?.closest<HTMLElement>(".slide");
      const folie = folieEl ? SLIDES.indexOf(folieEl.dataset.title as (typeof SLIDES)[number]) : f.folie;
      const aktiv = document.querySelector<HTMLElement>(".slide.active");
      const aktivIdx = aktiv ? SLIDES.indexOf(aktiv.dataset.title as (typeof SLIDES)[number]) : -1;
      if (folie !== null && folie >= 0 && folie !== aktivIdx) {
        setZiel({ folie, nonce: f.nonce });
        return; /* nach dem Folienwechsel erneut (siehe Effekt unten) */
      }
      const sichtbar = !!el && el.getClientRects().length > 0;
      setHinweis(sichtbar ? "" : "Dieser Text erscheint erst nach einer Auswahl oder Eingabe auf dieser Folie.");
      an({ typ: "gefunden", key: f.key, ok: sichtbar });
      if (sichtbar && scrollen) scrolleZu(el!);
    },
    []
  );

  /* neuer Fokus: suchen + scrollen; nach Inhaltsänderung: nur neu suchen */
  const letzterNonce = useRef(0);
  useEffect(() => {
    if (!fokus) {
      ziel_el.current = null;
      setHinweis("");
      return;
    }
    const neu = fokus.nonce !== letzterNonce.current;
    letzterNonce.current = fokus.nonce;
    const id = requestAnimationFrame(() => markieren(fokus, neu));
    return () => cancelAnimationFrame(id);
  }, [fokus, inhalt, markieren]);

  /* nach Folienwechsel durch den Editor */
  useEffect(() => {
    if (!ziel || !fokus) return;
    const id = setTimeout(() => markieren(fokus, true), 60);
    return () => clearTimeout(id);
  }, [ziel, fokus, markieren]);

  /* ---------- Markierungsrahmen folgen dem Element (Scrollen, Layout) ---------- */
  useEffect(() => {
    let id = 0;
    const setze = (b: HTMLDivElement | null, el: HTMLElement | null) => {
      if (!b) return;
      const r = el && el.getClientRects().length ? el.getBoundingClientRect() : null;
      if (r && r.width > 0) {
        b.style.display = "block";
        b.style.transform = `translate(${r.left - 5}px, ${r.top - 5}px)`;
        b.style.width = r.width + 10 + "px";
        b.style.height = r.height + 10 + "px";
      } else b.style.display = "none";
    };
    const schleife = () => {
      setze(box.current, ziel_el.current);
      setze(hoverBox.current, hoverEl.current !== ziel_el.current ? hoverEl.current : null);
      id = requestAnimationFrame(schleife);
    };
    id = requestAnimationFrame(schleife);
    return () => cancelAnimationFrame(id);
  }, []);

  /* ---------- Klick in der Vorschau -> Feld im Editor öffnen ---------- */
  useEffect(() => {
    const klick = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t || !t.closest(".shell")) return;
      /* Blättern und Folienpunkte bleiben reine Navigation */
      if (t.closest(".rail-bottom, .steps")) return;
      if (t instanceof HTMLImageElement) {
        an({ typ: "klick", src: t.getAttribute("src") });
        return;
      }
      const block = t.closest<HTMLElement>("h1,h2,h3,h4,p,li,button,a,label,figcaption,figure,td,th,b,span,div") ?? t;
      const text = (block.innerText || block.getAttribute("placeholder") || "").trim();
      if (text) an({ typ: "klick", text: text.slice(0, 2000) });
    };
    document.addEventListener("click", klick, true);
    return () => document.removeEventListener("click", klick, true);
  }, []);

  const foto = inhalt.bilder["berater_" + berater.id] || undefined;

  return (
    <>
      <Konsole berater={{ ...berater, foto }} inhalt={inhalt} vorschau ziel={ziel} onFolie={(i) => an({ typ: "folie", folie: i })} />
      <div ref={hoverBox} className="vorschau-rahmen hover" aria-hidden="true">
        {hoverLabel && <span>{hoverLabel}</span>}
      </div>
      <div ref={box} className="vorschau-rahmen" aria-hidden="true">
        {fokus?.label && <span>{fokus.label}</span>}
      </div>
      {hinweis && fokus && (
        <div className="vorschau-hinweis" role="status">
          <b>{fokus.label}</b>
          {hinweis}
        </div>
      )}
    </>
  );
}
