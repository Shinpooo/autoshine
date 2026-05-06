"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type BookingForm = {
  pack: string;
  vehicleModel: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
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
  addressLine1: string;
  addressLine2: string;
  houseNumber: string;
  street: string;
  postcode: string;
  city: string;
  lat: number;
  lon: number;
  distanceKm: number;
  inZone: boolean;
  confidence: number | null;
  matchType: string;
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
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
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
    price: "65 €",
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
    price: "99 €",
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
    price: "145 €",
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

const bookingSteps = ["Véhicule", "Créneau", "Contact", "Validation"];
const whatsappPhone = "32493084331";
const serviceZoneLabel = "15 km autour de Huy";

function createWhatsAppUrl(message: string) {
  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
}

type BookingDrawerProps = {
  standalone?: boolean;
};

export default function BookingDrawer({ standalone = false }: BookingDrawerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSuggestLoading, setIsSuggestLoading] = useState(false);
  const [addressSuggestError, setAddressSuggestError] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<AddressSuggestion | null>(null);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [availabilityDays, setAvailabilityDays] = useState<AvailabilityDay[]>([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [expandedPack, setExpandedPack] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");
  const debounceRef = useRef<number | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
  const isSelectedAddressInZone = Boolean(selectedAddress?.inZone);

  const sanitizePhone = (value: string) => {
    const stripped = value.replace(/[^\d+]/g, "");
    if (!stripped) return "";
    if (stripped.startsWith("+")) {
      return `+${stripped.slice(1).replace(/\+/g, "")}`;
    }
    return stripped.replace(/\+/g, "");
  };

  const findPackName = useCallback((value: string | null | undefined) => {
    return packOptions.find((pack) => pack.name === value)?.name || "";
  }, []);

  const applyPackSelection = useCallback((packName: string) => {
    setStep(0);
    setExpandedPack(null);
    setBookingError("");
    setBookingSuccess("");
    setForm((prev) => ({
      ...prev,
      pack: packName,
      date: "",
      timeSlot: "",
      timeSlotLabel: "",
    }));
  }, []);

  useEffect(() => {
    if (standalone) {
      setIsOpen(true);
      const params = new URLSearchParams(window.location.search);
      const packName = findPackName(params.get("pack"));
      if (packName) applyPackSelection(packName);
      return;
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const trigger = target.closest<HTMLElement>("[data-open-booking]");
      if (!trigger) return;
      event.preventDefault();

      const packName = findPackName(trigger.dataset.bookingPack);

      if (window.matchMedia("(max-width: 900px)").matches) {
        window.location.href = packName
          ? `/reservation?pack=${encodeURIComponent(packName)}`
          : "/reservation";
        return;
      }

      if (packName) applyPackSelection(packName);
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
  }, [applyPackSelection, findPackName, standalone]);

  useEffect(() => {
    if (standalone) return;
    document.body.classList.toggle("booking-open", isOpen);
    return () => document.body.classList.remove("booking-open");
  }, [isOpen, standalone]);

  const canGoNext = useMemo(() => {
    if (step === 0) return Boolean(form.pack && form.vehicleModel.trim());
    if (step === 1) return Boolean(form.date && form.timeSlot);
    if (step === 2) {
      return Boolean(
        form.firstName.trim() &&
          form.lastName.trim() &&
        form.phone.trim() &&
          form.email.trim() &&
          isEmailValid &&
          form.address.trim() &&
          form.houseNumber.trim() &&
          isSelectedAddressInZone
      );
    }
    return true;
  }, [form, isEmailValid, isSelectedAddressInZone, step]);

  const closeDrawer = () => {
    if (standalone) {
      router.push("/");
      return;
    }
    setIsOpen(false);
    setStep(0);
    setForm(initialForm);
    setAddressSuggestions([]);
    setAddressSuggestError("");
    setSelectedAddress(null);
    setAvailabilityDays([]);
    setAvailabilityLoading(false);
    setAvailabilityError("");
    setExpandedPack(null);
    setIsEmailFocused(false);
    setBookingLoading(false);
    setBookingError("");
    setBookingSuccess("");
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < bookingSteps.length - 1) {
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

  const clearAddress = () => {
    setForm((prev) => ({ ...prev, address: "", houseNumber: "" }));
    setSelectedAddress(null);
    setAddressSuggestions([]);
    setAddressSuggestError("");
    window.setTimeout(() => addressInputRef.current?.focus(), 0);
  };

  const selectAddress = (item: AddressSuggestion) => {
    setForm((prev) => ({
      ...prev,
      address: item.label,
      houseNumber: item.houseNumber || "",
    }));
    setSelectedAddress(item);
    setAddressSuggestions([]);
    setAddressSuggestError("");
    addressInputRef.current?.blur();
  };

  useEffect(() => {
    if (!isOpen || step !== 1 || !form.pack) return;

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

        setForm((prev) => {
          const selectedDay = days.find((day) => day.date === prev.date);
          const slotStillAvailable = selectedDay?.slots.some(
            (slot) => slot.start === prev.timeSlot
          );

          if (selectedDay && slotStillAvailable) return prev;

          return {
            ...prev,
            date: "",
            timeSlot: "",
            timeSlotLabel: "",
          };
        });
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
  const summarySlotLabel = selectedDay
    ? `${selectedDay.label} - ${form.timeSlotLabel || form.timeSlot}`
    : `${form.date} - ${form.timeSlotLabel || form.timeSlot}`;
  const packHelpWhatsAppUrl = createWhatsAppUrl(
    [
      "Bonjour LN AutoShine,",
      "J'aimerais avoir un conseil pour choisir le pack le plus adapté à mon véhicule.",
      form.vehicleModel.trim() ? `Véhicule: ${form.vehicleModel.trim()}` : "",
      form.pack ? `Pack envisagé: ${form.pack}` : "",
    ]
      .filter(Boolean)
      .join("\n")
  );
  const outOfZoneWhatsAppUrl = createWhatsAppUrl(
    [
      "Bonjour LN AutoShine,",
      `Mon adresse semble être hors zone (${serviceZoneLabel}) dans le formulaire de réservation.`,
      selectedAddress ? `Adresse: ${selectedAddress.label}` : "",
      selectedAddress ? `Distance estimée: ${selectedAddress.distanceKm} km` : "",
      form.vehicleModel.trim() ? `Véhicule: ${form.vehicleModel.trim()}` : "",
      form.pack ? `Pack souhaité: ${form.pack}` : "",
      "Pouvez-vous me confirmer si une intervention est possible ?",
    ]
      .filter(Boolean)
      .join("\n")
  );

  useEffect(() => {
    if (!isOpen || step !== 2) return;

    if (selectedAddress) {
      setAddressSuggestions([]);
      setAddressSuggestError("");
      setIsSuggestLoading(false);
      return;
    }

    const query = form.address.trim();
    if (query.length < 3) {
      setAddressSuggestions([]);
      setAddressSuggestError("");
      setIsSuggestLoading(false);
      return;
    }

    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(async () => {
      setIsSuggestLoading(true);
      setAddressSuggestError("");
      try {
        const response = await fetch(`/api/address-suggest?q=${encodeURIComponent(query)}`);
        const data = (await response.json()) as {
          suggestions?: AddressSuggestion[];
          error?: string;
        };
        if (data.error) {
          setAddressSuggestError(data.error);
          setAddressSuggestions([]);
          return;
        }
        setAddressSuggestions(data.suggestions || []);
      } catch {
        setAddressSuggestions([]);
        setAddressSuggestError("Impossible de charger les suggestions d'adresse.");
      } finally {
        setIsSuggestLoading(false);
      }
    }, 350);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [form.address, isOpen, selectedAddress, step]);

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
      {!standalone && (
        <div
          className={`booking-overlay${isOpen ? " is-open" : ""}`}
          onClick={closeDrawer}
          aria-hidden={!isOpen}
        />
      )}

      <aside
        className={`booking-panel${isOpen || standalone ? " is-open" : ""}${
          standalone ? " booking-panel--page" : ""
        }`}
        aria-hidden={standalone ? false : !isOpen}
        aria-label="Formulaire de réservation"
      >
        <div className="booking-panel__header">
          <div>
            <p className="eyebrow">Réservation</p>
            <h3>Réserver votre nettoyage</h3>
          </div>
          <button type="button" className="booking-close" onClick={closeDrawer}>
            {standalone ? "Quitter" : "Fermer"}
          </button>
        </div>

        <div className="booking-steps" aria-hidden>
          {bookingSteps.map((label, index) => (
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
                          <small>Prix: {pack.price}</small>
                          <small>Durée: {pack.duration}</small>
                        </button>

                        <button
                          type="button"
                          className={`booking-pack-more${isExpanded ? " is-open" : ""}`}
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              pack: pack.name,
                              date: "",
                              timeSlot: "",
                              timeSlotLabel: "",
                            }));
                            setExpandedPack((prev) => (prev === pack.name ? null : pack.name));
                          }}
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
                <p className="booking-pack-help">
                  Vous avez un doute ?{" "}
                  <a
                    href={packHelpWhatsAppUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Contactez-nous sur WhatsApp
                  </a>
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="booking-fields">
              <label>
                Prénom
                <input
                  type="text"
                  placeholder="Prénom"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                />
              </label>

              <label>
                Nom
                <input
                  type="text"
                  placeholder="Nom"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                />
              </label>

              <label>
                Téléphone
                <input
                  type="tel"
                  placeholder="04 ..."
                  inputMode="tel"
                  pattern="^\+?\d+$"
                  value={form.phone}
                  onChange={(e) => updateField("phone", sanitizePhone(e.target.value))}
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  placeholder="vous@email.com"
                  value={form.email}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </label>
              {!isEmailFocused && form.email.trim().length > 0 && !isEmailValid && (
                <div className="booking-zone-warning">
                  Email invalide (format attendu: nom@domaine.com)
                </div>
              )}

              <label>
                Adresse de la prestation
                <small>Zone desservie: {serviceZoneLabel}</small>
                <div className="booking-address-wrap">
                  <div className="booking-address-input">
                    <span className="booking-address-icon" aria-hidden />
                    <input
                      ref={addressInputRef}
                      type="text"
                      placeholder="Adresse complète, code postal, ville"
                      value={form.address}
                      readOnly={Boolean(selectedAddress)}
                      onChange={(e) => {
                        updateField("address", e.target.value);
                        setSelectedAddress(null);
                        setAddressSuggestError("");
                      }}
                    />
                    {form.address.trim().length > 0 && (
                      <button
                        type="button"
                        className="booking-address-clear"
                        aria-label="Effacer l'adresse"
                        onClick={clearAddress}
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {!selectedAddress && form.address.trim().length >= 3 && (
                    <div className="booking-address-list">
                      {isSuggestLoading && (
                        <button type="button" className="booking-address-item" disabled>
                          Recherche d&apos;adresses...
                        </button>
                      )}
                      {!isSuggestLoading && addressSuggestError && (
                        <button type="button" className="booking-address-item" disabled>
                          {addressSuggestError}
                        </button>
                      )}
                      {!isSuggestLoading &&
                        !addressSuggestError &&
                        addressSuggestions.slice(0, 5).map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="booking-address-item"
                            onClick={() => selectAddress(item)}
                          >
                            <span>{item.addressLine1 || item.label}</span>
                            {item.addressLine2 && <small>{item.addressLine2}</small>}
                            <small
                              className={`booking-address-distance${
                                item.inZone ? " is-in-zone" : " is-out-zone"
                              }`}
                            >
                              {item.inZone
                                ? `${item.distanceKm} km`
                                : `Hors zone 15 km - ${item.distanceKm} km`}
                            </small>
                          </button>
                        ))}
                      {!isSuggestLoading && !addressSuggestError && addressSuggestions.length === 0 && (
                        <button type="button" className="booking-address-item" disabled>
                          Aucune adresse trouvée. Essaie avec le numéro ou le code postal.
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </label>

              {selectedAddress?.houseNumber ? (
                <div className="booking-zone-status">
                  Numéro détecté: {selectedAddress.houseNumber}
                </div>
              ) : (
                <label>
                  Numéro de maison
                  <input
                    type="text"
                    placeholder="Ex: 12A"
                    value={form.houseNumber}
                    onChange={(e) => updateField("houseNumber", e.target.value)}
                  />
                </label>
              )}

              {!selectedAddress && form.address.trim().length >= 3 && (
                <div className="booking-zone-warning">
                  Sélectionne une adresse proposée pour valider automatiquement la zone.
                </div>
              )}

              {selectedAddress && (
                <div
                  className={`booking-zone-status${
                    selectedAddress.inZone ? " is-in-zone" : " is-out-zone"
                  }`}
                >
                  {selectedAddress.inZone
                    ? `Adresse dans la zone de ${serviceZoneLabel} (${selectedAddress.distanceKm} km).`
                    : (
                      <>
                        Adresse hors zone de {serviceZoneLabel} ({selectedAddress.distanceKm} km).{" "}
                        <a
                          href={outOfZoneWhatsAppUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Contactez-nous sur WhatsApp
                        </a>
                        .
                      </>
                    )}
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

          {step === 1 && (
            <div className="booking-fields">
              <div className="booking-calendar">
                <div className="booking-calendar-days">
                  <div className="booking-calendar-title">Dates disponibles</div>
                  <div className="booking-days-list">
                    {availabilityLoading && (
                      <div className="booking-calendar-empty">
                        Chargement des disponibilités...
                      </div>
                    )}

                    {!availabilityLoading && availabilityError && (
                      <div className="booking-calendar-empty">{availabilityError}</div>
                    )}

                    {!availabilityLoading &&
                      !availabilityError &&
                      availabilityDays.length === 0 && (
                        <div className="booking-calendar-empty">
                          Aucun créneau disponible pour ce pack.
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
                          <small>{day.slots.length} créneaux</small>
                        </button>
                      ))}
                  </div>
                </div>

                <div className="booking-calendar-slots">
                  <div className="booking-calendar-title">Heures disponibles</div>

                  {!form.date && (
                    <div className="booking-calendar-empty">
                      Sélectionne d&apos;abord une date.
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
                <strong>Client:</strong> {form.firstName} {form.lastName}
              </p>
              <p>
                <strong>Téléphone:</strong> {form.phone}
              </p>
              <p>
                <strong>Email:</strong> {form.email}
              </p>
              <p>
                <strong>Adresse:</strong> {form.address}
              </p>
              <p>
                <strong>Numéro:</strong> {form.houseNumber}
              </p>
              <p>
                <strong>Créneau:</strong> {summarySlotLabel}
              </p>
              {bookingError && <p className="booking-success">{bookingError}</p>}
              {bookingSuccess && <p className="booking-success">{bookingSuccess}</p>}
            </div>
          )}

          <div className={`booking-actions${step === 0 ? " booking-actions--single" : ""}`}>
            {step > 0 && (
              <button
                type="button"
                className="booking-btn booking-btn--ghost"
                onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
                disabled={bookingLoading || Boolean(bookingSuccess)}
              >
                Retour
              </button>
            )}

            <button
              type="submit"
              className="booking-btn"
              disabled={
                bookingLoading ||
                Boolean(bookingSuccess) ||
                (step < bookingSteps.length - 1 && !canGoNext)
              }
            >
              {step < bookingSteps.length - 1
                ? "Continuer"
                : bookingLoading
                  ? "Envoi..."
                  : bookingSuccess
                    ? "Demande envoyée"
                    : "Envoyer la demande"}
            </button>
          </div>
        </form>
      </aside>
    </>
  );
}
