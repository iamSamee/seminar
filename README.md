# seminar

Förderplan-Konsole der Seminarkontor GmbH — interaktive Beratung zum Bildungsgutschein (Next.js).

- Deutsch: `/`
- English: `/en`

## Start

```bash
npm install
npm run extract-assets -- pfad/zu/foerderplan-konsole.artifact.html   # Bilder nach public/
npm run dev
```

## Formular-Einsendungen

Beim Absenden geht der Datensatz an `/api/submit`:

- **Webhook:** JSON-POST an `WEBHOOK_URL`
- **CSV:** neue Zeile in `data/submissions.csv` (oder `SUBMISSIONS_CSV_PATH`)
- **CSV-Download:** `/api/submissions?key=<EXPORT_KEY>`

Variablen siehe `.env.example`.
