import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FormularTraseu from './FormularTraseu';
import RecenziiAtractie from './RecenziiAtractie';
import PanouFiltre from './PanouFiltre';


// Component care face automat zoom+centru pe traseu când acesta se schimbă
function FitBoundsOnRoute({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length > 0) {
      map.fitBounds(positions, { padding: [40, 40] });
    }
  }, [positions, map]);
  return null;
}

// Dreptunghi mondial — stratul exterior al măștii
const WORLD_OUTER = [[-90, -180], [-90, 180], [90, 180], [90, -180]];


function getEmoji(tip) {
  const emojiMap = {
    'castel': '🏰',
    'biserica': '⛪',
    'manastire': '⛪',
    'pestera': '🕳️',
    'muzeu': '🏛️',
    'cascada': '💧',
    'lac': '🏞️',
    'munte': '⛰️',
    'parc': '🌳',
    'rezervatie': '🌿',
  };
  const tipLower = (tip || '').toLowerCase();
  for (const [cheie, emoji] of Object.entries(emojiMap)) {
    if (tipLower.includes(cheie)) return emoji;
  }
  return '📍';
}

function createEmojiIcon(emoji) {
  return L.divIcon({
    html: `<div style="font-size:24px;line-height:1;">${emoji}</div>`,
    className: '',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
}

function Harta() {
  const [atractii, setAtractii] = useState([]);
  const [traseu, setTraseu] = useState(null);
  const [atractiiTraseu, setAtractiiTraseu] = useState([]);
  const [infTraseu, setInfTraseu] = useState(null);
  const [ghicire, setGhicire] = useState({});
  const [festivaluri, setFestivaluri] = useState([]);
  const [preparate, setPreparate] = useState([]);
  const [romaniaBorder, setRomaniaBorder] = useState(null);
  const [descoperite, setDescoperite] = useState(new Set()); // ID-uri atracții descoperite anterior

  const fetchAtractii = (queryString = '') => {
    const url = queryString
      ? `http://localhost:8000/api/atractii/?${queryString}`
      : 'http://localhost:8000/api/atractii/';
    fetch(url)
      .then(response => response.json())
      .then(data => {
        const lista = Array.isArray(data) ? data : (data.results || []);
        console.log('Atracții încărcate:', lista.length);
        setAtractii(lista);
      })
      .catch(err => console.error('Eroare fetch atracții:', err));
  };

  useEffect(() => {
    fetchAtractii();

    // Fetch atracții descoperite anterior (din DB)
    const token = localStorage.getItem('access_token');
    if (token) {
      fetch('http://localhost:8000/api/utilizatori/descoperiri-mele/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => {
          const ids = new Set((Array.isArray(data) ? data : (data.results || [])).map(d => d.atractie_id));
          setDescoperite(ids);
        })
        .catch(() => {});
    }

    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries/ROU.geo.json')
      .then(r => r.json())
      .then(data => {
        const geom = data.features[0].geometry;
        let coords;
        if (geom.type === 'Polygon') {
          coords = geom.coordinates[0];
        } else if (geom.type === 'MultiPolygon') {
          // ia cel mai mare poligon
          coords = geom.coordinates.reduce((a, b) =>
            a[0].length > b[0].length ? a : b
          )[0];
        }
        // GeoJSON: [lng, lat] → Leaflet: [lat, lng]
        setRomaniaBorder(coords.map(([lng, lat]) => [lat, lng]));
      })
      .catch(() => console.warn('Nu s-a putut încărca granița României'));
  }, []);

  const handleCalculeaza = (data) => {
    const coords = data.geojson.features[0].geometry.coordinates;
    const latlngs = coords.map(([lon, lat]) => [lat, lon]);
    setTraseu(latlngs);
    setAtractiiTraseu(data.atractii);
    setInfTraseu({
      distantaKm: data.distantaKm,
      durataMin: data.durataMin
    });
    setFestivaluri(data.festivaluri || []);
    setPreparate(data.preparate || []);
  };

  const handleGhicire = async (atractieId, raspuns) => {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`http://localhost:8000/api/atractii/${atractieId}/ghiceste/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ raspuns })
    });
    const data = await response.json();
    setGhicire(prev => ({ ...prev, [atractieId]: { raspuns, rezultat: data } }));
  };

  const listaAfisata = atractiiTraseu.length > 0 ? atractiiTraseu : atractii;

  const formatDurata = (min) => {
    if (min < 60) return `${min} min`;
    const ore = Math.floor(min / 60);
    const minute = min % 60;
    return minute === 0 ? `${ore}h` : `${ore}h ${minute}min`;
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div style={{
        position: 'absolute', top: 20, left: 20, zIndex: 1000,
        display: 'flex', flexDirection: 'column', gap: '8px',
        width: '280px',
      }}>
        <FormularTraseu onCalculeaza={handleCalculeaza} />
        <PanouFiltre onFiltreaza={fetchAtractii} />
      </div>
      {infTraseu && (
        <div style={{
          position: 'absolute', top: 20, right: 20, zIndex: 1000,
          background: 'white', padding: '12px', borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          <p style={{ margin: 0 }}>📏 <strong>{infTraseu.distantaKm} km</strong></p>
          <p style={{ margin: '4px 0 0 0' }}>⏱️ <strong>{formatDurata(infTraseu.durataMin)}</strong></p>
          <p style={{ margin: '4px 0 0 0' }}>📍 <strong>{atractiiTraseu.length}</strong> atracții pe traseu</p>
        </div>
      )}
      {/* Festivaluri + Gastronomie */}
      {(festivaluri.length > 0 || preparate.length > 0) && (
        <div style={{
          position: 'absolute', bottom: 20, right: 20, zIndex: 1000,
          background: 'white', padding: '14px', borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)', maxWidth: '280px',
          maxHeight: '300px', overflowY: 'auto',
        }}>
          {festivaluri.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
              <h4 style={{ margin: '0 0 6px', fontSize: '14px' }}>🎪 Festivaluri în perioadă</h4>
              {festivaluri.map(f => (
                <div key={f.id} style={{
                  background: '#fff3e0', padding: '6px 8px', borderRadius: '4px',
                  marginBottom: '4px', fontSize: '12px', borderLeft: '3px solid #E65100',
                }}>
                  <strong>{f.nume}</strong>
                  <div style={{ color: '#888', fontSize: '11px' }}>
                    {f.dataStart} → {f.dataEnd}
                  </div>
                </div>
              ))}
            </div>
          )}
          {preparate.length > 0 && (
            <div>
              <h4 style={{ margin: '0 0 6px', fontSize: '14px' }}>🍽️ Gastronomie locală</h4>
              {preparate.map(p => (
                <div key={p.id} style={{
                  background: '#e8f5e9', padding: '6px 8px', borderRadius: '4px',
                  marginBottom: '4px', fontSize: '12px', borderLeft: '3px solid #2E7D32',
                }}>
                  <strong>{p.nume}</strong>
                  <span style={{ color: '#888', fontSize: '11px', marginLeft: '6px' }}>({p.regiune})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <MapContainer
        center={[45.9, 25.0]}
        zoom={7}
        minZoom={7}
        zoomControl={false}
        maxBounds={[
          [43.6, 20.2],
          [48.3, 29.7],
        ]}
        maxBoundsViscosity={1.0}
        style={{ width: '100%', height: '100%' }}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Mască — acoperă tot ce e în afara României */}
        {romaniaBorder && (
          <Polygon
            positions={[WORLD_OUTER, romaniaBorder]}
            pathOptions={{
              fillColor: '#6b7280',
              fillOpacity: 0.65,
              stroke: false,
            }}
          />
        )}

        {traseu && <Polyline positions={traseu} color="blue" weight={4} />}
        {traseu && <FitBoundsOnRoute positions={traseu} />}
        {listaAfisata.map(atractie => {
          const emoji = getEmoji(atractie.tip);
          const stareGhicire = ghicire[atractie.id];
          const esteDescoperit = stareGhicire?.rezultat?.corect || descoperite.has(atractie.id);
          return (
            <Marker
              key={atractie.id}
              position={[atractie.latitudine, atractie.longitudine]}
              icon={createEmojiIcon(emoji)}
            >
              <Popup minWidth={260} maxWidth={300}>
                {/* Poza de copertă — afișată după descoperire (din sesiune sau DB) */}
                {atractie.imagineCopertaUrl && esteDescoperit && (
                  <img
                    src={atractie.imagineCopertaUrl}
                    alt={atractie.nume}
                    style={{
                      width: '100%', height: '140px', objectFit: 'cover',
                      borderRadius: '6px', marginBottom: '8px', display: 'block',
                    }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}

                <strong style={{ fontSize: '15px' }}>
                  {emoji} {(atractie.curiozitate && !esteDescoperit) ? '❓ ???' : atractie.nume}
                </strong>

                <p style={{ margin: '4px 0', color: '#555', fontSize: '12px' }}>
                  {atractie.tip}
                </p>

                {/* Detalii vizibile după descoperire */}
                {(esteDescoperit || !atractie.curiozitate) && (
                  <div style={{ margin: '6px 0', fontSize: '12px', color: '#444' }}>
                    {atractie.descriere && (
                      <p style={{ margin: '0 0 6px', lineHeight: 1.4 }}>
                        {atractie.descriere.length > 150
                          ? atractie.descriere.slice(0, 150) + '...'
                          : atractie.descriere}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                      {atractie.programVizitare && (
                        <span style={{
                          background: '#e3f2fd', padding: '2px 8px',
                          borderRadius: '12px', fontSize: '11px', color: '#1565c0',
                        }}>
                          🕐 {atractie.programVizitare}
                        </span>
                      )}
                      <span style={{
                        background: atractie.tarif > 0 ? '#fff3e0' : '#e8f5e9',
                        padding: '2px 8px', borderRadius: '12px',
                        fontSize: '11px',
                        color: atractie.tarif > 0 ? '#e65100' : '#2e7d32',
                      }}>
                        {atractie.tarif > 0 ? `💰 ${atractie.tarif} RON` : '🆓 Gratuit'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Mecanism ghicire — ascuns dacă deja descoperit */}
                {atractie.curiozitate && !esteDescoperit && (
                  <div style={{ marginTop: '8px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                    <p style={{ margin: '0 0 6px', fontSize: '12px', fontStyle: 'italic' }}>
                      🧩 {atractie.curiozitate}
                    </p>
                    {stareGhicire?.rezultat?.corect ? (
                      <p style={{ color: 'green', fontSize: '12px', margin: 0 }}>
                        ✅ {stareGhicire.rezultat.mesaj}
                      </p>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Ghicește numele..."
                          defaultValue={stareGhicire?.raspuns || ''}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleGhicire(atractie.id, e.target.value);
                          }}
                          style={{
                            width: '100%', padding: '4px', boxSizing: 'border-box',
                            borderRadius: '4px', border: '1px solid #ccc', fontSize: '12px'
                          }}
                        />
                        {stareGhicire?.rezultat?.corect === false && (
                          <p style={{ color: 'red', fontSize: '11px', margin: '4px 0 0' }}>
                            ❌ {stareGhicire.rezultat.mesaj}
                          </p>
                        )}
                        <p style={{ fontSize: '10px', color: '#888', margin: '4px 0 0' }}>
                          Apasă Enter pentru a ghici
                        </p>
                      </>
                    )}
                  </div>
                )}

                {/* Recenzii */}
                <RecenziiAtractie atractieId={atractie.id} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default Harta;