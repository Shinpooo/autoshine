import Link from "next/link";

export default function ReservationSuccessPage() {
  return (
    <main className="page" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <section className="container" style={{ maxWidth: 740 }}>
        <p className="eyebrow">Paiement confirme</p>
        <h1 className="section-title" style={{ marginTop: 10 }}>Reservation validee</h1>
        <p className="section-subtitle" style={{ marginTop: 16 }}>
          Merci. Votre acompte a ete recu et votre demande est confirmee.
          La reservation est ajoutee a notre agenda automatiquement.
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
