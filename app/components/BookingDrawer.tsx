"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type BookingForm = {
  pack: string;
  vehicleModel: string;
  phone: string;
  address: string;
  houseNumber: string;
  date: string;
  timeSlot: string;
  timeSlotLabel: string;
  notes: string;
};

type AddressSuggestion = {
  id: string;
  label: string;
  lat: number;
  lon: number;
  distanceKm: number;
  inZone: boolean;
};

type AvailabilitySlot = {
  start: string;
  end: string;
  label: string;
};

type AvailabilityDay = {
  date: string;
  label: string;
  slots: AvailabilitySlot[];
};

const initialForm: BookingForm = {
  pack: "",
  vehicleModel: "",
  phone: "",
  address: "",
  houseNumber: "",
  date: "",
  timeSlot: "",
  timeSlotLabel: "",
  notes: "",
};

const packOptions = [
  {
    name: "Pack Essentiel",
    description: "Entretien régulier pour garder un véhicule propre au quotidien.",
    duration: "1h - 1h30",
    details: [
      "Aspiration intérieure légère",
      "Lavage extérieur complet à la main",
      "Nettoyage des jantes et pneus",
      "Séchage manuel",
      "Vitres intérieures et extérieures",
    ],
    note: "Recommandé pour un entretien mensuel ou bimensuel.",
  },
  {
    name: "Pack Confort",
    description: "Nettoyage complet intérieur/extérieur avec finitions soignées.",
    duration: "2h - 2h30",
    details: [
      "Aspiration intérieure complète",
      "Nettoyage des plastiques intérieurs",
      "Lavage extérieur complet à la main",
      "Vitres intérieures et extérieures",
      "Désinfection légère de l'habitacle",
      "Parfum intérieur",
      "Traitement lustrant carrosserie",
    ],
    note: "Le meilleur équilibre entre résultat et budget.",
  },
  {
    name: "Pack Premium",
    description: "Remise en état approfondie et finitions haut de gamme.",
    duration: "3h - 4h",
    details: [
      "Toutes les prestations du Pack Confort",
      "Shampoing des sièges et tapis",
      "Nettoyage approfondi des plastiques",
      "Aération complète de l'habitacle",
      "Traitement protecteur plastiques ou cuir",
    ],
    note: "Idéal avant une vente ou après une période sans entretien.",
  },
];

export default function BookingDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [availabilityDays, setAvailabilityDays] = useState<AvailabilityDay[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [expandedPack, setExpandedPack] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const trigger = target.closest("[data-open-booking]");
      if (!trigger) return;
      event.preventDefault();
      setIsOpen(true);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("booking-open", isOpen);
    return () => document.body.classList.remove("booking-open");
  }, [isOpen]);

  const canGoNext = useMemo(() => {
    if (step === 0) return Boolean(form.pack && form.vehicleModel.trim());
    if (step === 1) {
      return Boolean(
        form.phone.trim() &&
          form.address.trim() &&
          form.houseNumber.trim() &&
          selectedAddress
      );
    }
    if (step === 2) return Boolean(form.date && form.timeSlot);
    return true;
  }, [form, step]);

  const closeDrawer = () => {
    setIsOpen(false);
    setStep(0);
    setForm(initialForm);
    setAddressSuggestions([]);
    setSelectedAddress(null);
    setShowSuggestions(false);
    setAvailabilityDays([]);
    setAvailabilityLoading(false);
    setAvailabilityError("");
    setExpandedPack(null);
    setBookingLoading(false);
    setBookingError("");
    setBookingSuccess("");
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < 3) {
      if (canGoNext) {
        setBookingError("");
        setStep((prev) => prev + 1);
      }
      return;
    }

    setBookingLoading(true);
    setBookingError("");
    try {
      const response = await fetch("/api/booking-reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = (await response.json()) as { ok?: boolean; message?: string; error?: string };
      if (!response.ok || !data.ok) {
        setBookingError(data.error || "Impossible de confirmer la réservation.");
        return;
      }

      setBookingSuccess(data.message || "Réservation enregistrée.");
    } catch {
      setBookingError("Impossible de confirmer la réservation.");
    } finally {
      setBookingLoading(false);
    }
  };

  const updateField = <K extends keyof BookingForm>(field: K, value: BookingForm[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!isOpen || step !== 2 || !form.pack) return;

    const controller = new AbortController();

    const loadAvailability = async () => {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      try {
        const response = await fetch(
          `/api/booking-availability?pack=${encodeURIComponent(form.pack)}`,
          { signal: controller.signal }
        );
        const data = (await response.json()) as {
          days?: AvailabilityDay[];
          error?: string;
        };

        if (!response.ok) {
          setAvailabilityDays([]);
          setAvailabilityError(data.error || "Impossible de charger les disponibilites.");
          return;
        }

        const days = data.days || [];
        setAvailabilityDays(days);

        const selectedDay = days.find((day) => day.date === form.date);
        const slotStillAvailable = selectedDay?.slots.some(
          (slot) => slot.start === form.timeSlot
        );

        if (!selectedDay || !slotStillAvailable) {
          setForm((prev) => ({
            ...prev,
            date: "",
            timeSlot: "",
            timeSlotLabel: "",
          }));
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setAvailabilityDays([]);
        setAvailabilityError("Impossible de charger les disponibilites.");
      } finally {
        setAvailabilityLoading(false);
      }
    };

    loadAvailability();

    return () => controller.abort();
  }, [form.pack, isOpen, step]);

  const selectedDay = useMemo(
    () => availabilityDays.find((day) => day.date === form.date) ?? null,
    [availabilityDays, form.date]
  );

  useEffect(() => {
    if (!isOpen || step !== 1) return;

    const query = form.address.trim();
    if (query.length < 3) {
      setAddressSuggestions([]);
      setIsSuggestLoading(false);
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      setIsSuggestLoading(true);
      try {
        const response = await fetch(`/api/address-suggest?q=${encodeURIComponent(query)}`);
        const data = (await response.json()) as { suggestions?: AddressSuggestion[] };
        setAddressSuggestions(data.suggestions || []);
      } catch {
        setAddressSuggestions([]);
      } finally {
        setIsSuggestLoading(false);
      }
    }, 250);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [form.address, isOpen, step]);

  useEffect(() => {
    if (!isOpen || step !== 0 || !expandedPack) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const item = target.closest<HTMLElement>(".booking-pack-item");
      const packName = item?.dataset.packName;
      if (packName !== expandedPack) {
        setExpandedPack(null);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [expandedPack, isOpen, step]);

  return (
    <>
      <div
        className={`booking-overlay${isOpen ? " is-open" : ""}`}
        onClick={closeDrawer}
        aria-hidden={!isOpen}
      />

      <aside
        className={`booking-panel${isOpen ? " is-open" : ""}`}
        aria-hidden={!isOpen}
        aria-label="Formulaire de réservation"
      >
        <div className="booking-panel__header">
          <button
            type="button"
            className="booking-back-top"
            onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
            disabled={step === 0}
            aria-label="Étape précédente"
          >
            ←
          </button>

          <div>
            <p className="eyebrow">Réservation</p>
            <h3>Prendre rendez-vous</h3>
          </div>
          <button type="button" className="booking-close" onClick={closeDrawer}>
            Fermer
          </button>
        </div>

        <div className="booking-steps" aria-hidden>
          {["Service", "Contact", "Créneau", "Validation"].map((label, index) => (
            <div key={label} className={`booking-step${index <= step ? " is-active" : ""}`}>
              <span>{index + 1}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>

        <form className="booking-form" onSubmit={onSubmit}>
          {step === 0 && (
            <div className="booking-fields">
              <label>
                Modèle du véhicule
                <input
                  type="text"
                  placeholder="Ex: BMW Série 3"
                  value={form.vehicleModel}
                  onChange={(e) => updateField("vehicleModel", e.target.value)}
                />
              </label>

              <div className="booking-pack-group">
                <span>Choix du pack</span>
                <div className="booking-pack-grid">
                  {packOptions.map((pack) => {
                    const isSelected = form.pack === pack.name;
                    const isExpanded = expandedPack === pack.name;
                    return (
                      <div
                        key={pack.name}
                        className={`booking-pack-item${isSelected ? " is-selected" : ""}`}
                        data-pack-name={pack.name}
                      >
                        <button
                          type="button"
                          className={`booking-pack-card${isSelected ? " is-selected" : ""}`}
                          onClick={() => {
                            setExpandedPack((prev) =>
                              prev && prev !== pack.name ? null : prev
                            );
                            setForm((prev) => ({
                              ...prev,
                              pack: pack.name,
                              date: "",
                              timeSlot: "",
                              timeSlotLabel: "",
                            }));
                          }}
                        >
                          <strong>{pack.name}</strong>
                          <p>{pack.description}</p>
                          <small>Durée: {pack.duration}</small>
                        </button>

                        <button
                          type="button"
                          className={`booking-pack-more${isExpanded ? " is-open" : ""}`}
                          onClick={() =>
                            setExpandedPack((prev) => (prev === pack.name ? null : pack.name))
                          }
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? "− Moins d'info" : "+ d'info"}
                        </button>

                        <div
                          className={`booking-pack-details${isExpanded ? " is-open" : ""}`}
                          aria-hidden={!isExpanded}
                        >
                          <ul>
                            {pack.details.map((item) => (
                              <li key={item}>{item}</li>
                            ))}
                          </ul>
                          <p>{pack.note}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="booking-fields">
              <label>
                Téléphone
                <input
                  type="tel"
                  placeholder="+32 ..."
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </label>

              <label>
                Adresse de la prestation
                <div className="booking-address-wrap">
                  <input
                    type="text"
                    placeholder="Rue, numéro, code postal, ville"
                    value={form.address}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      window.setTimeout(() => setShowSuggestions(false), 120);
                    }}
                    onChange={(e) => {
                      updateField("address", e.target.value);
                      setSelectedAddress(null);
                    }}
                  />

                  {showSuggestions && (isSuggestLoading || addressSuggestions.length > 0) && (
                    <div className="booking-address-list">
                      {isSuggestLoading && (
                        <button type="button" className="booking-address-item" disabled>
                          Recherche d'adresses...
                        </button>
                      )}
                      {!isSuggestLoading &&
                        addressSuggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="booking-address-item"
                            onClick={() => {
                              updateField("address", item.label);
                              setSelectedAddress(item);
                              setShowSuggestions(false);
                            }}
                          >
                            {item.label}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </label>

              <label>
                Numéro de maison
                <input
                  type="text"
                  placeholder="Ex: 12A"
                  value={form.houseNumber}
                  onChange={(e) => updateField("houseNumber", e.target.value)}
                />
              </label>

              {selectedAddress && (
                <div
                  className={`booking-zone-status${
                    selectedAddress.inZone ? " is-in-zone" : " is-out-zone"
                  }`}
                >
                  {selectedAddress.inZone
                    ? `Dans la zone (${selectedAddress.distanceKm} km) - pas de supplément`
                    : `Hors zone (${selectedAddress.distanceKm} km) - supplément demandé`}
                </div>
              )}

              {!selectedAddress && form.address.trim().length >= 3 && (
                <div className="booking-zone-warning">
                  Sélectionne une adresse proposée pour valider la zone d'intervention.
                </div>
              )}

              <label>
                Informations complémentaires (optionnel)
                <textarea
                  placeholder="Accès, étage, remarques..."
                  rows={4}
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                />
              </label>
            </div>
          )}

          {step === 2 && (
            <div className="booking-fields">
              <div className="booking-calendar">
                <div className="booking-calendar-days">
                  <div className="booking-calendar-title">Dates disponibles</div>

                  {availabilityLoading && (
                    <div className="booking-calendar-empty">
                      Chargement des disponibilites...
                    </div>
                  )}

                  {!availabilityLoading && availabilityError && (
                    <div className="booking-calendar-empty">{availabilityError}</div>
                  )}

                  {!availabilityLoading &&
                    !availabilityError &&
                    availabilityDays.length === 0 && (
                      <div className="booking-calendar-empty">
                        Aucun creneau disponible pour ce pack.
                      </div>
                    )}

                  {!availabilityLoading &&
                    !availabilityError &&
                    availabilityDays.map((day) => (
                      <button
                        key={day.date}
                        type="button"
                        className={`booking-day-item${
                          form.date === day.date ? " is-selected" : ""
                        }`}
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            date: day.date,
                            timeSlot: "",
                            timeSlotLabel: "",
                          }))
                        }
                      >
                        <span>{day.label}</span>
                        <small>{day.slots.length} creneaux</small>
                      </button>
                    ))}
                </div>

                <div className="booking-calendar-slots">
                  <div className="booking-calendar-title">Heures disponibles</div>

                  {!form.date && (
                    <div className="booking-calendar-empty">
                      Selectionne d'abord une date.
                    </div>
                  )}

                  {form.date && selectedDay && (
                    <div className="booking-slots-grid">
                      {selectedDay.slots.map((slot) => (
                        <button
                          key={slot.start}
                          type="button"
                          className={`booking-slot-item${
                            form.timeSlot === slot.start ? " is-selected" : ""
                          }`}
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              timeSlot: slot.start,
                              timeSlotLabel: slot.label,
                            }))
                          }
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="booking-note">
                Seuls les créneaux actuellement libres dans Google Agenda sont proposés.
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="booking-fields booking-summary">
              <h4>Résumé de la demande</h4>
              <p>
                <strong>Pack:</strong> {form.pack}
              </p>
              <p>
                <strong>Véhicule:</strong> {form.vehicleModel}
              </p>
              <p>
                <strong>Téléphone:</strong> {form.phone}
              </p>
              <p>
                <strong>Adresse:</strong> {form.address}
              </p>
              <p>
                <strong>Numéro:</strong> {form.houseNumber}
              </p>
              <p>
                <strong>Créneau:</strong> {form.date} - {form.timeSlotLabel || form.timeSlot}
              </p>
              {bookingError && <p className="booking-success">{bookingError}</p>}
              {bookingSuccess && <p className="booking-success">{bookingSuccess}</p>}
            </div>
          )}

          <div className="booking-actions">
            <button
              type="button"
              className="booking-btn booking-btn--ghost"
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
              disabled={step === 0 || bookingLoading}
            >
              Retour
            </button>

            <button
              type="submit"
              className="booking-btn"
              disabled={bookingLoading || Boolean(bookingSuccess) || (step < 3 && !canGoNext)}
            >
              {step < 3
                ? "Continuer"
                : bookingLoading
                  ? "Confirmation..."
                  : bookingSuccess
                    ? "Réservation envoyée"
                    : "Confirmer la réservation"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
