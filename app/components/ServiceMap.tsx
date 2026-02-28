"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet";
import { latLng } from "leaflet";

const center: [number, number] = [50.5483, 5.3098];
const radiusMeters = 20000;

function FitCircleBounds() {
  const map = useMap();

  useEffect(() => {
    const bounds = latLng(center[0], center[1]).toBounds(radiusMeters * 2);
    map.fitBounds(bounds, { padding: [20, 20] });
    map.once("moveend", () => {
      map.setZoom(map.getZoom() + 1);
    });
  }, [map]);

  return null;
}

export default function ServiceMap() {
  return (
    <div className="map-shell">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={false}
        className="map"
      >
        <FitCircleBounds />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={center}
          radius={radiusMeters}
          pathOptions={{ color: "#747b86", fillColor: "#747b86", fillOpacity: 0.18 }}
        />
      </MapContainer>
      <div className="map-label">Liège, Huy & alentours - rayon 20 km</div>
    </div>
  );
}
