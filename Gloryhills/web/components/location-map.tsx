'use client';

interface LocationMapProps {
  headquarters?: string;
  isheri?: string;
}

export default function LocationMap({
  headquarters = '3rd Floor, Tejumola House, Plot 24 Ogunnusi Road (beside CLAM), Ojodu Berger, Lagos',
  isheri = '4 Ogun River Road, Isheri Magodo, Lagos',
}: LocationMapProps) {
  const gmapsHqUrl =
    'https://www.google.com/maps/search/?api=1&query=Tejumola+House+Plot+24+Ogunnusi+Road+Ojodu+Berger+Lagos';
  const gmapsIsheriUrl =
    'https://www.google.com/maps/search/?api=1&query=4+Ogun+River+Road+Isheri+Magodo+Lagos';

  return (
    <div className="church-map-container">
      <div className="map-frame-wrap">
        <iframe
          title="Glory Hills Community Church Location Map"
          src="https://www.openstreetmap.org/export/embed.html?bbox=3.3442%2C6.6442%2C3.3642%2C6.6642&layer=mapnik&marker=6.6542%2C3.3542"
          className="map-iframe"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      <div className="map-details-grid">
        <div className="map-location-card">
          <div className="location-badge">HEADQUARTERS</div>
          <h3>Ojodu Berger</h3>
          <p>{headquarters}</p>
          <div className="location-times">
            <span>Sunday · 8:00 AM–1:00 PM</span>
            <span>Wednesday · 6:00 PM–8:30 PM</span>
          </div>
          <a
            href={gmapsHqUrl}
            target="_blank"
            rel="noreferrer"
            className="button small map-direction-btn"
            data-action="directions"
          >
            Get directions on Google Maps ↗
          </a>
        </div>

        <div className="map-location-card secondary">
          <div className="location-badge secondary">EXPRESSION</div>
          <h3>Isheri Magodo</h3>
          <p>{isheri}</p>
          <div className="location-times">
            <span>Gathering Expression · Isheri Community</span>
          </div>
          <a
            href={gmapsIsheriUrl}
            target="_blank"
            rel="noreferrer"
            className="button small light map-direction-btn"
            data-action="directions"
          >
            Open in Google Maps ↗
          </a>
        </div>
      </div>
    </div>
  );
}
