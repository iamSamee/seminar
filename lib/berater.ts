/* Bildungsberater — nur serverseitig importieren (enthält die E-Mail-Adressen).

   Jede Beraterin / jeder Berater hat einen eigenen Link zur Konsole:
     https://<domain>/?berater=<id>
   Leads aus diesem Link gehen ausschließlich an die hinterlegte E-Mail.
   Ohne oder mit unbekannter ID gilt der erste Eintrag der Liste.

   Neue Person hinzufügen: Eintrag unten ergänzen, neu bauen, fertig.
   "foto" ist optional (Datei in public/), "kalender" ist der Buchungslink. */

export type Berater = {
  id: string;
  name: string;
  email: string;
  kalender: string;
  foto?: string;
};

export const BERATER: Berater[] = [
  {
    id: "on",
    name: "Oscar Nobre",
    email: "on@seminarkontor.com",
    kalender: "https://calendly.com/on--1/besprechung",
    foto: "/oscar.jpg",
  },
  /* Beispiel:
  {
    id: "mm",
    name: "Max Mustermann",
    email: "mm@seminarkontor.com",
    kalender: "https://calendly.com/…",
  },
  */
];

/* Was der Browser erfahren darf — ohne E-Mail-Adresse */
export type BeraterOeffentlich = Omit<Berater, "email">;

export function findeBerater(id?: string | null): Berater {
  const gesucht = (id ?? "").trim().toLowerCase();
  return BERATER.find((b) => b.id === gesucht) ?? BERATER[0];
}

export function oeffentlich({ email: _email, ...rest }: Berater): BeraterOeffentlich {
  return rest;
}
