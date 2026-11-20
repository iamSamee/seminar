/* Alle sichtbaren Texte der Konsole. */
import type { ReactNode } from "react";
import type { Exp, SlideId, Size } from "@/lib/data";

type Req = "std" | "abschluss" | "sv";
type Paar = [string, string];

const de = {
  locale: "de-DE",
  pctSuffix: " %",
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
  tnHinweis: "aus „Ihr Kontingent“ — dort ändern",
  tnHinweisLeer: "Mitarbeiterzahl unter „Ihr Kontingent“ eintragen",
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
    regel: <>Faustregel der Arbeitsagentur: <strong>1 Bildungsgutschein pro 5 Vollzeit-Mitarbeitende.</strong></>,
    maLabel: "Vollzeit-Mitarbeitende im Unternehmen",
    maPlatzhalter: "z. B. 30",
    figK: "Bildungsgutscheine sind bei dieser Belegschaftsgröße als Orientierung realistisch",
    bgsLabel: "Bildungsgutscheine (anpassbar)",
    bgsVorschlag: (n: number) => "Vorschlag nach Faustregel: " + n,
    bgsUebernehmen: (n: number) => "Vorschlag (" + n + ") übernehmen",
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
    lede: "AZAV-zertifiziert, 100 % online im digitalen Klassenzimmer: 400 bis 820 Unterrichtseinheiten in 26 bis 34 Wochen bei rund 11 bis 15 Stunden pro Woche. Praxisnahes Live-Training mit erfahrenen Dozenten, ergänzt durch Transferaufgaben, betreute Lernphasen und regelmäßige Lernzielkontrollen.",
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
    kostenHinweis: "aus der gewählten Weiterbildung — hier anpassbar",
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
      () => "Intern geeignete Mitarbeitende identifizieren.",
      (berater: string) => "Termin mit " + berater + " vereinbaren.",
      () => "Erhebungsbogen gemeinsam ausfüllen — den Rest übernehmen wir.",
    ] as ((berater: string) => string)[],
    tnTitel: "Teilnehmende intern festlegen",
    tnText: (n: number) =>
      "Nach Ihrer Rechnung sind das " + n + (n === 1 ? " Person" : " Personen") + ". Wer genau qualifiziert werden soll, brauchen wir für die Antragstellung.",
    anzahl: "Anzahl Personen",
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
    wochen: "Wochen",
    jeTn: "je Teilnehmer",
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

export const TEXTE = de;
export type Texte = typeof de;
