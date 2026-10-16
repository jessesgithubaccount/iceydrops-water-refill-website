import { MAP_QUERY } from "../config";

export default function MapBox() {
  const q = encodeURIComponent(MAP_QUERY);
  return (
    <div className="cmapw">
      <div className="cmap">
        <iframe
          title="Map showing the Icey Drops & Refill station"
          src={`https://www.google.com/maps?q=${q}&z=16&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <a className="cdir" href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener">
        Get directions →
      </a>
    </div>
  );
}
