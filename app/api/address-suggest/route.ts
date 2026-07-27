import { NextResponse } from "next/server";

const HUY_LAT = 50.51888;
const HUY_LON = 5.2408;
const MAX_RADIUS_KM = 20;

type GeoapifyResult = {
  place_id?: string;
  formatted?: string;
  address_line1?: string;
  address_line2?: string;
  housenumber?: string;
  street?: string;
  postcode?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  result_type?: string;
  lat: number | string;
  lon: number | string;
  rank?: {
    confidence?: number;
    confidence_building_level?: number;
    confidence_street_level?: number;
    match_type?: string;
  };
};

type GeoapifyResponse = {
  results?: GeoapifyResult[];
};

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function compact(parts: Array<string | undefined>) {
  return parts.map((part) => part?.trim()).filter(Boolean).join(", ");
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const apiKey = (process.env.GEOAPIFY_API_KEY || "").trim();

    if (q.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    if (!apiKey) {
      return NextResponse.json({
        suggestions: [],
        error: "Recherche d'adresse indisponible. Clé Geoapify manquante.",
      });
    }

    const geoapifyUrl = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
    geoapifyUrl.searchParams.set("text", q);
    geoapifyUrl.searchParams.set("format", "json");
    geoapifyUrl.searchParams.set("lang", "fr");
    geoapifyUrl.searchParams.set("limit", "7");
    geoapifyUrl.searchParams.set("filter", "countrycode:be");
    geoapifyUrl.searchParams.set("bias", `proximity:${HUY_LON},${HUY_LAT}`);
    geoapifyUrl.searchParams.set("apiKey", apiKey);

    const response = await fetch(geoapifyUrl.toString(), {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({
        suggestions: [],
        error: "Impossible de charger les suggestions d'adresse.",
      });
    }

    const data = (await response.json()) as GeoapifyResponse;
    const seen = new Set<string>();

    const suggestions = (data.results || [])
      .map((item) => {
        const lat = Number(item.lat);
        const lon = Number(item.lon);
        if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

        const distance = distanceKm(HUY_LAT, HUY_LON, lat, lon);
        const roundedDistance = Number(distance.toFixed(1));
        const addressLine1 =
          item.address_line1 ||
          compact([compact([item.housenumber, item.street]), item.formatted]);
        const addressLine2 =
          item.address_line2 ||
          compact([item.postcode, item.city, item.county || item.state, item.country]);
        const label = item.formatted || compact([addressLine1, addressLine2]);
        const id = item.place_id || `${label}-${lat}-${lon}`;

        if (!label || seen.has(id)) return null;
        seen.add(id);

        return {
          id,
          label,
          addressLine1,
          addressLine2,
          houseNumber: item.housenumber || "",
          street: item.street || "",
          postcode: item.postcode || "",
          city: item.city || "",
          lat,
          lon,
          distanceKm: roundedDistance,
          inZone: roundedDistance <= MAX_RADIUS_KM,
          confidence: item.rank?.confidence ?? null,
          matchType: item.rank?.match_type || "",
        };
      })
      .filter(Boolean);

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({
      suggestions: [],
      error: "Impossible de charger les suggestions d'adresse.",
    });
  }
}
