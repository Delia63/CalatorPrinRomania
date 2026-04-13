import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FormularTraseu from './FormularTraseu';
import RecenziiAtractie from './RecenziiAtractie';
import PanouFiltre from './PanouFiltre';

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

  const fetchAtractii = (queryString = '') => {
    const url = queryString
      ? `http://localhost:8000/api/atractii/?${queryString}`
      : 'http://localhost:8000/api/atractii/';
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) setAtractii(data);
        else setAtractii(data.results || []);
      });
  };

  useEffect(() => {
    fetchAtractii();
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

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <FormularTraseu onCalculeaza={handleCalculeaza} />
      <PanouFiltre onFiltreaza={fetchAtractii} />
      {infTraseu && (
        <div style={{
          position: 'absolute', top: 20, right: 20, zIndex: 1000,
          background: 'white', padding: '12px', borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          <p style={{ margin: 0 }}>📏 <strong>{infTraseu.distantaKm} km</strong></p>
          <p style={{ margin: '4px 0 0 0' }}>⏱️ <strong>{infTraseu.durataMin} min</strong></p>
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
      <MapContainer center={[45.9, 25.0]} zoom={7} style={{ width: '100%', height: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {traseu && <Polyline positions={traseu} color="blue" weight={4} />}
        {listaAfisata.map(atractie => {
          const emoji = getEmoji(atractie.tip);
          const stareGhicire = ghicire[atractie.id];
          return (
            <Marker
              key={atractie.id}
              position={[atractie.latitudine, atractie.longitudine]}
              icon={createEmojiIcon(emoji)}
            >
              <Popup minWidth={220}>
                <strong style={{ fontSize: '15px' }}>
                  {emoji} {(atractie.curiozitate && !stareGhicire?.rezultat?.corect) ? '❓ ???' : atractie.nume}
                </strong>
                <p style={{ margin: '4px 0', color: '#555', fontSize: '12px' }}>
                  {atractie.tip}{(stareGhicire?.rezultat?.corect || !atractie.curiozitate) ? ` | ${atractie.tarif} RON` : ''}
                </p>
                {atractie.curiozitate && (
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