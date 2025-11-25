// src/tests/GoogleMapsComponent.spec.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import GoogleMapComponent from '../components/GoogleMapsComponent';
import { describe, it, expect, vi } from 'vitest';

// Mock de @react-google-maps/api para Vitest
vi.mock('@react-google-maps/api', () => ({
  GoogleMap: ({ children }) => <div data-testid="google-map">{children}</div>,
  LoadScript: ({ children }) => <div>{children}</div>,
  Marker: () => <div data-testid="marker" />
}));

describe('GoogleMapComponent', () => {
  it('se renderiza correctamente', () => {
    render(<GoogleMapComponent />);
    expect(screen.getByTestId('google-map')).toBeInTheDocument();
  });

  it('muestra un marker en el mapa', () => {
    render(<GoogleMapComponent />);
    expect(screen.getByTestId('marker')).toBeInTheDocument();
  });
});
