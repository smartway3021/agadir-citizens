"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useState } from "react"
import L from "leaflet"

// Fix Leaflet default marker icon
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface Props {
  address: string
  sector: string
}

// Approximate coordinates for Agadir sectors
const sectorCoords: Record<string, [number, number]> = {
  "Agadir Ville": [30.4278, -9.5981],
  "Anza": [30.4000, -9.6000],
  "Talborjt": [30.4200, -9.5800],
  "Charaf": [30.4100, -9.5900],
  "Dakhla": [30.4400, -9.6100],
  "Hay Salam": [30.4350, -9.5750],
  "Inezgane": [30.3550, -9.5350],
  "Aït Melloul": [30.3350, -9.5000],
  "Tiznit": [29.7000, -9.7300],
  "Taroudant": [30.4700, -8.8800],
}

export function CitizenMap({ address, sector }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-muted text-sm">Chargement de la carte...</p>
      </div>
    )
  }

  const coords = sectorCoords[sector] || [30.4278, -9.5981]

  return (
    <div className="h-64 rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={coords}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords} icon={icon}>
          <Popup>
            <div className="text-sm">
              <strong>{address}</strong>
              <br />
              Secteur: {sector}
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  )
}
