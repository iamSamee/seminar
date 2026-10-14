/* Alle sichtbaren Texte der Konsole je Sprache. "en" ist an den Typ von
   "de" gebunden — fehlt dort ein Text, schlägt der Build fehl. */
import type { ReactNode } from "react";
import type { Exp, SlideId, Size } from "@/lib/data";

export type Lang = "de" | "en";
type Req = "std" | "abschluss" | "sv";
type Paar = [string, string];

const de = {
  locale: "de-DE",
  pctSuffix: " %",
  wechsel: { href: "/en", label: "EN", aria: "English version" },
  logoAlt: "Seminarkontor GmbH",
  navAria: "Präsentationsabschnitte",
  reset: "Zurücksetzen",
  zurueck: "← Zurück",
  weiter: "Weiter →",
  druckTitel: "Zusammenfassung",
  folien: {
    Kennenlernen: "Kennenlernen",
    Vorerfahrung: "Vorerfahrung",
    Seminarkontor: "Seminarkontor",
    "Unsere Dozenten": "Unsere Dozenten",
    Ausgangslage: "Ausgangslage",
    Bildungsgutschein: "Bildungsgutschein",
    Förderquote: "Förderquote",
    Voraussetzungen: "Voraussetzungen",
    "Ihr Kontingent": "Ihr Kontingent",
    Weiterbildungen: "Weiterbildungen",
    "Ihre Ersparnis": "Ihre Ersparnis",
    Ablauf: "Ablauf",
    "Ihre Angaben": "Ihre Angaben",
    "Erhebungsbogen anfordern": "Erhebungsbogen anfordern",
    Zusammenfassung: "Zusammenfassung",
  } as Record<SlideId, string>,
  offen: "offen",
  nochOffen: "noch offen",
  terminIdeal: "Ideal am ",
  kopiertOk: "Nachricht kopiert — im Kontaktformular bei „Nachricht“ mit Strg + V einfügen.",
  kopiertFehler: "Kopieren war nicht möglich — bitte den Text auf der Folie markieren und mit Strg + C kopieren.",
  azavAlt: "GUTcert — Zulassung AZAV",
  isoAlt: "DEKRA zertifiziert — Qualitätsmanagement ISO 9001",
  azavKurz: "AZAV-zugelassener Träger",
  isoKurz: "ISO 9001:2015 zertifiziert",
  traeger: "Seminarkontor GmbH — seit 2002 Spezialist für Unternehmensentwicklung.",

  kennenlernen: {
    h2: "Schön, dass Sie sich die Zeit nehmen — lernen wir uns kurz kennen.",
    lede: "Bevor wir über Förderung sprechen: Erzählen Sie mir kurz, wer Sie sind und was Sie gerade beschäftigt. Ich stelle mich genauso vor. Die Notizen hier helfen mir, alles Weitere auf Ihre Situation zuzuschneiden.",
    fahrplanTitel: "Unser Fahrplan für die nächsten Minuten",
    fahrplan: [
      <>Kurz kennenlernen und klären, wo bei Ihnen Know-how fehlt.</>,
      <>Ihre <strong>konkrete Förderquote</strong> bestimmen — abhängig von der Unternehmensgröße.</>,
      <>Prüfen, ob Ihre Mitarbeitenden die <strong>Voraussetzungen erfüllen</strong>.</>,
      <>Eine <strong>Zahl für Ihr Budget</strong> rechnen — und den nächsten Schritt festlegen.</>,
    ] as ReactNode[],
    fahrplanNotiz: "Kein Verkaufsgespräch mit Abschlussdruck: Am Ende entscheiden Sie nur, ob sich eine unverbindliche Prüfung durch die Agentur für Arbeit für Sie lohnt.",
    proofTitel: "Die Mittel stehen bereit — und zwar dauerhaft.",
    proofLede: "Der Bildungsgutschein ist kein befristetes Sonderprogramm mit gedeckeltem Topf, der plötzlich ausgeschöpft ist. Er ist ein laufendes Regelinstrument nach § 82 SGB III und wird aus Beitragsmitteln der Bundesagentur für Arbeit finanziert.",
    proof: [
      ["Kein Windhundverfahren", "Anders als bei gedeckelten Landesprogrammen entscheidet nicht, wer zuerst kommt, sondern die Prüfung Ihres Einzelfalls."],
      ["Laufend verfügbar", "Kein Antragsfenster, keine Stichtage — Sie können jederzeit einsteigen."],
      ["Aber: Vorlauf einplanen", "3 bis 6 Wochen bis zum Gutschein, danach üblicherweise 2 Wochen bis 3 Monate bis zum Kursstart."],
    ] as Paar[],
  },

  vorerfahrung: {
    h2: "Hatten Sie bereits Berührungspunkte mit Bildungsgutscheinen?",
    lede: "Die Antwort ändert nichts am weiteren Verlauf — wir gehen ohnehin alle entscheidenden Punkte gemeinsam durch. Sie hilft mir nur, das Gespräch passend für Sie anzusetzen.",
    antworten: { genutzt: "Ja, schon genutzt", gehoert: "Gehört ja, nie genutzt", neu: "Nein, ist neu für uns" } as Record<Exp, string>,
    standard: "Wählen Sie, was am ehesten zutrifft — oder wir überspringen die Frage einfach.",
    bridge: {
      genutzt:
        "Sehr gut — dann kennen Sie den Ablauf im Grundsatz. Umso wichtiger ist, was sich bei Fördersätzen und Themen inzwischen geändert hat. Genau darauf gehen wir gleich ein.",
      gehoert:
        "Das geht vielen so. Der Grund ist fast immer derselbe — der erste Schritt wirkt aufwendiger, als er tatsächlich ist. Wir schauen uns gleich an, woraus er wirklich besteht.",
      neu: "Dann fangen wir sauber von vorne an. Sie brauchen kein Vorwissen — am Ende entscheiden Sie nur, ob sich die Prüfung für Sie lohnt.",
    } as Record<Exp, string>,
    label: { genutzt: "Bereits genutzt", gehoert: "Bekannt, nie genutzt", neu: "Neu für das Unternehmen" } as Record<Exp, string>,
  },

  seminarkontor: {
    lede: "Gegründet von Oscar Nobre, mit Sitz in Leinfelden-Echterdingen. Wir beraten mittelständische Unternehmen im Vertrieb und führen Trainings und Coachings durch — mit einem Kompetenzteam aus erfahrenen Trainern und Beratern.",
    fakten: ["Gegründet 2002", "Leinfelden-Echterdingen", "HRB 25154 · AG Stuttgart", "Zertifizierter Bildungsträger"],
    oscarRolle: "Gründer & Geschäftsführer, Trainer & Coach",
    oscarText: "Ihr fester Ansprechpartner — von der ersten Beratung bis zum erfolgreichen Weiterbildungsabschluss.",
    zertTitel: "Zertifizierungen & Zulassungen",
    zert: [
      <><strong>AZAV-zertifiziert</strong> — Voraussetzung dafür, dass ein Bildungsgutschein bei uns überhaupt einlösbar ist.</>,
      <><strong>ISO 9001:2015</strong> zertifiziertes Qualitätsmanagement.</>,
      <>Gelistet im Förderprogramm <strong>go-digital</strong>.</>,
      <>Zugelassen für <strong>ESF-Beratung</strong> (L-Bank Baden-Württemberg).</>,
    ] as ReactNode[],
    fussnote: "Wie wir unterrichten und wer vor Ihren Mitarbeitenden steht, sehen Sie auf der nächsten Folie.",
  },

  dozenten: {
    h2: "Die Zulassung entscheidet über die Förderung — die Dozenten über das Ergebnis.",
    lede: "Ein Bildungsgutschein ist schnell beantragt. Ob Ihre Mitarbeitenden danach wirklich etwas können, hängt daran, wer den Unterricht hält und wie er aufgebaut ist.",
    proofTitel: "Bei uns unterrichten ausschließlich Profis.",
    proofLede: "Keine Nachwuchskräfte, keine Werkstudenten, keine abgelesenen Folien. Jede Weiterbildung wird von Fachleuten gehalten, die das Thema im eigenen Berufsalltag praktizieren — und die Ihre Teilnehmenden über die gesamte Laufzeit fachlich begleiten.",
    proof: [
      ["Praktiker statt Theoretiker", "Unsere Dozenten arbeiten selbst im Feld, das sie unterrichten."],
      ["Langjährige Berufserfahrung", "Ausgewählt nach nachgewiesener Fachpraxis, nicht nach Verfügbarkeit."],
      ["Live-Training statt Videokurs", "Unterricht mit echten Dozenten im digitalen Klassenzimmer."],
      ["Begleitung statt Abgabe", "Transferaufgaben und Lernzielkontrollen werden persönlich betreut."],
    ] as Paar[],
    stimmenTitel: "Was Kunden über uns sagen",
    karten: [
      ["Digitales Klassenzimmer", "Ortsunabhängiges Lernen ohne Reisezeiten — Ihre Mitarbeitenden bleiben im Betrieb erreichbar."],
      ["Berufsbegleitend", "Rund 15 Stunden pro Woche, abgestimmt auf das Tagesgeschäft statt dagegen."],
      ["Praxistransfer", "Transferaufgaben bringen das Wissen direkt in Ihre Prozesse — am eigenen Unternehmen bearbeitet."],
    ] as Paar[],
  },

  ausgangslage: {
    h2: "Der Mittelstand steht unter Transformationsdruck.",
    lede: "Fachkräftemangel, KI, Cybersecurity und neue Vertriebskompetenzen treffen auf ein Tagesgeschäft, das kaum Zeit oder Budget für Qualifizierung lässt. Genau diese Lücke schließt der Bildungsgutschein.",
    karten: [
      ["Fachkräftemangel", "Offene Stellen bleiben monatelang unbesetzt — Wissen fehlt dort, wo es gebraucht wird."],
      ["Digitaler Wandel", "KI und Automatisierung erfordern Kompetenzen, die es im Team bisher nicht gibt."],
      ["Zeit- & Budgetdruck", "Das Tagesgeschäft lässt kaum Raum für strategische Qualifizierung."],
    ] as Paar[],
    nutzenTitel: "Was Weiterbildung im Bestand leistet",
    nutzen: [
      <><strong>Wettbewerbsfähigkeit</strong> — qualifizierte Teams reagieren schneller auf Marktveränderungen.</>,
      <><strong>Mitarbeiterbindung</strong> — Entwicklungsperspektiven sind der stärkste Hebel gegen Fluktuation.</>,
      <><strong>Kostenvorteil</strong> — bestehende Mitarbeitende zu qualifizieren ist bis zu 6× günstiger als Neueinstellungen.</>,
    ] as ReactNode[],
    schluss: [
      "Die gute Nachricht: Diese Lücke müssen Sie nicht aus eigener Tasche schließen.",
      "Wer seine Mitarbeitenden jetzt qualifiziert, sichert sich den Vorsprung — und der Staat trägt einen Großteil der Kosten. Lassen Sie uns gemeinsam prüfen, wie viel davon auf Ihr Unternehmen entfällt.",
    ] as Paar,
  },

  gutschein: {
    h2: "Ihre Mitarbeitenden qualifizieren — bei bis zu 0 € Eigenanteil.",
    lede: "Der Bildungsgutschein ist ein Förderinstrument der Agentur für Arbeit. Er finanziert berufliche Weiterbildung Ihrer Beschäftigten — je nach Unternehmensgröße bis zur vollständigen Kostenübernahme, zusätzlich mit Zuschuss zu den Lohnkosten während der Qualifizierung.",
    karten: [
      ["Kosten reduzieren", "Der Staat finanziert einen Großteil der Weiterbildungskosten — in vielen Fällen vollständig."],
      ["Zertifiziert lernen", "AZAV-zugelassene Kurse bei einem zertifizierten Bildungsträger — online im digitalen Klassenzimmer."],
      ["Begleitung inklusive", "Die Seminarkontor GmbH übernimmt Antragsbegleitung und Koordination mit der Arbeitsagentur."],
    ] as Paar[],
    schluss: [
      "Ab hier wird es konkret:",
      "In den nächsten Minuten prüfen wir Ihre Fördersituation Schritt für Schritt. Rechts unter „Unsere Agenda“ halten wir dabei alle Ergebnisse fest — die Grundlage für den Erhebungsbogen.",
    ] as Paar,
  },

  quote: {
    h2: "Wie groß ist Ihr Unternehmen?",
    lede: "Die Förderquote richtet sich nach der Unternehmensgröße. Für kleine und mittlere Unternehmen ist die vollständige Kostenübernahme möglich.",
    groessen: { klein: "Bis 50 Mitarbeitende", mittel: "50 – 499 Mitarbeitende", gross: "Über 500 Mitarbeitende" } as Record<Size, string>,
    kopf: ["Unternehmensgröße", "Weiterbildungskosten", "Lohnkostenzuschuss"],
    zeilen: {
      klein: "Kleine/mittlere Unternehmen (bis 50 MA)",
      mittel: "Größere Unternehmen (50 – 499 MA)",
      gross: "Großunternehmen (über 500 MA)",
    } as Record<Size, string>,
    figs: ["der Weiterbildungskosten werden übernommen", "Zuschuss zu den Lohnkosten während der Weiterbildung", "Eigenanteil an den Kurskosten"],
    schluss: [
      "Grundlage der Förderung ist § 82 SGB III (Qualifizierungschancengesetz).",
      "Die verbindliche Förderquote bestätigt die Agentur für Arbeit im Einzelfall — wir prüfen sie gemeinsam mit Ihnen vor der Antragstellung.",
    ] as Paar,
  },

  voraus: {
    h2: "Erfüllen Ihre Mitarbeitenden die Voraussetzungen?",
    lede: "Drei Kriterien entscheiden. Klicken Sie an, was auf Ihre Belegschaft zutrifft — wir prüfen live mit.",
    kriterien: [
      ["std", "Mindestens 20 Stunden pro Woche beschäftigt", "Teilzeit ab 20 h/Woche ist ausreichend."],
      ["abschluss", "Ausbildungsabschluss oder Studium liegt mindestens 2 Kalenderjahre zurück", "Gerechnet ab dem Abschlussjahr."],
      ["sv", "Sozialversicherungspflichtiges Beschäftigungsverhältnis", "Minijob und Geschäftsführer ohne SV-Pflicht sind ausgeschlossen."],
    ] as [Req, string, string][],
    urteil: (n: number) =>
      n === 3
        ? "Alle drei Voraussetzungen sind erfüllt — die Beantragung eines Bildungsgutscheins ist möglich. Nächster Schritt: Erhebungsbogen."
        : n > 0
          ? n + " von 3 Kriterien erfüllt. Auch bei Unsicherheit lohnt die Prüfung — Einzelfälle klären wir direkt mit der Agentur für Arbeit."
          : "Wählen Sie die zutreffenden Punkte aus.",
    schluss: [
      "Bei Unsicherheit im Einzelfall klären wir die Voraussetzungen direkt mit der Agentur für Arbeit.",
      "Das kostet Sie nichts und geht schneller, als die Frage offenzulassen.",
    ] as Paar,
  },

  kontingent: {
    h2: "Wie viele Bildungsgutscheine sind bei Ihnen realistisch?",
    lede: "Die Agentur für Arbeit fördert nicht die gesamte Belegschaft auf einmal. Als Orientierung gilt eine einfache Faustregel — tragen Sie Ihre Mitarbeiterzahl ein.",
    kartenTitel: "Wie viele Gutscheine sind realistisch?",
    regel: <>Faustregel der Arbeitsagentur: <strong>1 Bildungsgutschein pro 3 Mitarbeitende.</strong></>,
    maLabel: "Mitarbeitende im Unternehmen",
    maPlatzhalter: "z. B. 30",
    figK: "Bildungsgutscheine sind bei dieser Belegschaftsgröße als Orientierung realistisch",
    empfK: "Unsere Empfehlung",
    empf: (
      <>
        Unabhängig davon, wie viele Förderungen grundsätzlich möglich wären, empfehlen wir, zunächst mit{" "}
        <strong>zwei Teilnehmenden</strong> zu starten. So kann der Prozess sauber angestoßen, die Umsetzung im
        Unternehmen erprobt und anschließend auf weitere Mitarbeitende ausgeweitet werden.
      </>
    ),
    fussnote: "Die Faustregel ist eine Orientierung, keine feste Obergrenze. Maßgeblich ist die Einzelfallprüfung durch die Agentur für Arbeit.",
  },

  weiterbildungen: {
    h2: "Welche Kompetenzen fehlen Ihnen im Team?",
    lede: "AZAV-zertifiziert, 100 % online im digitalen Klassenzimmer: 500 Unterrichtseinheiten in 6 Monaten bei rund 11 bis 15 Stunden pro Woche. Praxisnahes Live-Training mit erfahrenen Dozenten, ergänzt durch Transferaufgaben, betreute Lernphasen und regelmäßige Lernzielkontrollen.",
    azav: [
      "Zugelassen durch die GUTcert GmbH, akkreditiert von der DAkkS. Fachbereich: Maßnahmen der beruflichen Weiterbildung nach SGB III. Ohne diese Zulassung wäre hier kein Bildungsgutschein einlösbar.",
      "Zulassungszeitraum 11.05.2023 – 10.05.2028",
    ] as Paar,
    iso: [
      "Qualitätsmanagementsystem, geprüft und jährlich auditiert durch die DEKRA Certification GmbH, Stuttgart.",
      "Reg.-Nr. 91018614/2 · gültig bis 14.10.2027",
    ] as Paar,
  },

  ersparnis: {
    h2: "Was bedeutet das konkret für Ihr Budget?",
    lede: "Passen Sie die Werte an Ihre Situation an — die Förderung rechnet live mit.",
    kosten: "Kurskosten je Teilnehmer (€)",
    gehalt: "Bruttogehalt je Monat (€)",
    tn: "Teilnehmende",
    monate: "Dauer (Monate)",
    stunden: "Weiterbildung (Std./Monat)",
    regel: "Regelarbeitszeit (Std./Monat)",
    manuell: "manuell gesetzt",
    ausKontingent: (ma: number) => "übernommen aus Ihrem Kontingent (" + ma + " Mitarbeitende)",
    figGesamt: "Gesamtförderung über die volle Laufzeit",
    figEigen: "Eigenanteil an den Kurskosten",
    aufschluesselung: "So setzt sich die Förderung zusammen",
    zeilen: {
      kosten: "Kurskosten je Teilnehmer",
      kursFoerder: (p: string) => "davon gefördert (" + p + ")",
      stundenlohn: "Stundenlohn (brutto)",
      lohnGesamt: (m: number) => "Lohnkosten der Weiterbildungsstunden über " + m + " Monate",
      lohnFoerder: (p: string) => "davon bezuschusst (" + p + ")",
      lohnProMonat: "Lohnkostenzuschuss je Monat",
      jeTn: "Förderung je Teilnehmer",
      gesamt: (n: number) => "Gesamtförderung für " + n + " Teilnehmende",
    },
    keineGroesse: "Unternehmensgröße noch nicht gewählt",
    fussnote: "Wählen Sie auf dem Abschnitt „Förderquote“ Ihre Unternehmensgröße aus, damit die Rechnung greift. Der Lohnkostenzuschuss wird auf den Anteil des Bruttogehalts angewendet, der auf die Weiterbildungsstunden entfällt. Alle Werte sind unverbindliche Orientierung — die verbindliche Zusage erteilt die Agentur für Arbeit.",
  },

  ablauf: {
    h2: "Sieben Schritte bis zum Start — die Koordination übernehmen wir.",
    lede: "Typische Bearbeitungszeit: 3 – 6 Wochen bis zum Weiterbildungsstart.",
    schritte: [
      ["Beratung & Kurse auswählen", "Genau das, was wir heute gemeinsam tun."],
      ["Abstimmung mit den Teilnehmenden & Erhebungsbogen anfordern", "Ihr nächster Schritt — hier setzen wir gemeinsam an."],
      ["Erhebungsbogen gemeinsam ausfüllen", "Im gemeinsamen Termin gehen wir den Bogen Feld für Feld durch — Termin direkt über den Kalender."],
      ["Erhebungsbogen & Bildungsangebot einreichen", "Wir bereiten die Unterlagen für die Arbeitsagentur auf."],
      ["Prüfung durch die Arbeitsagentur", "Wir begleiten Rückfragen und halten den Prozess in Bewegung."],
      ["Bildungsgutschein wird ausgestellt", "Die Förderzusage liegt Ihnen schriftlich vor."],
      ["Start der Weiterbildung", "Digitales Klassenzimmer, Live-Training mit Dozenten, fachliche Begleitung."],
    ] as Paar[],
    todoTitel: "Was Sie dafür tun müssen",
    todo: [
      "Intern geeignete Mitarbeitende identifizieren.",
      "Termin mit Oscar Nobre vereinbaren.",
      "Erhebungsbogen gemeinsam ausfüllen — den Rest übernehmen wir.",
    ],
    tnTitel: "Teilnehmende intern festlegen",
    tnText: (n: number) =>
      "Nach Ihrer Rechnung sind das " + n + (n === 1 ? " Person" : " Personen") + ". Wer genau qualifiziert werden soll, brauchen wir für die Antragstellung.",
    anzahl: "Anzahl Personen",
    anzahlHinweis: "aus „Ihre Ersparnis“ — dort ändern",
    spalten: ["Vorname", "Name", "Weiterbildung", "Position heute"],
    positionPlatzhalter: "z. B. Innendienst",
    aria: {
      vorname: (i: number) => "Vorname Person " + i,
      name: (i: number) => "Name Person " + i,
      kurs: (i: number) => "Weiterbildung Person " + i,
      position: (i: number) => "Position heute, Person " + i,
    },
    hinweis: "Nicht alles muss jetzt feststehen — den Rest ergänzen wir beim gemeinsamen Termin.",
  },

  angaben: {
    h2: "Ihre Angaben und die passenden Bildungsangebote.",
    lede: "Diese Angaben braucht der Arbeitgeberservice für den Erhebungsbogen — und wir für die passende Maßnahme. Was noch nicht feststeht, bleibt einfach offen.",
    formTitel: "Ihre Angaben für den Erhebungsbogen",
    felder: {
      firma: ["Unternehmen", "Firmenname"],
      name: ["Ansprechpartner", "Vor- und Nachname"],
      rolle: ["Rolle im Unternehmen", "z. B. Geschäftsführung, HR"],
      branche: ["Branche", "z. B. Maschinenbau"],
      mail: ["E-Mail des Ansprechpartners", "name@firma.de"],
      telefon: ["Telefonnummer", "+49 …"],
      strasse: ["Straße und Hausnummer", "Straße Nr."],
      plz: ["PLZ", "PLZ"],
      ort: ["Ort", "Ort"],
    } as Record<"firma" | "name" | "rolle" | "branche" | "mail" | "telefon" | "strasse" | "plz" | "ort", Paar>,
    formNotiz: "Diese Angaben stehen gleich im Spickzettel und in der Zusammenfassung — Sie müssen sie nicht noch einmal nennen.",
    pflicht: "Pflichtfeld",
    auswahlTitel: "Ihre Auswahl",
    auswahlHinweis: "Rechts ein oder mehrere Bildungsangebote anklicken — Titel, Beschreibung und Unterlagen erscheinen hier.",
    angebotOeffnen: "Bildungsangebot öffnen",
    kursseite: "Kursseite",
    ue: "UE",
    massnNr: "Maßn.-Nr.",
    alleUnterlagen: "Alle Unterlagen öffnen",
    anbieterNr: "Anbieter-Nr. (BA)",
    alleNotiz: "alle Maßnahmen AZAV-zugelassen und digital",
    listeTitel: "Passende Bildungsangebote",
    listeText: "Wählen Sie die passenden Maßnahmen aus. Mit „Vorschlag“ markiert sind Angebote zu Ihrer Programmauswahl — entschieden wird von Hand. Die Auswahl geht mit Beschreibung und Unterlagen in die Zusammenfassung.",
    vorschlag: "Vorschlag",
  },

  anfordern: {
    h2: "Erhebungsbogen anfordern — unverbindlich und in wenigen Minuten ausgefüllt.",
    ledeStark: "Lassen Sie uns den nächsten Schritt direkt gemeinsam gehen.",
    ledeVor: " Den Erhebungsbogen für die geförderte Weiterbildung beantragen wir am besten gleich gemeinsam über die ",
    ledeLink: "Online-Anfrage der Agentur für Arbeit",
    telK: "Telefonisch · gebührenfrei",
    telS: "Zentraler Arbeitgeber-Service der Agentur für Arbeit",
    webK: "Online",
    webV: "Kontaktformular",
    webS: "Unternehmensanfrage beim Arbeitgeber-Service — web.arbeitsagentur.de",
    bereitTitel: "Das halten Sie für die Anforderung bereit",
    bereitText: "Alles, was wir gerade gemeinsam eingetragen haben — zum Vorlesen am Telefon oder zum Ausfüllen online.",
    nachrichtTitel: "Nachricht für das Kontaktformular",
    nachrichtText: "Wird beim Klick auf „Online-Anfrage“ bzw. „Kontaktformular“ automatisch kopiert — im Formular bei „Nachricht“ mit Strg + V einfügen.",
    nachrichtUebersetzung: null as string | null,
    kopieren: "Nachricht kopieren",
    zeilen: {
      firma: "Unternehmen",
      anschrift: "Anschrift",
      person: "Ansprechpartner",
      telefon: "Telefon",
      mail: "E-Mail",
      ma: "Mitarbeitende",
      tn: "Vorgesehene Teilnehmende",
      kurs: "Weiterbildung",
      traeger: "Bildungsträger",
    },
  },

  zusammenfassung: {
    h2: "Ihre Zusammenfassung — und wie es jetzt weitergeht.",
    lede: "Alles aus unserem Gespräch auf einen Blick — diese Zusammenfassung erhalten Sie anschließend auch per E-Mail.",
    titel: "Zusammenfassung unseres Gesprächs",
    zeilen: {
      firma: "Unternehmen",
      person: "Ansprechpartner",
      branche: "Branche",
      exp: "Vorerfahrung mit Bildungsgutscheinen",
      groesse: "Unternehmensgröße",
      kurs: "Fördersatz Weiterbildungskosten",
      lohn: "Fördersatz Lohnkosten",
      req: "Voraussetzungen geprüft",
      reqWert: (n: number) => n + " von 3",
      ma: "Mitarbeitende im Unternehmen",
      gutscheine: "Mögliche Bildungsgutscheine",
      progs: "Gewählte Weiterbildungen",
      tn: "Teilnehmende in der Rechnung",
      lohnMonatTn: "Lohnkostenzuschuss je Monat und Teilnehmer",
      lohnMonat: "Lohnkostenzuschuss je Monat gesamt",
      gesamt: "Geschätzte Gesamtförderung",
    },
    weiterTitel: "So geht es jetzt konkret weiter",
    weiter: [
      ["Erhebungsbogen abwarten", "Der Erhebungsbogen der Agentur für Arbeit sollte in der Regel innerhalb der nächsten 3–5 Tage bei Ihnen eingehen. Damit ist der erste formale Schritt bereits auf den Weg gebracht."],
      ["Teilnehmer intern abstimmen", "Nutzen Sie die nächsten Tage, um sich intern bereits mit den möglichen Teilnehmerinnen und Teilnehmern abzustimmen. Überlegen Sie gemeinsam: Für wen ist die Weiterbildung fachlich sinnvoll und wo entsteht für Ihr Unternehmen der größte Nutzen?"],
      ["Termin mit Ihrem Bildungsberater", "Sobald der Erhebungsbogen vorliegt, gehen wir den nächsten Schritt gemeinsam mit Ihrem Bildungsberater. Im Termin füllen wir die Unterlagen gemeinsam aus, klären offene Punkte und bereiten alles so vor, dass der Antrag vollständig und sauber eingereicht werden kann."],
    ] as Paar[],
    fazit: "Damit haben Sie einen klaren Fahrplan: Unterlagen erhalten, Teilnehmer festlegen, Antrag gemeinsam auf den Weg bringen.",
    beraterTitel: "Ihr Bildungsberater",
    buchen: "Termin online buchen",
    adresse: "Markomannenstraße 11 · 70771 Leinfelden-Echterdingen",
  },

  absenden: {
    titel: "Angaben absenden",
    text: "Mit dem Absenden gehen alle Angaben aus diesem Gespräch an Seminarkontor — als Grundlage für den Erhebungsbogen und den gemeinsamen Termin.",
    knopf: "Absenden",
    sendet: "Wird gesendet …",
    gesendet: "Gesendet ✓",
    csv: "Als CSV herunterladen",
    ok: "Vielen Dank — Ihre Angaben wurden übermittelt.",
    fehler: "Das Absenden hat nicht geklappt. Bitte versuchen Sie es erneut oder laden Sie die CSV herunter.",
    fehlt: (felder: string[]) => "Bitte noch ausfüllen: " + felder.join(", ") + ".",
    mailUngueltig: "Bitte eine gültige E-Mail-Adresse eintragen.",
  },

  agenda: {
    titel: "Unsere Agenda",
    fuer: "für ",
    groesse: "Unternehmensgröße",
    satz: "Fördersatz",
    satzWert: (k: string, l: string) => k + " Kurskosten · " + l + " Lohnkosten",
    req: "Voraussetzungen",
    reqAlle: "Alle 3 erfüllt",
    reqTeil: (n: number) => n + " von 3 geprüft",
    gutscheine: "Mögliche Gutscheine",
    gutscheineWert: (g: number, ma: number) => g + " Gutscheine (bei " + ma + " Mitarbeitenden)",
    progs: "Gewählte Weiterbildungen",
    foerderung: "Geschätzte Förderung",
  },
};

export type Texte = typeof de;

const en: Texte = {
  locale: "en-GB",
  pctSuffix: "%",
  wechsel: { href: "/", label: "DE", aria: "Deutsche Version" },
  logoAlt: "Seminarkontor GmbH",
  navAria: "Presentation sections",
  reset: "Reset",
  zurueck: "← Back",
  weiter: "Next →",
  druckTitel: "Summary",
  folien: {
    Kennenlernen: "Introduction",
    Vorerfahrung: "Prior experience",
    Seminarkontor: "Seminarkontor",
    "Unsere Dozenten": "Our trainers",
    Ausgangslage: "The situation",
    Bildungsgutschein: "Education voucher",
    Förderquote: "Funding rate",
    Voraussetzungen: "Requirements",
    "Ihr Kontingent": "Your quota",
    Weiterbildungen: "Training programmes",
    "Ihre Ersparnis": "Your savings",
    Ablauf: "Process",
    "Ihre Angaben": "Your details",
    "Erhebungsbogen anfordern": "Request survey form",
    Zusammenfassung: "Summary",
  },
  offen: "open",
  nochOffen: "still open",
  terminIdeal: "Ideally on ",
  kopiertOk: "Message copied — paste it into the “Nachricht” (message) field of the contact form with Ctrl + V.",
  kopiertFehler: "Copying didn't work — please select the text on the slide and copy it with Ctrl + C.",
  azavAlt: "GUTcert — AZAV approval",
  isoAlt: "DEKRA certified — ISO 9001 quality management",
  azavKurz: "AZAV-approved provider",
  isoKurz: "ISO 9001:2015 certified",
  traeger: "Seminarkontor GmbH — specialists in business development since 2002.",

  kennenlernen: {
    h2: "Thank you for taking the time — let's get to know each other.",
    lede: "Before we talk about funding: tell me briefly who you are and what's on your mind right now. I'll introduce myself too. These notes help me tailor everything that follows to your situation.",
    fahrplanTitel: "Our plan for the next few minutes",
    fahrplan: [
      <>Get to know each other and find out where your team is missing know-how.</>,
      <>Determine your <strong>actual funding rate</strong> — based on the size of your company.</>,
      <>Check whether your employees <strong>meet the requirements</strong>.</>,
      <>Work out <strong>a figure for your budget</strong> — and agree on the next step.</>,
    ],
    fahrplanNotiz: "No high-pressure sales pitch: at the end, all you decide is whether a free, no-obligation review by the Federal Employment Agency is worth it for you.",
    proofTitel: "The funds are available — permanently.",
    proofLede: "The education voucher (Bildungsgutschein) is not a time-limited special programme with a capped budget that can suddenly run dry. It is a standing instrument under § 82 SGB III (German Social Code, Book III), financed from contributions to the Federal Employment Agency.",
    proof: [
      ["Not first come, first served", "Unlike capped state programmes, what counts is the review of your individual case, not who applies first."],
      ["Always available", "No application windows, no deadlines — you can start at any time."],
      ["But: allow lead time", "3 to 6 weeks until the voucher is issued, then usually 2 weeks to 3 months until the course starts."],
    ],
  },

  vorerfahrung: {
    h2: "Have you come across education vouchers before?",
    lede: "Your answer doesn't change what comes next — we'll go through all the key points together either way. It just helps me pitch the conversation at the right level.",
    antworten: { genutzt: "Yes, we've used them", gehoert: "Heard of them, never used", neu: "No, they're new to us" },
    standard: "Choose whatever fits best — or we can simply skip this question.",
    bridge: {
      genutzt:
        "Great — then you know the basic process. That makes it all the more important to look at what has changed in funding rates and topics since. That's exactly what we'll cover next.",
      gehoert:
        "That's true for many companies. The reason is almost always the same — the first step looks like more work than it really is. We'll look at what it actually involves in a moment.",
      neu: "Then let's start from the beginning. You don't need any prior knowledge — at the end, all you decide is whether the review is worth it for you.",
    },
    label: { genutzt: "Used before", gehoert: "Known, never used", neu: "New to the company" },
  },

  seminarkontor: {
    lede: "Founded by Oscar Nobre and based in Leinfelden-Echterdingen near Stuttgart. We advise mid-sized companies on sales and deliver training and coaching — with a team of experienced trainers and consultants.",
    fakten: ["Founded 2002", "Leinfelden-Echterdingen", "HRB 25154 · Stuttgart Local Court", "Certified training provider"],
    oscarRolle: "Founder & Managing Director, Trainer & Coach",
    oscarText: "Your dedicated contact — from the first consultation to the successful completion of the training.",
    zertTitel: "Certifications & approvals",
    zert: [
      <><strong>AZAV-certified</strong> — the precondition for an education voucher to be redeemable with us at all.</>,
      <><strong>ISO 9001:2015</strong> certified quality management.</>,
      <>Listed in the <strong>go-digital</strong> funding programme.</>,
      <>Approved for <strong>ESF consulting</strong> (L-Bank Baden-Württemberg).</>,
    ],
    fussnote: "How we teach and who will stand in front of your employees is on the next slide.",
  },

  dozenten: {
    h2: "Approval decides the funding — the trainers decide the result.",
    lede: "An education voucher is quickly applied for. Whether your employees can really do something new afterwards depends on who teaches and how the course is built.",
    proofTitel: "Only professionals teach with us.",
    proofLede: "No juniors, no student assistants, no reading off slides. Every course is taught by experts who practise the subject in their own work — and who support your participants throughout the entire programme.",
    proof: [
      ["Practitioners, not theorists", "Our trainers work in the very field they teach."],
      ["Years of professional experience", "Selected for proven expertise, not availability."],
      ["Live training, not video courses", "Lessons with real trainers in the digital classroom."],
      ["Support, not hand-off", "Transfer tasks and progress checks are supervised personally."],
    ],
    stimmenTitel: "What our clients say",
    karten: [
      ["Digital classroom", "Learn from anywhere without travel time — your employees stay reachable at work."],
      ["Alongside the job", "Around 15 hours a week, planned around day-to-day business rather than against it."],
      ["Practical transfer", "Transfer tasks bring the knowledge straight into your processes — worked on using your own company."],
    ],
  },

  ausgangslage: {
    h2: "Mid-sized companies are under pressure to transform.",
    lede: "Skills shortages, AI, cyber security and new sales skills meet a daily business that leaves little time or budget for training. This is exactly the gap the education voucher closes.",
    karten: [
      ["Skills shortage", "Vacancies stay open for months — knowledge is missing where it's needed."],
      ["Digital change", "AI and automation demand skills the team doesn't have yet."],
      ["Time & budget pressure", "Day-to-day business leaves little room for strategic upskilling."],
    ],
    nutzenTitel: "What training your existing staff achieves",
    nutzen: [
      <><strong>Competitiveness</strong> — skilled teams respond faster to market changes.</>,
      <><strong>Employee retention</strong> — development prospects are the strongest lever against staff turnover.</>,
      <><strong>Cost advantage</strong> — upskilling existing employees is up to 6× cheaper than hiring new ones.</>,
    ],
    schluss: [
      "The good news: you don't have to close this gap out of your own pocket.",
      "Companies that upskill their employees now secure a head start — and the state covers a large share of the costs. Let's check together how much of that applies to your company.",
    ],
  },

  gutschein: {
    h2: "Upskill your employees — with as little as €0 own contribution.",
    lede: "The education voucher (Bildungsgutschein) is a funding instrument of the Federal Employment Agency (Agentur für Arbeit). It finances vocational training for your employees — depending on company size up to the full cost, plus a subsidy towards wage costs during the training.",
    karten: [
      ["Reduce costs", "The state finances a large share of the training costs — in many cases all of it."],
      ["Certified learning", "AZAV-approved courses with a certified training provider — online in the digital classroom."],
      ["Support included", "Seminarkontor GmbH handles application support and coordination with the Employment Agency."],
    ],
    schluss: [
      "From here it gets concrete:",
      "Over the next few minutes we'll check your funding situation step by step. On the right, under “Our agenda”, we record every result — the basis for the survey form.",
    ],
  },

  quote: {
    h2: "How big is your company?",
    lede: "The funding rate depends on company size. For small and medium-sized companies, the full cost can be covered.",
    groessen: { klein: "Up to 50 employees", mittel: "50 – 499 employees", gross: "Over 500 employees" },
    kopf: ["Company size", "Training costs", "Wage subsidy"],
    zeilen: {
      klein: "Small/medium-sized companies (up to 50 employees)",
      mittel: "Larger companies (50 – 499 employees)",
      gross: "Large enterprises (over 500 employees)",
    },
    figs: ["of the training costs are covered", "subsidy towards wage costs during the training", "own contribution to course costs"],
    schluss: [
      "The legal basis for the funding is § 82 SGB III (Qualifizierungschancengesetz — Skills Development Opportunities Act).",
      "The Federal Employment Agency confirms the binding funding rate case by case — we check it together with you before applying.",
    ],
  },

  voraus: {
    h2: "Do your employees meet the requirements?",
    lede: "Three criteria decide. Click whatever applies to your workforce — we check it live.",
    kriterien: [
      ["std", "Employed at least 20 hours per week", "Part-time from 20 h/week is sufficient."],
      ["abschluss", "Vocational qualification or degree completed at least 2 calendar years ago", "Counted from the year of completion."],
      ["sv", "Employment subject to social insurance contributions", "Mini-jobs and managing directors not subject to social insurance are excluded."],
    ],
    urteil: (n: number) =>
      n === 3
        ? "All three requirements are met — applying for an education voucher is possible. Next step: the survey form."
        : n > 0
          ? n + " of 3 criteria met. Even if you're unsure, the review is worth it — we clarify individual cases directly with the Employment Agency."
          : "Select the points that apply.",
    schluss: [
      "If you're unsure about an individual case, we clarify the requirements directly with the Employment Agency.",
      "It costs you nothing and is quicker than leaving the question open.",
    ],
  },

  kontingent: {
    h2: "How many education vouchers are realistic for you?",
    lede: "The Employment Agency doesn't fund the entire workforce at once. A simple rule of thumb gives you a guide — enter your number of employees.",
    kartenTitel: "How many vouchers are realistic?",
    regel: <>The Employment Agency's rule of thumb: <strong>1 education voucher per 3 employees.</strong></>,
    maLabel: "Employees in the company",
    maPlatzhalter: "e.g. 30",
    figK: "education vouchers are a realistic guide for a workforce of this size",
    empfK: "Our recommendation",
    empf: (
      <>
        Regardless of how many vouchers would be possible in principle, we recommend starting with{" "}
        <strong>two participants</strong>. That way the process gets off to a clean start, you can test how it works in
        your company, and then extend it to more employees.
      </>
    ),
    fussnote: "The rule of thumb is a guide, not a fixed limit. What counts is the Employment Agency's review of your individual case.",
  },

  weiterbildungen: {
    h2: "Which skills is your team missing?",
    lede: "AZAV-certified, 100% online in the digital classroom: 500 teaching units over 6 months at around 11 to 15 hours per week. Hands-on live training with experienced trainers, complemented by transfer tasks, supervised study phases and regular progress checks.",
    azav: [
      "Approved by GUTcert GmbH, accredited by DAkkS (German national accreditation body). Field: vocational training measures under SGB III. Without this approval, no education voucher could be redeemed here.",
      "Approval period 11/05/2023 – 10/05/2028",
    ],
    iso: [
      "Quality management system, inspected and audited annually by DEKRA Certification GmbH, Stuttgart.",
      "Reg. no. 91018614/2 · valid until 14/10/2027",
    ],
  },

  ersparnis: {
    h2: "What does this mean for your budget?",
    lede: "Adjust the values to your situation — the funding is calculated live.",
    kosten: "Course costs per participant (€)",
    gehalt: "Gross monthly salary (€)",
    tn: "Participants",
    monate: "Duration (months)",
    stunden: "Training (hrs/month)",
    regel: "Regular working time (hrs/month)",
    manuell: "set manually",
    ausKontingent: (ma: number) => "taken from your quota (" + ma + " employees)",
    figGesamt: "Total funding over the full duration",
    figEigen: "Own contribution to course costs",
    aufschluesselung: "How the funding is made up",
    zeilen: {
      kosten: "Course costs per participant",
      kursFoerder: (p: string) => "of which funded (" + p + ")",
      stundenlohn: "Hourly wage (gross)",
      lohnGesamt: (m: number) => "Wage costs of training hours over " + m + " months",
      lohnFoerder: (p: string) => "of which subsidised (" + p + ")",
      lohnProMonat: "Wage subsidy per month",
      jeTn: "Funding per participant",
      gesamt: (n: number) => "Total funding for " + n + (n === 1 ? " participant" : " participants"),
    },
    keineGroesse: "Company size not selected yet",
    fussnote: "Select your company size in the “Funding rate” section so the calculation can apply. The wage subsidy is applied to the share of gross salary attributable to training hours. All figures are a non-binding guide — the binding approval comes from the Federal Employment Agency.",
  },

  ablauf: {
    h2: "Seven steps to the start — we handle the coordination.",
    lede: "Typical processing time: 3 – 6 weeks until the training starts.",
    schritte: [
      ["Consultation & choosing courses", "Exactly what we're doing together today."],
      ["Agree with participants & request the survey form", "Your next step — this is where we start together."],
      ["Fill in the survey form together", "In a joint appointment we go through the form field by field — book it directly in the calendar."],
      ["Submit the survey form & training offer", "We prepare the documents for the Employment Agency."],
      ["Review by the Employment Agency", "We handle follow-up questions and keep the process moving."],
      ["Education voucher is issued", "You receive the funding approval in writing."],
      ["Training starts", "Digital classroom, live training with trainers, expert support."],
    ],
    todoTitel: "What you need to do",
    todo: [
      "Identify suitable employees internally.",
      "Book an appointment with Oscar Nobre.",
      "Fill in the survey form together — we take care of the rest.",
    ],
    tnTitel: "Choose participants internally",
    tnText: (n: number) =>
      "Based on your calculation, that's " + n + (n === 1 ? " person" : " people") + ". We need to know exactly who will be trained for the application.",
    anzahl: "Number of people",
    anzahlHinweis: "from “Your savings” — change it there",
    spalten: ["First name", "Last name", "Training", "Current position"],
    positionPlatzhalter: "e.g. Sales support",
    aria: {
      vorname: (i: number) => "First name, person " + i,
      name: (i: number) => "Last name, person " + i,
      kurs: (i: number) => "Training, person " + i,
      position: (i: number) => "Current position, person " + i,
    },
    hinweis: "Not everything has to be settled now — we'll fill in the rest at our joint appointment.",
  },

  angaben: {
    h2: "Your details and the matching training offers.",
    lede: "The Employer Service needs these details for the survey form — and we need them to find the right course. Anything not yet decided can simply stay open.",
    formTitel: "Your details for the survey form",
    felder: {
      firma: ["Company", "Company name"],
      name: ["Contact person", "First and last name"],
      rolle: ["Role in the company", "e.g. Management, HR"],
      branche: ["Industry", "e.g. Mechanical engineering"],
      mail: ["Contact person's email", "name@company.com"],
      telefon: ["Phone number", "+49 …"],
      strasse: ["Street and number", "Street no."],
      plz: ["Postcode", "Postcode"],
      ort: ["City", "City"],
    },
    formNotiz: "These details appear in the checklist and the summary — you won't need to give them again.",
    pflicht: "Required",
    auswahlTitel: "Your selection",
    auswahlHinweis: "Click one or more training offers on the right — title, description and documents will appear here.",
    angebotOeffnen: "Open training offer",
    kursseite: "Course page",
    ue: "TU",
    massnNr: "Measure no.",
    alleUnterlagen: "Open all documents",
    anbieterNr: "Provider no. (BA)",
    alleNotiz: "all courses AZAV-approved and digital",
    listeTitel: "Matching training offers",
    listeText: "Select the courses that fit. Offers marked “Suggested” match your programme selection — the final choice is yours. Your selection, with descriptions and documents, goes into the summary.",
    vorschlag: "Suggested",
  },

  anfordern: {
    h2: "Request the survey form — no obligation, filled in within minutes.",
    ledeStark: "Let's take the next step together right now.",
    ledeVor: " The best way to request the survey form (Erhebungsbogen) for the funded training is together, right away, via the ",
    ledeLink: "Federal Employment Agency's online enquiry",
    telK: "By phone · free of charge",
    telS: "Central Employer Service of the Federal Employment Agency",
    webK: "Online",
    webV: "Contact form",
    webS: "Company enquiry with the Employer Service — web.arbeitsagentur.de (in German)",
    bereitTitel: "Have this ready for the request",
    bereitText: "Everything we've just entered together — to read out on the phone or to fill in online.",
    nachrichtTitel: "Message for the contact form",
    nachrichtText: "Copied automatically when you click “online enquiry” or “Contact form” — paste it into the “Nachricht” (message) field with Ctrl + V. The message is in German because the Employment Agency's form is German.",
    nachrichtUebersetzung:
      "Translation: Dear Sir or Madam, we are planning to train in-house employees using education vouchers. Please send us the survey form and any other information and documents you need from us. Many thanks for your support.",
    kopieren: "Copy message",
    zeilen: {
      firma: "Company",
      anschrift: "Address",
      person: "Contact person",
      telefon: "Phone",
      mail: "Email",
      ma: "Employees",
      tn: "Planned participants",
      kurs: "Training",
      traeger: "Training provider",
    },
  },

  zusammenfassung: {
    h2: "Your summary — and what happens next.",
    lede: "Everything from our conversation at a glance — you'll also receive this summary by email afterwards.",
    titel: "Summary of our conversation",
    zeilen: {
      firma: "Company",
      person: "Contact person",
      branche: "Industry",
      exp: "Prior experience with education vouchers",
      groesse: "Company size",
      kurs: "Funding rate for training costs",
      lohn: "Funding rate for wage costs",
      req: "Requirements checked",
      reqWert: (n: number) => n + " of 3",
      ma: "Employees in the company",
      gutscheine: "Possible education vouchers",
      progs: "Selected training programmes",
      tn: "Participants in the calculation",
      lohnMonatTn: "Wage subsidy per month and participant",
      lohnMonat: "Total wage subsidy per month",
      gesamt: "Estimated total funding",
    },
    weiterTitel: "What happens next",
    weiter: [
      ["Wait for the survey form", "The Employment Agency's survey form should usually reach you within the next 3–5 days. That puts the first formal step in motion."],
      ["Agree on participants internally", "Use the next few days to talk internally with possible participants. Consider together: for whom does the training make sense professionally, and where will your company benefit most?"],
      ["Appointment with your training advisor", "As soon as the survey form arrives, we take the next step together with your training advisor. In the appointment we fill in the documents together, clear up open questions and prepare everything so the application can be submitted complete and correct."],
    ],
    fazit: "That gives you a clear roadmap: receive the documents, choose participants, submit the application together.",
    beraterTitel: "Your training advisor",
    buchen: "Book an appointment online",
    adresse: "Markomannenstraße 11 · 70771 Leinfelden-Echterdingen, Germany",
  },

  absenden: {
    titel: "Submit your details",
    text: "Submitting sends all details from this conversation to Seminarkontor — as the basis for the survey form and our joint appointment.",
    knopf: "Submit",
    sendet: "Sending …",
    gesendet: "Submitted ✓",
    csv: "Download as CSV",
    ok: "Thank you — your details have been submitted.",
    fehler: "Submission didn't go through. Please try again or download the CSV.",
    fehlt: (felder: string[]) => "Please fill in: " + felder.join(", ") + ".",
    mailUngueltig: "Please enter a valid email address.",
  },

  agenda: {
    titel: "Our agenda",
    fuer: "for ",
    groesse: "Company size",
    satz: "Funding rate",
    satzWert: (k: string, l: string) => k + " course costs · " + l + " wage costs",
    req: "Requirements",
    reqAlle: "All 3 met",
    reqTeil: (n: number) => n + " of 3 checked",
    gutscheine: "Possible vouchers",
    gutscheineWert: (g: number, ma: number) => g + (g === 1 ? " voucher" : " vouchers") + " (for " + ma + " employees)",
    progs: "Selected training programmes",
    foerderung: "Estimated funding",
  },
};

export const TEXTE: Record<Lang, Texte> = { de, en };
