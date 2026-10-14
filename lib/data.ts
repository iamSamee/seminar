/* Zugelassene Bildungsangebote je Programm (Quelle: Massnahmebogen der
   Agentur fuer Arbeit, abgelegt unter S:\07-Leistungsgebiete). */

export const KALENDER_URL = "https://calendly.com/on--1/besprechung";
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
  /* Englische Fassung fuer /en — der amtliche Titel bleibt der deutsche */
  titelEn: string;
  textEn: string;
};

export const ANGEBOTE: Record<string, Angebot[]> = {
  "Strategische Kundengewinnung (Vertrieb 2.0)": [
    {
      titel: "Als Dialogspezialist(in) erfolgreich Kunden gewinnen",
      ue: 820,
      nr: "621-139-2025",
      pdf: "Angebot Dialogspezialist.pdf",
      dkz: "92122-104",
      gueltig: "13.12.2024 – 12.12.2027",
      stelle: "CERTQUA",
      text: "Weiterbildung zur professionellen Kundenkommunikation und Kundengewinnung, besonders für telefonische Dialoge in Vertrieb, Kundenservice und Vertriebsassistenz. 10 Kapitel von der Adressrecherche bis zum eigenen Gesprächsleitfaden.",
      web: "https://vertriebskurs.seminarkontor.com/",
      titelEn: "Winning customers as a dialogue specialist",
      textEn: "Training in professional customer communication and acquisition, especially for telephone conversations in sales, customer service and sales support. 10 chapters, from researching contacts to building your own call guide.",
    },
  ],
  Cybersicherheit: [
    {
      titel: "Cyber-Security & Informationssicherheit mit NIS-2, ISMS & KI-Integration",
      ue: 400,
      nr: "621-5-2026",
      pdf: "Bildungsangebot Cybersecurity_Kurs_400UE_.pdf",
      dkz: "43384-11400",
      gueltig: "30.09.2025 – 29.09.2028",
      stelle: "CERTQUA",
      text: "Praxisorientierte Qualifizierung in Cybersecurity, ISMS nach ISO 27001 und Umsetzung der NIS-2-Richtlinie, einschließlich KI-Integration und EU AI Act. 8 Lektionen mit Abschlussprojekt.",
      web: "https://cybersecurity-training.seminarkontor.com/",
      titelEn: "Cyber security & information security with NIS-2, ISMS & AI integration",
      textEn: "Hands-on qualification in cyber security, ISMS to ISO 27001 and implementing the NIS-2 directive, including AI integration and the EU AI Act. 8 lessons with a final project.",
    },
  ],
  Fördermittelmanagement: [
    {
      titel: "Fördermittelberater(in) für die Digitalisierung",
      ue: 500,
      nr: "621-0211-2025",
      pdf: "Bildungsangebot Fördermittelberater_500UE.pdf",
      dkz: "71324-11800",
      gueltig: "30.09.2025 – 29.09.2028",
      stelle: "GUTcert",
      text: "Kompakte Ausbildung zur/zum Fördermittelberater/in für Digitalisierung: Förderlandschaft, Recherche, Antragstellung, Evaluierung und Abwicklung für interne und externe Kunden. 6 Kapitel, trägerinternes Zertifikat.",
      web: "https://foerdermittelkurs.seminarkontor.com/",
      titelEn: "Funding advisor for digitalisation",
      textEn: "Compact training to become a funding advisor for digitalisation: the funding landscape, research, applications, evaluation and processing for internal and external clients. 6 chapters, provider certificate.",
    },
    {
      titel: "Lehrgang zur qualifizierten Fördermittelberatung im Bereich Digitalisierung",
      ue: 1530,
      nr: "621-86-2025",
      pdf: "Bildungsangebot Fördermittelberater.pdf",
      dkz: "71324-118",
      gueltig: "30.01.2025 – 29.01.2028",
      stelle: "CERTQUA",
      text: "Umfassender Lehrgang mit persönlichem Coaching: zusätzlich Projektmanagement, Compliance, Forschung & Entwicklung, Netzwerkaufbau und die Vermarktung förderfähiger Leistungen. 12 Kapitel mit Abschlussprojekt.",
      web: "https://foerdermittelkurs.seminarkontor.com/",
      titelEn: "Course in qualified funding advice for digitalisation",
      textEn: "Comprehensive course with personal coaching: additionally covers project management, compliance, research & development, networking and marketing fundable services. 12 chapters with a final project.",
    },
  ],
  "Social Media Strategie": [
    {
      titel: "Social Media Manager/in",
      ue: 500,
      nr: "621-28-2026",
      pdf: "Bildungsangebot Social Media_Kurs_500UE.pdf",
      dkz: "92113-18400",
      gueltig: "30.09.2025 – 29.09.2028",
      stelle: "CERTQUA",
      text: "Kompakter Lehrgang zur/zum Social Media Manager/in: Strategie, Content Creation, Community Management, Paid-Social-Kampagnen und Erfolgsmessung. 7 Kapitel.",
      web: "https://socialmediakurs.seminarkontor.com/",
      titelEn: "Social media manager",
      textEn: "Compact course to become a social media manager: strategy, content creation, community management, paid social campaigns and measuring success. 7 chapters.",
    },
    {
      titel: "Lehrgang zum qualifizierten Social Media Manager",
      ue: 1540,
      nr: "621-0061-2025",
      pdf: "Angebot Social Media.pdf",
      dkz: "92113-195",
      gueltig: "30.01.2025 – 29.01.2028",
      stelle: "CERTQUA",
      text: "Ausführlicher Lehrgang zum qualifizierten Social Media Manager mit Schwerpunkt Paid Social Advertising. In jedem Kapitel arbeiten die Teilnehmenden an einem eigenen Praxisprojekt. 7 Kapitel à 220 UE.",
      web: "https://socialmediakurs.seminarkontor.com/",
      titelEn: "Course to become a qualified social media manager",
      textEn: "In-depth course to become a qualified social media manager, with a focus on paid social advertising. In every chapter participants work on their own practical project. 7 chapters of 220 teaching units each.",
    },
  ],
  "KI Engineer": [
    {
      titel: "KI-Engineer",
      ue: 500,
      nr: "621-214-2025",
      pdf: "Bildungsangebot KI Engineer_Kurs_500UE 2.pdf",
      dkz: "43104-13600",
      gueltig: "30.09.2025 – 29.09.2028",
      stelle: "CERTQUA",
      text: "Weiterbildung zur/zum KI-Engineer: Grundlagen, DSGVO, Prompting, Content-Erstellung, Toolauswahl, KI-Potenzialanalyse im Unternehmen und Workflow-Automatisierung. 8 Lektionen mit Praxisaufgaben aus dem eigenen Berufsalltag.",
      web: "https://ki-akademie.seminarkontor.com/",
      titelEn: "AI engineer",
      textEn: "Training to become an AI engineer: fundamentals, GDPR, prompting, content creation, choosing tools, analysing AI potential in the company and workflow automation. 8 lessons with practical tasks from participants' own work.",
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
    ue: "820 UE · AZAV-zugelassen",
    url: "https://vertriebskurs.seminarkontor.com/",
    en: {
      name: "Strategic customer acquisition (Sales 2.0)",
      titel: "Strategic customer acquisition",
      text: "Win customers deliberately — from researching contacts and finding the right decision-maker, through value-based arguments, active listening and questioning techniques, to handling objections with confidence. Participants build their own call guide and strengthen the self-motivation behind lasting sales success.",
      ue: "820 teaching units · AZAV-approved",
    },
  },
  {
    prog: "Cybersicherheit",
    titel: "Cybersicherheit",
    text: "Informationssicherheit praxisnah im Unternehmen verankern: Phishing und Social Engineering erkennen, die NIS-2-Pflichten verstehen und ein ISMS nach ISO 27001 aufbauen. Dazu technische Schutzmaßnahmen, Incident Response, Awareness für das ganze Team und der EU AI Act — mit eigenem Abschlussprojekt.",
    ue: "400 UE · AZAV-zugelassen",
    url: "https://cybersecurity-training.seminarkontor.com/",
    en: {
      name: "Cyber security",
      titel: "Cyber security",
      text: "Anchor information security in day-to-day work: recognise phishing and social engineering, understand NIS-2 obligations and build an ISMS to ISO 27001. Plus technical safeguards, incident response, awareness for the whole team and the EU AI Act — with a final project of their own.",
      ue: "400 teaching units · AZAV-approved",
    },
  },
  {
    prog: "Fördermittelmanagement",
    titel: "Fördermittelmanagement",
    text: "Fördermittel systematisch erschließen: Programme recherchieren und bewerten, Anträge professionell stellen und abwickeln, Nachweise und Berichte sauber führen — mit Schwerpunkt Digitalisierung, u. a. BAFA und Landesprogramme. Die Langfassung ergänzt Projektmanagement, Compliance und die Vermarktung förderfähiger Leistungen.",
    ue: "500 oder 1530 UE · AZAV-zugelassen",
    url: "https://foerdermittelkurs.seminarkontor.com/",
    en: {
      name: "Funding management",
      titel: "Funding management",
      text: "Tap into public funding systematically: research and assess programmes, prepare and process applications professionally, keep evidence and reports in order — with a focus on digitalisation, including BAFA and state programmes. The long version adds project management, compliance and marketing fundable services.",
      ue: "500 or 1,530 teaching units · AZAV-approved",
    },
  },
  {
    prog: "Social Media Strategie",
    titel: "Social Media Strategie",
    text: "Social Media für Sichtbarkeit, Kunden- und Mitarbeitergewinnung nutzen: Strategie und Redaktionsplanung, Content für Text, Bild und Video, Community Management sowie Planung und Optimierung bezahlter Kampagnen. Mit Analysetools messen die Teilnehmenden den Erfolg und steuern datenbasiert nach.",
    ue: "500 oder 1540 UE · AZAV-zugelassen",
    url: "https://socialmediakurs.seminarkontor.com/",
    en: {
      name: "Social media strategy",
      titel: "Social media strategy",
      text: "Use social media for visibility, customer acquisition and recruiting: strategy and editorial planning, content for text, image and video, community management, and planning and optimising paid campaigns. Participants measure success with analytics tools and steer by the data.",
      ue: "500 or 1,540 teaching units · AZAV-approved",
    },
  },
  {
    prog: "KI Engineer",
    titel: "KI Engineer",
    text: "KI sicher und produktiv im Arbeitsalltag einsetzen: Grundlagen und Grenzen von KI, DSGVO-konformer Umgang, strukturiertes Prompting und Content mit gängigen Tools. Die Teilnehmenden finden KI-Potenziale im eigenen Unternehmen und automatisieren Abläufe, etwa mit Zapier, Make oder n8n.",
    ue: "500 UE · AZAV-zugelassen",
    url: "https://ki-akademie.seminarkontor.com/",
    en: {
      name: "AI engineer",
      titel: "AI engineer",
      text: "Use AI safely and productively at work: fundamentals and limits of AI, GDPR-compliant handling, structured prompting and content with common tools. Participants find AI potential in their own company and automate workflows, for example with Zapier, Make or n8n.",
      ue: "500 teaching units · AZAV-approved",
    },
  },
];

/* Folien-IDs — die angezeigten Titel stehen je Sprache in lib/texte.tsx */
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
