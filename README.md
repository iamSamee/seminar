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
