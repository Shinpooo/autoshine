import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Réservation annulée",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReservationCancelPage() {
  return (
    <main className="page" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <section className="container" style={{ maxWidth: 740 }}>
        <p className="eyebrow">Paiement annule</p>
        <h1 className="section-title" style={{ marginTop: 10 }}>Aucun debit effectue</h1>
        <p className="section-subtitle" style={{ marginTop: 16 }}>
          Vous pouvez relancer la reservation a tout moment en cliquant sur
          &quot;Prendre rendez-vous&quot;.
        </p>
        <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn" href="/">
            Retour a l&apos;accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
