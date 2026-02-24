import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Harta() {
  const [atractii, setAtractii] = useState([]);

  useEffect(() => {
    fetch('http://localhost:8000/api/atractii/')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAtractii(data);
        } else {
          setAtractii(data.results || []);
        }
      })
      .catch(error => console.error('Eroare:', error));
  }, []);

  return (
    <MapContainer
      center={[45.9, 25.0]}
      zoom={7}
      style={{ width: '100%', height: '100vh' }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {atractii.map(atractie => (
        <Marker
          key={atractie.id}
          position={[atractie.latitudine, atractie.longitudine]}
        >
          <Popup>
            <strong>{atractie.nume}</strong>
            <br />
            {atractie.descriere}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export default Harta;