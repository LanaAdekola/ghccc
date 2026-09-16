'use client';

import {useState} from 'react';

interface LocationMapProps {
  headquarters?: string;
  isheri?: string;
}

export default function LocationMap({
  headquarters = '3rd Floor of Tejumola House, Plot 24 Ogunnusi Road (beside CLAM) in Ojodu Berger, Lagos',
  isheri = '6 Ogun River Road, Isheri-Magodo, Lagos',
}: LocationMapProps) {
  const [activeLocation, setActiveLocation] = useState<'headquarters' | 'isheri'>('headquarters');

  const locations = {
    headquarters: {
      name: 'Headquarters Map',
      tag: 'HEADQUARTERS',
      subheading: 'Ojodu Berger · Headquarters',
      address: headquarters,
      times: ['Sunday · 8:00 AM–1:00 PM', 'Wednesday · 6:00 PM–8:30 PM'],
      osmUrl:
        'https://www.openstreetmap.org/export/embed.html?bbox=3.3442%2C6.6442%2C3.3642%2C6.6642&layer=mapnik&marker=6.6542%2C3.3542',
      gmapsUrl:
        'https://www.google.com/maps/search/?api=1&query=Tejumola+House+Plot+24+Ogunnusi+Road+beside+CLAM+Ojodu+Berger+Lagos',
      notes: 'Plot 24 Ogunnusi Road (beside CLAM), Ojodu Berger, Lagos',
    },
    isheri: {
      name: 'Isheri-Magodo Map',
      tag: 'CAMPUS EXPRESSION',
      subheading: 'Isheri-Magodo Church (Isheri Magodo)',
      address: isheri,
      times: ['Gathering Expression · Isheri Magodo Community', 'Sunday Worship & Midweek Word'],
      osmUrl:
        'https://www.openstreetmap.org/export/embed.html?bbox=3.3475%2C6.6297%2C3.3675%2C6.6497&layer=mapnik&marker=6.6397%2C3.3575',
      gmapsUrl:
        'https://www.google.com/maps/search/?api=1&query=6+Ogun+River+Road+Isheri+Magodo+Lagos',
      notes: '6 Ogun River Road, Isheri-Magodo, Lagos',
    },
  };

  const current = locations[activeLocation];

  return (
    <div className="church-map-container" id="locate-us">
      {/* Map Header & Location Toggle */}
      <div className="map-header-toggle">
        <div className="map-toggle-buttons">
          <button
            type="button"
            className={`map-tab-btn ${activeLocation === 'headquarters' ? 'active' : ''}`}
            onClick={() => setActiveLocation('headquarters')}
          >
            <span className="tab-dot" />
            <span>Headquarters Map</span>
          </button>
          <button
            type="button"
            className={`map-tab-btn ${activeLocation === 'isheri' ? 'active' : ''}`}
            onClick={() => setActiveLocation('isheri')}
          >
            <span className="tab-dot" />
            <span>Isheri-Magodo Map</span>
          </button>
        </div>
      </div>

      {/* Interactive Map Frame */}
      <div className="map-frame-wrap">
        <iframe
          title={`${current.name} - Glory Hills Community Church`}
          src={current.osmUrl}
          className="map-iframe"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {/* Active Location Details Card */}
      <div className="map-active-detail">
        <div className="map-detail-main">
          <div className="location-badge">{current.tag}</div>
          <h3>{current.subheading}</h3>
          <p className="map-address-text">{current.address}</p>
          <div className="location-times">
            {current.times.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>

        <div className="map-actions-col">
          <a
            href={current.gmapsUrl}
            target="_blank"
            rel="noreferrer"
            className="button small map-direction-btn"
            data-action="directions"
          >
            Get directions on Google Maps
          </a>
          <button
            type="button"
            className="button small light map-switch-btn"
            onClick={() =>
              setActiveLocation(activeLocation === 'headquarters' ? 'isheri' : 'headquarters')
            }
          >
            Switch to {activeLocation === 'headquarters' ? 'Isheri-Magodo Map' : 'Headquarters Map'} →
          </button>
        </div>
      </div>

      {/* Both Locations Quick Cards */}
      <div className="map-locations-summary">
        <div
          className={`location-summary-card ${activeLocation === 'headquarters' ? 'highlight' : ''}`}
          onClick={() => setActiveLocation('headquarters')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveLocation('headquarters')}
        >
          <div className="summary-header">
            <strong>Headquarters · Ojodu Berger</strong>
            {activeLocation === 'headquarters' && <span className="active-pill">Viewing</span>}
          </div>
          <p>{headquarters}</p>
          <span className="summary-time">Sunday 8:00 AM · Wednesday 6:00 PM</span>
        </div>

        <div
          className={`location-summary-card ${activeLocation === 'isheri' ? 'highlight' : ''}`}
          onClick={() => setActiveLocation('isheri')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setActiveLocation('isheri')}
        >
          <div className="summary-header">
            <strong>Isheri-Magodo Church</strong>
            {activeLocation === 'isheri' && <span className="active-pill">Viewing</span>}
          </div>
          <p>{isheri}</p>
          <span className="summary-time">Isheri Magodo Community Gathering</span>
        </div>
      </div>
    </div>
  );
}
