import { NextResponse } from "next/server";

const HUY_LAT = 50.51888;
const HUY_LON = 5.2408;
const MAX_RADIUS_KM = 20;

type NominatimItem = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();

    if (q.length < 3) {
      return NextResponse.json({ suggestions: [] });
    }

    const nominatimUrl = new URL("https://nominatim.openstreetmap.org/search");
    nominatimUrl.searchParams.set("format", "jsonv2");
    nominatimUrl.searchParams.set("countrycodes", "be");
    nominatimUrl.searchParams.set("addressdetails", "1");
    nominatimUrl.searchParams.set("limit", "6");
    nominatimUrl.searchParams.set("q", q);

    const response = await fetch(nominatimUrl.toString(), {
      headers: {
        "User-Agent": "LN-Autoshine/1.0 (contact@lnautoshine.be)",
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ suggestions: [] }, { status: 200 });
    }

    const results = (await response.json()) as NominatimItem[];

    const suggestions = results.map((item) => {
      const lat = Number(item.lat);
      const lon = Number(item.lon);
      const dist = distanceKm(HUY_LAT, HUY_LON, lat, lon);
      const roundedDist = Number(dist.toFixed(1));
      return {
        id: String(item.place_id),
        label: item.display_name,
        lat,
        lon,
        distanceKm: roundedDist,
        inZone: roundedDist <= MAX_RADIUS_KM,
      };
    });

    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({ suggestions: [] }, { status: 200 });
  }
}
