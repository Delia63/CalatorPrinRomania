import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import FormularTraseu from './FormularTraseu';

function Harta() {
  const [atractii, setAtractii] = useState([]);
  const [traseu, setTraseu] = useState(null);
  const [atractiiTraseu, setAtractiiTraseu] = useState([]);
  const [infTraseu, setInfTraseu] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/api/atractii/')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) setAtractii(data); 
        else setAtractii(data.results || []);
      });
  }, []);

  const handleCalculeaza = (data) => {
    //extragerea coordonatelor pt linie
    const coords = data.geojson.features[0].geometry.coordinates;
    const latlngs = coords.map(([lon,lat]) => [lat,lon]);
    setTraseu(latlngs);
    setAtractiiTraseu(data.atractii);
    setInfTraseu({
      distantaKm: data.distantaKm,
      durataMin: data.durataMin
    });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <FormularTraseu onCalculeaza={handleCalculeaza} />

      {infTraseu && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 1000,
          background: 'white', padding: '12px', borderRadius: '8px', 
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            <p style={{ margin: 0}}>📏<strong>{infTraseu.distantaKm} km</strong></p>
            <p style={{ margin: '4px 0 0 0'}}>⏱️<strong>{infTraseu.durataMin} min</strong></p>
            <p style={{ margin: '4px 0 0 0'}}>📍<strong>{atractiiTraseu.length}</strong> atractii pe traseu</p>
        </div>
      )}

      <MapContainer
        center={[45.9, 25.0]}
        zoom={7}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {traseu && (
          <Polyline positions={traseu} color='blue' weight={4} />
        )}

        {(atractiiTraseu.length > 0 ? atractiiTraseu : atractii).map(atractie => (
          <Marker
            key={atractie.id}
            position={[atractie.latitudine, atractie.longitudine]}
          >
            <Popup>
              <strong>{atractie.nume}</strong><br />
              Tip: {atractie.tip}<br />
              Tarif: {atractie.tarif} RON
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  ); 
}

export default Harta;