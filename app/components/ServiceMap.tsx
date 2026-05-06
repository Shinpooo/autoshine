"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Circle, useMap } from "react-leaflet";

const center: [number, number] = [50.51888, 5.2408];
const radiusMeters = 15000;
const defaultZoom = 10.25;

function SetMapView() {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    map.setView(center, defaultZoom, { animate: false });
  }, [map]);

  return null;
}

export default function ServiceMap() {
  return (
    <div className="map-shell">
      <MapContainer
        center={center}
        zoom={defaultZoom}
        zoomSnap={0.25}
        zoomDelta={0.25}
        scrollWheelZoom={false}
        className="map"
      >
        <SetMapView />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={center}
          radius={radiusMeters}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#ffffff",
            fillOpacity: 0.06,
            opacity: 1,
            weight: 5,
          }}
        />
      </MapContainer>
      <div className="map-label">Huy & alentours - rayon 15 km</div>
    </div>
  );
}
