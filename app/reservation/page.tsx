import type { Metadata } from "next";
import BookingDrawer from "@/app/components/BookingDrawer";

export const metadata: Metadata = {
  title: "Réservation detailing à domicile",
  description:
    "Réservez un nettoyage ou detailing automobile à domicile avec LN AutoShine dans un rayon de 20 km autour de Huy.",
  alternates: {
    canonical: "/reservation",
  },
};

export default function ReservationPage() {
  return (
    <main className="booking-page">
      <BookingDrawer standalone />
    </main>
  );
}
