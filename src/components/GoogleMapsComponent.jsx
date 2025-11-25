import React from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

// Cambia estas coordenadas por la ubicación que quieras mostrar
const center = {
  lat: -33.4489, // Santiago, Chile
  lng: -70.6693
};

function GoogleMapComponent() {
  return (
    <LoadScript googleMapsApiKey="AIzaSyCHI-q5iRMxzLi5QvEnoOXlqgblaoM1BC0">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
      >
        <Marker position={center} />
      </GoogleMap>
    </LoadScript>
  );
}

export default GoogleMapComponent;
