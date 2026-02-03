"use client";

import { MapContainer, TileLayer, Circle } from "react-leaflet";

const center: [number, number] = [50.632557, 5.579666];

export default function ServiceMap() {
  return (
    <div className="map-shell">
      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={false}
        className="map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Circle
          center={center}
          radius={20000}
          pathOptions={{ color: "#F5F5F5", fillColor: "#F5F5F5", fillOpacity: 0.12 }}
        />
      </MapContainer>
      <div className="map-label">Rayon 20 km autour de Liège</div>
    </div>
  );
}
