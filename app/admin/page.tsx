import type { Metadata } from "next";
import AdminEditor from "@/components/admin/AdminEditor";
import AdminLogin from "@/components/admin/AdminLogin";
import { adminAktiv, angemeldet } from "@/lib/admin-auth";
import { BERATER } from "@/lib/berater";
import { ANGEBOTE, PROGRAMME } from "@/lib/data";
import { flach, ladeAenderungen, standardInhalt, versionen } from "@/lib/inhalt-speicher";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin · Förderplan-Konsole", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!adminAktiv()) {
    return (
      <main className="adm-login">
        <div className="adm-karte">
          <h1>Admin-Bereich nicht eingerichtet</h1>
          <p>Bitte auf dem Server die Umgebungsvariable ADMIN_PASSWORD setzen (mindestens 8 Zeichen) und die App neu starten.</p>
        </div>
      </main>
    );
  }
  if (!(await angemeldet())) return <AdminLogin />;

  /* Anzeigenamen für IDs im Editor */
  const namen: Record<string, string> = {
    ...Object.fromEntries(PROGRAMME.map((p) => [p.id, p.titel])),
    ...Object.fromEntries(
      Object.values(ANGEBOTE)
        .flat()
        .map((a) => [a.id, a.titel])
    ),
    ...Object.fromEntries(BERATER.map((b) => ["berater_" + b.id, "Beraterfoto · " + b.name])),
  };

  return (
    <AdminEditor
      standard={flach(standardInhalt())}
      gespeichert={await ladeAenderungen()}
      versionenStart={await versionen()}
      namen={namen}
    />
  );
}
