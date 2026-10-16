import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { GOOGLE_MAPS_KEY, CARTO_KEY } from "../config";

let googleReady = null;
const loadGoogle = () => {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (googleReady) return googleReady;
  if (!GOOGLE_MAPS_KEY) return Promise.reject(new Error("no google key"));
  googleReady = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}&v=weekly`;
    s.async = true;
    s.onload = () => (window.google?.maps ? resolve(window.google.maps) : reject(new Error("no google")));
    s.onerror = () => {
      googleReady = null;
      reject(new Error("map failed"));
    };
    document.head.appendChild(s);
  });
  window.gm_authFailure = () => {
    googleReady = null;
    window.__gmFail && window.__gmFail();
  };
  return googleReady;
};

export async function makeGoogleMap(el, pin, moved) {
  const gm = await loadGoogle();
  const pos = { lat: pin.lat, lng: pin.lng };
  const map = new gm.Map(el, {
    center: pos,
    zoom: pin.zoom || 18,
    gestureHandling: "greedy",
    mapTypeControl: true,
    streetViewControl: false,
    fullscreenControl: false,
  });
  const marker = new gm.Marker({ position: pos, map, draggable: true });
  const circle = new gm.Circle({
    map,
    center: pos,
    radius: pin.acc || 0,
    strokeColor: "#1668d8",
    strokeWeight: 1,
    fillColor: "#1668d8",
    fillOpacity: 0.12,
    clickable: false,
  });
  const set = (ll) => {
    marker.setPosition(ll);
    circle.setCenter(ll);
    circle.setRadius(0);
    moved(ll.lat(), ll.lng());
  };
  marker.addListener("dragend", () => set(marker.getPosition()));
  map.addListener("click", (e) => set(e.latLng));
  return {
    update(lat, lng, acc) {
      const p = { lat, lng };
      marker.setPosition(p);
      circle.setCenter(p);
      circle.setRadius(acc || 0);
      map.panTo(p);
      if ((map.getZoom() || 0) < 17) map.setZoom(17);
    },
    resize() {
      gm.event.trigger(map, "resize");
      map.setCenter(marker.getPosition());
    },
    destroy() {
      gm.event.clearInstanceListeners(map);
      el.innerHTML = "";
    },
  };
}

export async function makeLeafletMap(el, pin, moved) {
  const map = L.map(el, { zoomControl: true, attributionControl: true }).setView([pin.lat, pin.lng], pin.zoom || 18);
  const layer = L.tileLayer(
    `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(CARTO_KEY)}`,
    { subdomains: "abcd", maxZoom: 20, attribution: "&copy; OpenStreetMap contributors &copy; CARTO" }
  );
  layer.addTo(map);
  const icon = L.divIcon({ className: "mp-pin", html: "<span></span>", iconSize: [34, 44], iconAnchor: [17, 44] });
  const marker = L.marker([pin.lat, pin.lng], { icon, draggable: true }).addTo(map);
  const circle = L.circle([pin.lat, pin.lng], { radius: pin.acc || 0, color: "#1668d8", weight: 1, fillOpacity: 0.12 }).addTo(map);
  const set = (ll) => {
    marker.setLatLng(ll);
    circle.setRadius(0);
    moved(ll.lat, ll.lng);
  };
  marker.on("dragend", () => set(marker.getLatLng()));
  map.on("click", (e) => set(e.latlng));
  setTimeout(() => map.invalidateSize(), 250);
  return {
    update(lat, lng, acc) {
      marker.setLatLng([lat, lng]);
      circle.setLatLng([lat, lng]);
      circle.setRadius(acc || 0);
      map.setView([lat, lng], Math.max(map.getZoom(), 17));
    },
    resize() {
      map.invalidateSize();
      map.panTo(marker.getLatLng());
    },
    destroy() {
      map.remove();
    },
  };
}
