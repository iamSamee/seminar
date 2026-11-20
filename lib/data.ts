/* Zugelassene Bildungsangebote je Programm (Quelle: Massnahmebogen der
   Agentur fuer Arbeit, abgelegt unter S:\07-Leistungsgebiete). */

export const ANGEBOTE_URL =
  "https://sct116680-my.sharepoint.com/:f:/g/personal/on_seminarkontor_com/IgCynz8jqsDNT4Wc9up5kGRSAUF40qj_UGWMaoN7JB_Ojxo?e=OVDVRh";
export const FORMULAR_URL =
  "https://web.arbeitsagentur.de/portal/kontakt/de/unternehmen/unternehmensanfrage?scope=form";
export const ANBIETER_NR = "304731";

/* Bilder liegen in public/ — siehe scripts/extract-assets.mjs */
export const BILDER = {
  logo: "/logo.svg",
  oscar: "/oscar.jpg",
  azav: "/siegel-azav.png",
  iso: "/siegel-iso.png",
};

export type Angebot = {
  titel: string;
  ue: number;
  nr: string;
  pdf: string;
  dkz: string;
  gueltig: string;
  stelle: string;
  text: string;
  web: string;
  /* Dauer in Wochen und Kurskosten je Teilnehmer (€) laut Maßnahmezulassung */
  wochen: number;
  preis: number;
};

export const ANGEBOTE: Record<string, Angebot[]> = {
  "Strategische Kundengewinnung (Vertrieb 2.0)": [
    {
      titel: "Als Dialogspezialist(in) erfolgreich Kunden gewinnen",
      ue: 820,
      nr: "621/138/2026",
      pdf: "Angebot Dialogspezialist.pdf",
      dkz: "92122-104",
      gueltig: "13.12.2024 – 12.12.2027",
      stelle: "CERTQUA",
      text: "Weiterbildung zur professionellen Kundenkommunikation und Kundengewinnung, besonders für telefonische Dialoge in Vertrieb, Kundenservice und Vertriebsassistenz. 10 Kapitel von der Adressrecherche bis zum eigenen Gesprächsleitfaden.",
      web: "https://vertriebskurs.seminarkontor.com/",
      wochen: 34,
      preis: 8405,
    },
  ],
  Cybersicherheit: [
    {
      titel: "Cyber-Security & Informationssicherheit mit NIS-2, ISMS & KI-Integration",
      ue: 400,
      nr: "621/5/26",
      pdf: "Bildungsangebot Cybersecurity_Kurs_400UE_.pdf",
      dkz: "43384-11400",
      gueltig: "30.09.2025 – 29.09.2028",
      stelle: "CERTQUA",
      text: "Praxisorientierte Qualifizierung in Cybersecurity, ISMS nach ISO 27001 und Umsetzung der NIS-2-Richtlinie, einschließlich KI-Integration und EU AI Act. 8 Lektionen mit Abschlussprojekt.",
      web: "https://cybersecurity-training.seminarkontor.com/",
      wochen: 26,
      preis: 5924,
    },
  ],
  Fördermittelmanagement: [
    {
      titel: "Fördermittelberater(in) für die Digitalisierung",
      ue: 500,
      nr: "621/135/2026",
      pdf: "Bildungsangebot Fördermittelberater_500UE.pdf",
      dkz: "71324-11800",
      gueltig: "30.09.2025 – 29.09.2028",
      stelle: "GUTcert",
      text: "Kompakte Ausbildung zur/zum Fördermittelberater/in für Digitalisierung: Förderlandschaft, Recherche, Antragstellung, Evaluierung und Abwicklung für interne und externe Kunden. 6 Kapitel, trägerinternes Zertifikat.",
      web: "https://foerdermittelkurs.seminarkontor.com/",
      wochen: 26,
      preis: 5360,
    },
  ],
  "Social Media Strategie": [
    {
      titel: "Social Media Manager/in",
      ue: 500,
      nr: "621/28/26",
      pdf: "Bildungsangebot Social Media_Kurs_500UE.pdf",
      dkz: "92113-18400",
      gueltig: "30.09.2025 – 29.09.2028",
      stelle: "CERTQUA",
      text: "Kompakter Lehrgang zur/zum Social Media Manager/in: Strategie, Content Creation, Community Management, Paid-Social-Kampagnen und Erfolgsmessung. 7 Kapitel.",
      web: "https://socialmediakurs.seminarkontor.com/",
      wochen: 26,
      preis: 4170,
    },
  ],
  "KI Engineer": [
    {
      titel: "KI-Engineer",
      ue: 500,
      nr: "621/137/2026",
      pdf: "Bildungsangebot KI Engineer_Kurs_500UE 2.pdf",
      dkz: "43104-13600",
      gueltig: "30.09.2025 – 29.09.2028",
      stelle: "CERTQUA",
      text: "Weiterbildung zur/zum KI-Engineer: Grundlagen, DSGVO, Prompting, Content-Erstellung, Toolauswahl, KI-Potenzialanalyse im Unternehmen und Workflow-Automatisierung. 8 Lektionen mit Praxisaufgaben aus dem eigenen Berufsalltag.",
      web: "https://ki-akademie.seminarkontor.com/",
      wochen: 26,
      preis: 8325,
    },
  ],
};

export const FORMULAR_TEXT =
  "Sehr geehrte Damen und Herren,\n\nwir planen, interne Mitarbeitende im Rahmen der Bildungsgutscheine weiterzubilden. Senden Sie uns hierfür bitte den Erhebungsbogen sowie die weiteren Daten und Unterlagen zu, die Sie hierfür von uns benötigen.\n\nHerzlichen Dank für Ihre Unterstützung";

/* ------------------------------------------------------------------
   KUNDENSTIMMEN — hier echte Bewertungen eintragen.
   Solange die Liste leer ist, bleibt der Block auf der Folie
   "Unsere Dozenten" unsichtbar. Es werden bewusst keine erfundenen
   Bewertungen ausgeliefert. "sterne" ist optional (1–5).
   ------------------------------------------------------------------ */
export type Kundenstimme = { text: string; quelle?: string; sterne?: number };
export const KUNDENSTIMMEN: Kundenstimme[] = [];

export type Exp = "genutzt" | "gehoert" | "neu";

export type Size = "klein" | "mittel" | "gross";
export type Rate = { kurs: number; lohn: number };
export const RATES: Record<Size, Rate> = {
  klein: { kurs: 1.0, lohn: 0.75 },
  mittel: { kurs: 0.5, lohn: 0.5 },
  gross: { kurs: 0.25, lohn: 0.25 },
};

export const PROGRAMME = [
  {
    prog: "Strategische Kundengewinnung (Vertrieb 2.0)",
    titel: "Strategische Kundengewinnung",
    text: "Kunden gezielt gewinnen — von der Adressrecherche und dem richtigen Ansprechpartner über Nutzenargumentation, aktives Zuhören und Fragetechnik bis zur souveränen Einwandbehandlung. Die Teilnehmenden erarbeiten ihren eigenen Gesprächsleitfaden und stärken ihre Eigenmotivation für nachhaltigen Vertriebserfolg.",
    ue: "820 UE · 34 Wochen · AZAV-zugelassen",
    url: "https://vertriebskurs.seminarkontor.com/",
  },
  {
    prog: "Cybersicherheit",
    titel: "Cybersicherheit",
    text: "Informationssicherheit praxisnah im Unternehmen verankern: Phishing und Social Engineering erkennen, die NIS-2-Pflichten verstehen und ein ISMS nach ISO 27001 aufbauen. Dazu technische Schutzmaßnahmen, Incident Response, Awareness für das ganze Team und der EU AI Act — mit eigenem Abschlussprojekt.",
    ue: "400 UE · 26 Wochen · AZAV-zugelassen",
    url: "https://cybersecurity-training.seminarkontor.com/",
  },
  {
    prog: "Fördermittelmanagement",
    titel: "Fördermittelmanagement",
    text: "Fördermittel systematisch erschließen: Programme recherchieren und bewerten, Anträge professionell stellen und abwickeln, Nachweise und Berichte sauber führen — mit Schwerpunkt Digitalisierung, u. a. BAFA und Landesprogramme.",
    ue: "500 UE · 26 Wochen · AZAV-zugelassen",
    url: "https://foerdermittelkurs.seminarkontor.com/",
  },
  {
    prog: "Social Media Strategie",
    titel: "Social Media Strategie",
    text: "Social Media für Sichtbarkeit, Kunden- und Mitarbeitergewinnung nutzen: Strategie und Redaktionsplanung, Content für Text, Bild und Video, Community Management sowie Planung und Optimierung bezahlter Kampagnen. Mit Analysetools messen die Teilnehmenden den Erfolg und steuern datenbasiert nach.",
    ue: "500 UE · 26 Wochen · AZAV-zugelassen",
    url: "https://socialmediakurs.seminarkontor.com/",
  },
  {
    prog: "KI Engineer",
    titel: "KI Engineer",
    text: "KI sicher und produktiv im Arbeitsalltag einsetzen: Grundlagen und Grenzen von KI, DSGVO-konformer Umgang, strukturiertes Prompting und Content mit gängigen Tools. Die Teilnehmenden finden KI-Potenziale im eigenen Unternehmen und automatisieren Abläufe, etwa mit Zapier, Make oder n8n.",
    ue: "500 UE · 26 Wochen · AZAV-zugelassen",
    url: "https://ki-akademie.seminarkontor.com/",
  },
];

/* Folien-IDs — die angezeigten Titel stehen in lib/texte.tsx */
export const SLIDES = [
  "Kennenlernen",
  "Vorerfahrung",
  "Seminarkontor",
  "Unsere Dozenten",
  "Ausgangslage",
  "Bildungsgutschein",
  "Förderquote",
  "Voraussetzungen",
  "Ihr Kontingent",
  "Weiterbildungen",
  "Ihre Ersparnis",
  "Ablauf",
  "Ihre Angaben",
  "Erhebungsbogen anfordern",
  "Zusammenfassung",
] as const;
export type SlideId = (typeof SLIDES)[number];
