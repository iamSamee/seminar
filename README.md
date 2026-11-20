# seminar

Förderplan-Konsole der Seminarkontor GmbH — interaktive Beratung zum Bildungsgutschein (Next.js).

- Konsole: `/` — je Bildungsberater ein eigener Link: `/?berater=<id>`

## Start

```bash
npm install
npm run extract-assets -- pfad/zu/foerderplan-konsole.artifact.html   # Bilder nach public/
npm run dev
```

## Formular-Einsendungen

Beim Absenden geht der Datensatz an `/api/submit`:

- **E-Mail:** an den Berater aus dem Link (`?berater=<id>`), Liste in `lib/berater.ts`.
  Versand über Microsoft Graph (`GRAPH_*`) oder SMTP (`SMTP_*`), Absender `MAIL_FROM`.
  Ohne/mit unbekannter ID geht der Lead an den ersten Eintrag der Liste.
- **Webhook:** JSON-POST an `WEBHOOK_URL`
- **CSV:** neue Zeile in `data/submissions.csv` (oder `SUBMISSIONS_CSV_PATH`)
- **CSV-Download:** `/api/submissions?key=<EXPORT_KEY>`

Variablen siehe `.env.example`.

## Neuen Bildungsberater hinzufügen

1. In `lib/berater.ts` einen Eintrag ergänzen (`id`, `name`, `email`, `kalender`, optional `foto`).
2. Neu bauen und deployen.
3. Der Berater nutzt ab dann seinen Link `https://<domain>/?berater=<id>` und erhält nur die Leads aus diesem Link.

## Admin-Bereich

Unter `/admin` (Passwort: `ADMIN_PASSWORD`) lassen sich alle Texte und Bilder ändern — sofort online, ohne Neubau.

- Standardtexte: `lib/texte-standard.ts`, Kursbeschreibungen in `lib/data.ts`
- Änderungen: `data/inhalt/aenderungen.json` (nur abweichende Felder), Sicherungen in `data/inhalt/versionen/`, Bilder in `data/inhalt/bilder/`
- `data/` ist nicht im Repository — ein Deploy überschreibt die Änderungen nicht. Für ein Backup diesen Ordner sichern.
- Schreibweisen in Texten: `**fett**`, Platzhalter `{n}`, Einzahl/Mehrzahl `{n:Person|Personen}`
- Technische Inhalte (Maßnahmen-Nr., Preise, UE, Fördersätze, amtliche Kurstitel, Berater) bleiben im Code.
- Neuer Text im Code? Einfach in `lib/texte-standard.ts` ergänzen — er erscheint automatisch im Admin-Bereich.
