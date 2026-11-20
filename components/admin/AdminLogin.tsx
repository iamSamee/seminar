"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [passwort, setPasswort] = useState("");
  const [meldung, setMeldung] = useState("");
  const [laeuft, setLaeuft] = useState(false);

  const anmelden = async (e: React.FormEvent) => {
    e.preventDefault();
    setLaeuft(true);
    setMeldung("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passwort }),
    }).catch(() => null);
    if (res?.ok) {
      window.location.reload();
      return;
    }
    setLaeuft(false);
    setMeldung(
      res?.status === 429
        ? "Zu viele Versuche — bitte in 15 Minuten erneut versuchen."
        : res?.status === 401
          ? "Passwort ist nicht korrekt."
          : "Anmeldung nicht möglich. Bitte später erneut versuchen."
    );
  };

  return (
    <main className="adm-login">
      <form className="adm-karte" onSubmit={anmelden}>
        <h1>Admin-Bereich</h1>
        <p>Texte und Bilder der Förderplan-Konsole bearbeiten.</p>
        <label htmlFor="admPasswort">Passwort</label>
        <input
          id="admPasswort"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
        />
        <button className="adm-btn primaer" type="submit" disabled={laeuft || !passwort}>
          {laeuft ? "Anmelden …" : "Anmelden"}
        </button>
        {meldung && (
          <p className="adm-fehler" role="alert">
            {meldung}
          </p>
        )}
      </form>
    </main>
  );
}
