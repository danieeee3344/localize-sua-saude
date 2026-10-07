import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export default function MapaUnidades({ unidades = [], selectedUnitId = null, onSelectUnit }) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Fix default Leaflet icon paths in bundlers
    delete L.Icon.Default.prototype._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })

    // Coordenadas centrais do Vale do Araguaia (Barra do Garças, Pontal do Araguaia, Aragarças)
    const centroInicial = [-15.8920, -52.2580]

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: centroInicial,
        zoom: 13,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores',
        maxZoom: 19,
      }).addTo(map)

      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current

    // Limpar marcadores anteriores
    Object.values(markersRef.current).forEach((m) => m.remove())
    markersRef.current = {}

    const bounds = []

    unidades.forEach((u) => {
      if (typeof u.latitude === 'number' && typeof u.longitude === 'number') {
        const coords = [u.latitude, u.longitude]
        bounds.push(coords)

        const marker = L.marker(coords).addTo(map)

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; min-width: 220px; padding: 4px;">
            <h4 style="margin: 0 0 4px; color: #0051bb; font-size: 1rem;">${u.nome}</h4>
            <p style="margin: 0 0 6px; font-size: 0.8rem; color: #475569;">${u.address}</p>
            <div style="margin-bottom: 8px;">
              <span style="display: inline-block; padding: 2px 6px; background: #e0edff; color: #0051bb; font-size: 0.75rem; font-weight: 700; border-radius: 4px;">
                ${u.atend === 'sus' ? 'SUS' : u.atend === 'particular' ? 'Particular' : 'Convênios'}
              </span>
              <span style="font-size: 0.75rem; color: #64748b; margin-left: 6px;">${u.cidade}</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <a href="tel:${u.phone.replace(/\D/g, '')}" style="background: #0284c7; color: #fff; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Ligar</a>
              ${u.whatsapp ? `<a href="https://wa.me/${u.whatsapp.replace(/\D/g, '')}" target="_blank" style="background: #16a34a; color: #fff; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">WhatsApp</a>` : ''}
              <a href="${u.maps_url || `https://maps.google.com/?q=${u.latitude},${u.longitude}`}" target="_blank" style="background: #475569; color: #fff; text-decoration: none; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">Como Chegar</a>
            </div>
          </div>
        `

        marker.bindPopup(popupContent)
        markersRef.current[u.id] = marker
      }
    })

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 })
    }

    return () => {
      // Clean on unmount
    }
  }, [unidades])

  // Efeito para focar em uma unidade selecionada
  useEffect(() => {
    if (selectedUnitId && markersRef.current[selectedUnitId] && mapInstanceRef.current) {
      const marker = markersRef.current[selectedUnitId]
      const latlng = marker.getLatLng()
      mapInstanceRef.current.setView(latlng, 15, { animate: true })
      marker.openPopup()
    }
  }, [selectedUnitId])

  return (
    <div className="leaflet-map-wrapper">
      <div ref={mapContainerRef} className="leaflet-map-container" style={{ height: '380px', width: '100%', borderRadius: '8px' }} />
    </div>
  )
}
