import Link from "next/link";

export default function ReservationCancelPage() {
  return (
    <main className="page" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <section className="container" style={{ maxWidth: 740 }}>
        <p className="eyebrow">Paiement annule</p>
        <h1 className="section-title" style={{ marginTop: 10 }}>Aucun debit effectue</h1>
        <p className="section-subtitle" style={{ marginTop: 16 }}>
          Vous pouvez relancer la reservation a tout moment en cliquant sur
          "Prendre rendez-vous".
        </p>
        <div style={{ marginTop: 28, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link className="btn" href="/">
            Retour a l'accueil
          </Link>
        </div>
      </section>
    </main>
  );
}
