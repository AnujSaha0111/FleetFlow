"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for missing marker icons in React Leaflet
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface RouteMapProps {
  originCoords: [number, number] | null; // [lat, lng]
  destCoords: [number, number] | null;
}

export default function RouteMap({ originCoords, destCoords }: RouteMapProps) {
  // Default to Center of India if no coords provided
  const center: [number, number] = originCoords || [20.5937, 78.9629];

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-md border z-0 relative">
      <MapContainer center={center} zoom={5} scrollWheelZoom={false} className="h-full w-full">
        {/* The Map Tiles (Skin) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Start Point Marker */}
        {originCoords && (
          <Marker position={originCoords} icon={icon}>
            <Popup>Origin</Popup>
          </Marker>
        )}

        {/* End Point Marker */}
        {destCoords && (
          <Marker position={destCoords} icon={icon}>
            <Popup>Destination</Popup>
          </Marker>
        )}

        {/* The Line connecting them */}
        {originCoords && destCoords && (
          <Polyline 
            positions={[originCoords, destCoords]} 
            color="blue" 
            weight={4} 
            opacity={0.7} 
            dashArray="10, 10" 
          />
        )}
      </MapContainer>
    </div>
  );
}