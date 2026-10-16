import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { WHATSAPP, PRODUCTS, OFFERS, GOOGLE_MAPS_KEY, CARTO_KEY, MAP_QUERY, MAP_LABEL } from "./data.js";
import { useStoreOpen, CLOSED_TEXT } from "./hours.js";
import { LegalPage } from "./Legal.jsx";
import Footer from "./Footer.jsx";

const openWhatsApp = (message) =>
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener");

const Consent = ({ action }) => (
  <p className="consent">
    By {action} you agree to our <a href="#/terms" target="_blank" rel="noopener">Terms of Service</a> and{" "}
    <a href="#/privacy" target="_blank" rel="noopener">Privacy Policy</a>.
  </p>
);

const Icon = ({ children }) => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#1668d8" strokeWidth="2">{children}</svg>
);

/* ---------- Hero slider ---------- */
function Hero() {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    if (OFFERS.length < 2 || window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const t = setInterval(() => setCur((c) => (c + 1) % OFFERS.length), 6000);
    return () => clearInterval(t);
  }, [cur]); // resets the timer after a manual click, like the original

  return (
    <div className="hero">
      <div className="w" id="slides">
        {OFFERS.map((o, i) => (
          <div key={o.heading} className={"slide" + (i === cur ? " on" : "")}>
            <div>
              <span className="tag">{o.tag}</span>
              <h1>{o.heading}</h1>
              <p>{o.text}</p>
              <a className="btn w2" href="#shop">Learn More</a>
            </div>
            <div className="art">
              <div className="badge"><span>{o.badge}<small>{o.badgeSmall}</small></span></div>
            </div>
          </div>
        ))}
      </div>
      <div className="dots">
        {OFFERS.length > 1 &&
          OFFERS.map((o, i) => (
            <button key={o.heading} aria-label={`Slide ${i + 1}`} className={i === cur ? "on" : ""} onClick={() => setCur(i)} />
          ))}
      </div>
    </div>
  );
}

/* ---------- Product card ---------- */
function ProductCard({ p, onAdd, open }) {
  const [added, setAdded] = useState(false);
  const [tip, setTip] = useState(false); // lets touch screens (no hover) see the closed message after a tap
  const timer = useRef();
  const tipTimer = useRef();
  useEffect(() => () => { clearTimeout(timer.current); clearTimeout(tipTimer.current); }, []);

  const click = (btn) => {
    if (!open) {
      setTip(true);
      clearTimeout(tipTimer.current);
      tipTimer.current = setTimeout(() => setTip(false), 2600);
      return;
    }
    onAdd(p, btn, () => {
      setAdded(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setAdded(false), 900);
    });
  };

  return (
    <div className={"p" + (open ? "" : " closed") + (tip ? " tip-on" : "")}>
      <div className="im"><img src={p.img} alt={`Icey Drops ${p.name}`} loading="lazy" /></div>
      <div className="bd">
        <h3>{p.name}</h3>
        <small>{p.note}{p.price != null && <> &middot; KSh {p.price}</>}</small>
        <button
          className={"btn sm" + (open ? "" : " off")}
          aria-disabled={!open}
          aria-describedby={open ? undefined : `tip-${p.id}`}
          onClick={(e) => click(e.currentTarget)}
        >
          {open ? (added ? "Added ✓" : "Add to cart") : "Store closed"}
        </button>
      </div>
      {!open && <span className="tip" id={`tip-${p.id}`} role="tooltip">{CLOSED_TEXT}</span>}
    </div>
  );
}

/* ---------- Refill / purchase picker ---------- */
function Picker({ open, size, onPick, onClose }) {
  const firstBtn = useRef();
  useEffect(() => { if (open) firstBtn.current?.focus(); }, [open]);
  return (
    <div className={"pk" + (open ? " on" : "")} aria-hidden={!open} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pkb" role="dialog" aria-modal="true" aria-labelledby="pkt">
        <button type="button" className="x" aria-label="Close" onClick={onClose}>&times;</button>
        <h3 id="pkt">What would you like?</h3>
        <p>Choose how you want your {size}L water.</p>
        <button ref={firstBtn} type="button" className="btn" onClick={() => onPick("r" + size)}>Refill</button>
        <button type="button" className="btn" onClick={() => onPick("n" + size)}>Purchase bottle + water</button>
      </div>
    </div>
  );
}

/* ---------- Map: shows the pin and lets the customer drag it to the exact spot ---------- */
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
let leafletReady = null;
const loadLeaflet = () => {
  if (window.L) return Promise.resolve(window.L);
  if (leafletReady) return leafletReady;
  leafletReady = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet"; css.href = LEAFLET_CSS;
    document.head.appendChild(css);
    const s = document.createElement("script");
    s.src = LEAFLET_JS; s.async = true;
    s.onload = () => resolve(window.L);
    s.onerror = () => { leafletReady = null; reject(new Error("map failed")); };
    document.head.appendChild(s);
  });
  return leafletReady;
};

let googleReady = null;
const loadGoogle = () => {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (googleReady) return googleReady;
  googleReady = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_KEY)}&v=weekly`;
    s.async = true;
    s.onload = () => (window.google?.maps ? resolve(window.google.maps) : reject(new Error("no google")));
    s.onerror = () => { googleReady = null; reject(new Error("map failed")); };
    document.head.appendChild(s);
  });
  // Google calls this if the key is wrong or restricted
  window.gm_authFailure = () => { googleReady = null; window.__gmFail && window.__gmFail(); };
  return googleReady;
};

// Both engines expose the same tiny interface: { update(lat,lng,acc), destroy() }
async function makeGoogleMap(el, pin, moved) {
  const gm = await loadGoogle();
  const pos = { lat: pin.lat, lng: pin.lng };
  const map = new gm.Map(el, {
    center: pos, zoom: 18, gestureHandling: "greedy",
    mapTypeControl: true, streetViewControl: false, fullscreenControl: false,
  });
  const marker = new gm.Marker({ position: pos, map, draggable: true });
  const circle = new gm.Circle({ map, center: pos, radius: pin.acc || 0, strokeColor: "#1668d8", strokeWeight: 1, fillColor: "#1668d8", fillOpacity: 0.12, clickable: false });
  const set = (ll) => { marker.setPosition(ll); circle.setCenter(ll); circle.setRadius(0); moved(ll.lat(), ll.lng()); };
  marker.addListener("dragend", () => set(marker.getPosition()));
  map.addListener("click", (e) => set(e.latLng));
  return {
    update(lat, lng, acc) {
      const p = { lat, lng };
      marker.setPosition(p); circle.setCenter(p); circle.setRadius(acc || 0);
      map.panTo(p); if ((map.getZoom() || 0) < 17) map.setZoom(17);
    },
    destroy() { gm.event.clearInstanceListeners(map); el.innerHTML = ""; },
  };
}

async function makeLeafletMap(el, pin, moved) {
  const L = await loadLeaflet();
  const map = L.map(el, { zoomControl: true, attributionControl: true }).setView([pin.lat, pin.lng], 18);
  const layer = CARTO_KEY
    ? L.tileLayer(`https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(CARTO_KEY)}`, { subdomains: "abcd", maxZoom: 20, attribution: "&copy; OpenStreetMap contributors &copy; CARTO" })
    : L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" });
  layer.addTo(map);
  const icon = L.divIcon({ className: "mp-pin", html: "<span></span>", iconSize: [34, 44], iconAnchor: [17, 44] });
  const marker = L.marker([pin.lat, pin.lng], { icon, draggable: true }).addTo(map);
  const circle = L.circle([pin.lat, pin.lng], { radius: pin.acc || 0, color: "#1668d8", weight: 1, fillOpacity: 0.12 }).addTo(map);
  const set = (ll) => { marker.setLatLng(ll); circle.setRadius(0); moved(ll.lat, ll.lng); };
  marker.on("dragend", () => set(marker.getLatLng()));
  map.on("click", (e) => set(e.latlng));
  setTimeout(() => map.invalidateSize(), 250); // the cart drawer is sliding in
  return {
    update(lat, lng, acc) {
      marker.setLatLng([lat, lng]); circle.setLatLng([lat, lng]); circle.setRadius(acc || 0);
      map.setView([lat, lng], Math.max(map.getZoom(), 17));
    },
    destroy() { map.remove(); },
  };
}

function MapPicker({ pin, onMove, onFail }) {
  const box = useRef(null);
  const engine = useRef(null);
  const moveRef = useRef(onMove);
  moveRef.current = onMove;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let dead = false;
    const fail = () => { if (!dead) { setFailed(true); onFail(); } };
    const moved = (lat, lng) => moveRef.current(lat, lng);
    const startLeaflet = () => makeLeafletMap(box.current, pin, moved);
    const start = GOOGLE_MAPS_KEY
      ? makeGoogleMap(box.current, pin, moved).catch(() => { box.current.innerHTML = ""; return startLeaflet(); }) // bad key or blocked: fall back
      : startLeaflet();
    if (GOOGLE_MAPS_KEY) window.__gmFail = () => { if (!dead) { engine.current?.destroy?.(); engine.current = null; box.current && (box.current.innerHTML = ""); startLeaflet().then((e) => { if (dead) e.destroy(); else engine.current = e; }).catch(fail); } };
    start.then((e) => { if (dead) e.destroy(); else engine.current = e; }).catch(fail);
    return () => { dead = true; window.__gmFail = null; engine.current?.destroy?.(); engine.current = null; };
  }, []);

  // follow GPS refinements while the phone is still locking on
  useEffect(() => { engine.current?.update(pin.lat, pin.lng, pin.acc); }, [pin.lat, pin.lng, pin.acc]);

  if (failed) return null;
  return <div className="mp" ref={box} role="application" aria-label="Map showing your delivery spot" />;
}

/* ---------- Cart drawer ---------- */
function CartDrawer({ open, onClose, cart, setQty, storeOpen }) {
  const [f, setF] = useState({ name: "", phone: "", loc: "", notes: "" });
  const [err, setErr] = useState("");
  const autoLoc = useRef("");
  const [pin, setPin] = useState(null); // { lat, lng, acc }
  const [pinState, setPinState] = useState("idle"); // idle | loading | done | error
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  // Turn coordinates into a readable place name and drop it into "Delivery location"
  const nameThePlace = async (lat, lng) => {
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=en&lat=${lat}&lon=${lng}`
      );
      const d = await r.json();
      const a = d.address || {};
      const parts = [
        a.house_number && a.road ? `${a.house_number} ${a.road}` : a.road || a.amenity || a.building,
        a.neighbourhood || a.suburb || a.quarter,
        a.town || a.city || a.village || a.municipality,
      ].filter(Boolean);
      const name = (parts.length ? parts : String(d.display_name || "").split(",").slice(0, 3))
        .map((x) => x.trim()).filter((x, i, arr) => x && arr.indexOf(x) === i).join(", ");
      if (!name) return;
      // only fill if empty, or if we filled it earlier (never overwrite what the customer typed)
      setF((cur) => (!cur.loc.trim() || cur.loc === autoLoc.current ? { ...cur, loc: name } : cur));
      autoLoc.current = name;
    } catch (_) { /* offline or blocked: the map pin still works, customer can type */ }
  };

  // Listen to the GPS for a few seconds and keep the most accurate reading.
  // (The first reading is usually rough: a phone refines it as the GPS locks on.)
  const watchId = useRef(null);
  const manual = useRef(false);
  const [mapFailed, setMapFailed] = useState(false);
  const stopWatch = () => {
    if (watchId.current != null) { navigator.geolocation.clearWatch(watchId.current); watchId.current = null; }
  };
  useEffect(() => stopWatch, []);

  const getPin = () => {
    if (!navigator.geolocation) { setPinState("error"); return; }
    stopWatch();
    setPinState("loading");
    setPin(null);
    manual.current = false;
    let best = null, timer = null;
    const finish = () => {
      clearTimeout(timer);
      stopWatch();
      if (manual.current) return; // customer already placed the pin by hand
      if (!best) { setPinState("error"); return; }
      setPinState("done");
      nameThePlace(best.lat, best.lng);
    };
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        if (!best || accuracy < best.acc) {
          best = { lat, lng, acc: Math.round(accuracy) };
          setPin(best); // live update so the customer sees it improving
        }
        if (accuracy <= 10) finish(); // good enough, stop early
      },
      (err) => {
        // Permission denied: stop right away. Other errors can be momentary, so keep listening until the timer ends.
        if (err.code === 1) { best = null; finish(); }
      },
      { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 }
    );
    timer = setTimeout(finish, 20000); // never wait more than 20 seconds
  };
  const movePin = (lat, lng) => {
    manual.current = true;
    stopWatch();
    setPinState("done");
    setPin({ lat, lng, acc: 0, manual: true });
    nameThePlace(lat, lng);
  };
  const clearPin = () => { manual.current = false; stopWatch(); setPin(null); setPinState("idle"); };
  const lines = PRODUCTS.filter((p) => cart[p.id] > 0);

  const submit = (e) => {
    e.preventDefault();
    const name = f.name.trim(), phone = f.phone.trim(), loc = f.loc.trim(), notes = f.notes.trim();
    if (!lines.length) return setErr("Add at least one bottle to your cart.");
    if (!name) return setErr("Enter your name.");
    if (phone.replace(/\D/g, "").length < 9) return setErr("Enter a phone number we can reach.");
    if (!loc) return setErr("Enter your delivery location.");
    setErr("");
    let total = 0, priced = true;
    const items = lines.map((p) => {
      if (p.price == null) priced = false; else total += p.price * cart[p.id];
      return `• ${cart[p.id]} × ${p.name}`;
    }).join("\n");
    openWhatsApp(
      `Hello Icey Drops & Refill, I'd like to order:\n${items}${priced ? `\nTotal: KSh ${total.toLocaleString()}` : ""}` +
      `\n\nName: ${name}\nPhone: ${phone}\nDelivery location: ${loc}${pin ? `\nMap pin: https://www.google.com/maps?q=${pin.lat.toFixed(6)},${pin.lng.toFixed(6)}` : ""}${notes ? `\nNotes: ${notes}` : ""}`
    );
  };

  return (
    <>
      <div className={"ov" + (open ? " on" : "")} onClick={onClose} />
      <aside className={"dr" + (open ? " on" : "")} aria-label="Order cart" aria-hidden={!open}>
        <h3>Your order <button className="x" aria-label="Close cart" onClick={onClose}>&times;</button></h3>
        {!storeOpen && <p className="closedbar sm" role="status">{CLOSED_TEXT}</p>}
        <div>
          {lines.length ? lines.map((p) => (
            <div className="ci" key={p.id}>
              <span>{p.name}</span>
              <span className="q">
                <button type="button" aria-label="Fewer" onClick={() => setQty(p.id, -1)}>&minus;</button>
                <b>{cart[p.id]}</b>
                <button type="button" aria-label="More" disabled={!storeOpen} onClick={() => setQty(p.id, 1)}>+</button>
              </span>
            </div>
          )) : <p className="empty">Your cart is empty. Add bottles from the shop.</p>}
        </div>
        <form onSubmit={submit} noValidate style={{ marginTop: 14 }}>
          <label>Your name<input value={f.name} onChange={set("name")} autoComplete="name" /></label>
          <label>Phone number<input value={f.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" /></label>
          <label>Delivery location<input value={f.loc} onChange={set("loc")} placeholder="Estate, building, house number" /></label>
          <div className="pin">
            {pinState === "done" ? (
              <div className="pin-ok">
                <span>📍 Location pinned{pin.manual ? " (adjusted by you)" : pin.acc ? ` (±${pin.acc} m)` : ""}</span>
                <button type="button" onClick={clearPin}>Remove</button>
              </div>
            ) : (
              <button type="button" className="pin-btn" onClick={getPin} disabled={pinState === "loading"}>
                {pinState === "loading" ? `Finding your exact spot…${pin ? ` (±${pin.acc} m)` : ""}` : "📍 Pin my current location"}
              </button>
            )}
            {pin && (pinState === "loading" || pinState === "done") && <MapPicker pin={pin} onMove={movePin} onFail={() => setMapFailed(true)} />}
            <small>
              {pinState === "error"
                ? "Couldn't get your location. Allow location access, or just type it above."
                : pinState === "done" && mapFailed
                ? "Map couldn't load. Please check your internet, or type your exact spot above."
                : pinState === "done" && pin && pin.manual
                ? "Pin moved. Please add your house or building number above."
                : pinState === "done" && pin && pin.acc > 50
                ? `Rough location only (±${pin.acc} m). Drag the pin (or tap the map) to your exact spot.`
                : pinState === "done"
                ? "Is the pin on your spot? If not, drag it or tap the map. Then add your house or building number."
                : "Optional. Shows a map where you can fine-tune the pin so our rider finds you. We only receive it if you send your order."}
            </small>
          </div>
          <label>Notes (optional)<textarea value={f.notes} onChange={set("notes")} /></label>
          <div className="err" role="alert">{err}</div>
          <button className="btn wa" style={{ width: "100%", justifyContent: "center" }}>Send order on WhatsApp</button>
          <Consent action="sending your order" />
        </form>
      </aside>
    </>
  );
}

/* ---------- Contact: details + map on the left, message form on the right ---------- */
const I = ({ children }) => (
  <svg className="ci2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>
);
const IcPhone = () => <I><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></I>;
const IcPin = () => <I><path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.800 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></I>;
const IcWhatsApp = () => (
  <svg className="ci2 wa-ic" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

function ContactInfo() {
  return (
    <div className="cside">
      <div className="pn">
        <h3>Contact information</h3>
        <div className="info2">
          <div className="it"><IcPhone /><span><b>Phone</b><a href="tel:+254710747388">0710 747 388</a><a href="tel:+254143155549">0143 155 549</a></span></div>
          <div className="it"><IcPin /><span><b>Address</b>{MAP_LABEL}</span></div>
          <div className="it"><IcWhatsApp /><span><b>WhatsApp</b><a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener">Chat with us</a></span></div>
        </div>
      </div>
      <div className="pn">
        <h3>Delivery &amp; orders</h3>
        <div className="info3">
          <div><b>Delivery</b><span>Free, to your door</span></div>
          <div><b>Orders</b><span>Sent on WhatsApp</span></div>
          <div><b>Station</b><span>Walk-in refills</span></div>
        </div>
      </div>
    </div>
  );
}

function MapBox() {
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
      <a className="cdir" href={`https://www.google.com/maps/dir/?api=1&destination=${q}`} target="_blank" rel="noopener">Get directions &rarr;</a>
    </div>
  );
}

function Enquiry() {
  const [f, setF] = useState({ name: "", phone: "", loc: "", msg: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const name = f.name.trim(), phone = f.phone.trim(), loc = f.loc.trim(), msg = f.msg.trim();
    if (!msg) return setErr("Write your message first.");
    setErr("");
    openWhatsApp(
      `Hello Icey Drops & Refill,\n${msg}` +
      `${name ? `\n\nName: ${name}` : ""}${phone ? `\nPhone: ${phone}` : ""}${loc ? `\nLocation: ${loc}` : ""}`
    );
  };
  return (
    <form className="pn ef" onSubmit={submit} noValidate>
      <h3>Get in touch</h3>
      <div className="row2">
        <label>Name<input value={f.name} onChange={set("name")} autoComplete="name" placeholder="Enter your name" /></label>
        <label>Phone number<input value={f.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="Enter your phone number" /></label>
      </div>
      <label>Delivery location (optional)<input value={f.loc} onChange={set("loc")} placeholder="Estate or building" /></label>
      <label>Your message<textarea value={f.msg} onChange={set("msg")} rows={5} /></label>
      <div className="err" role="alert">{err}</div>
      <button className="send">Send message</button>
      <Consent action="sending a message" />
    </form>
  );
}

/* ---------- Static content ---------- */
const SERVICES = [
  ["🏠", "Home delivery", "Dispenser refills brought to your house, free of charge."],
  ["🏢", "Office supply", "Regular water for your team, ordered in a minute."],
  ["♻️", "Station refills", "Walk in with your bottle and refill it at the station."],
];
const WHY = [
  ["Purified & safe", "Clean, healthy drinking water for the whole family."],
  ["Free delivery", "No delivery charge on your order."],
  ["Order on WhatsApp", "No more calling every time you need water."],
  ["No contract", "Order only when you need water."],
  ["Reliable", "A local station you can count on."],
  ["Eco-friendly", "Refill and reuse your bottles."],
];
const STEPS = [
  ["Fill your cart", "Choose your bottles and how many you need."],
  ["Send on WhatsApp", "Add your name and location, then tap send."],
  ["We deliver", "We confirm your order and bring the water."],
];

/* ---------- Back to top ---------- */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const up = () => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: calm ? "auto" : "smooth" });
  };
  return (
    <button type="button" className={"totop" + (show ? " on" : "")} onClick={up} aria-label="Back to top" tabIndex={show ? 0 : -1}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    </button>
  );
}

/* ---------- App ---------- */
/* ---------- Reveal each section as the visitor scrolls ---------- */
// One animation per section: the section's content block fades and rises in as a whole.
// Nothing inside a section animates on its own, and section backgrounds stay put.
const REVEAL = ".strip > .w, main > section > .w, footer > .w:first-child";
function useScrollReveal() {
  useLayoutEffect(() => {
    if (!document.documentElement.classList.contains("js-rv")) return; // old browser or reduced motion: show everything
    const els = [...document.querySelectorAll(REVEAL)];
    els.forEach((el) => el.classList.add("rv"));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      }),
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ---------- Highlight the nav link of the section being viewed ---------- */
const NAV = [["top", "Home"], ["shop", "Shop"], ["services", "Services"], ["how", "How it works"], ["contact", "Contact"]];
function useActiveSection() {
  const [active, setActive] = useState("top");
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      let cur = "top";
      for (const [id] of NAV) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) cur = id;
      }
      // at the very bottom of the page the last section stays selected
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = "contact";
      setActive(cur);
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);
  return active;
}

function Home({ cart, setCart }) {
  useScrollReveal();
  const active = useActiveSection();
  // Links like /#contact: the page is drawn by React after load, so jump to the section ourselves
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, []);
  const [drawer, setDrawer] = useState(false);
  const [picker, setPicker] = useState(false);
  const [pickSize, setPickSize] = useState("20");
  const [menu, setMenu] = useState(false);
  const pending = useRef(null); // { btn, done } waiting on the picker
  const storeOpen = useStoreOpen(); // open 9:00 AM to 10:00 PM Kenya time

  // Nothing can be added while the store is closed (removing is still allowed)
  const bump = (id, d = 1) => {
    if (d > 0 && !storeOpen) return;
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + d) }));
  };
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  const onAdd = (p, btn, done) => {
    if (!storeOpen) return;
    if (p.ask) { pending.current = { btn, done }; setPickSize(p.ask === true ? "20" : p.ask); setPicker(true); return; }
    bump(p.id); done();
  };
  const closePicker = () => {
    setPicker(false);
    pending.current?.btn?.focus();
    pending.current = null;
  };
  // If the store closes while the picker is open, close the picker
  useEffect(() => { if (!storeOpen && picker) { setPicker(false); pending.current = null; } }, [storeOpen]);
  const pick = (id) => {
    bump(id);
    setPicker(false);
    pending.current?.done();
    pending.current = null;
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setDrawer(false); setMenu(false); if (picker) closePicker(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [picker]);

  return (
    <>
      <div className="top"><div className="w">
        <a href="tel:+254710747388">Call: 0710 747 388 &nbsp;|&nbsp; 0143 155 549</a>
        <span className="hide">Ongata Rongai, Mandela Road</span>
      </div></div>

      <header><div className="w nav">
        <a className="brand" href="#top">
          <img src="/logo.png" width="33" height="54" alt="Icey Drops logo" className="logo" />
          <span>Icey Drops &amp; Refill<small>Purified drinking water</small></span>
        </a>
        <nav id="mainnav" className={menu ? "open" : ""}>
          {NAV.map(([id, label]) => (
            <a key={id} href={`#${id}`} onClick={() => setMenu(false)} className={active === id ? "on" : ""} aria-current={active === id ? "true" : undefined}>{label}</a>
          ))}
        </nav>
        <div className="right">
          <button className="burger" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="mainnav" onClick={() => setMenu((m) => !m)}>
            <span /><span /><span />
          </button>
          <button className="btn sm cartbtn" aria-label="Open order cart" onClick={() => setDrawer(true)}>Cart<b>{count}</b></button>
        </div>
      </div></header>

      <main id="top">
        <Hero />

        <div className="strip"><div className="w">
          <div>
            <Icon><path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z" /></Icon>
            <span>100% purified<small>Safe and healthy</small></span>
          </div>
          <div>
            <Icon><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" /><path d="M8.5 12l2.5 2.5 4.5-5" /></Icon>
            <span>Premium quality<small>Trusted water</small></span>
          </div>
          <div>
            <Icon><path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2" /><path d="M20 4v5h-5M4 20v-5h5" /></Icon>
            <span>Refill &amp; reuse<small>A sustainable choice</small></span>
          </div>
        </div></div>

        <section className="about"><div className="w">
          <div>
            <span style={{ color: "var(--blue)", fontWeight: 600, fontSize: 14 }}>About us</span>
            <h2>Pure water for homes and businesses in Rongai</h2>
            <p>Icey Drops &amp; Refill is a purified drinking water station on Mandela Road. Bring your bottle for a refill, or order online and we bring fresh water to your door, free of charge.</p>
            <p>Pure. Clean. Safe. Every drop counts.</p>
            <a className="btn rect" href="#shop">Fast Delivery</a>
          </div>
          <div className="pic"><img src="/about.jpg" alt="Free delivery from Icey Drops & Refill" /></div>
        </div></section>

        <section className="alt" id="shop"><div className="w">
          <div className="sh"><span>Our products</span><h2>Delivered fresh to your door</h2><p>Add what you need to your cart, then send the order to us on WhatsApp.</p></div>
          {!storeOpen && (
            <p className="closedbar" role="status">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              <span>{CLOSED_TEXT}</span>
            </p>
          )}
          <div className="grid">
            {PRODUCTS.filter((p) => !p.hide).map((p) => <ProductCard key={p.id} p={p} onAdd={onAdd} open={storeOpen} />)}
          </div>
        </div></section>

        <section id="services"><div className="w">
          <div className="sh"><span>Services</span><h2>Water for every need</h2></div>
          <div className="svc">
            {SERVICES.map(([ico, h, t]) => (
              <div key={h}><div className="ico">{ico}</div><h3>{h}</h3><p>{t}</p></div>
            ))}
          </div>
        </div></section>

        <section className="alt"><div className="w">
          <div className="sh"><span>Why choose us</span><h2>Taste the difference</h2></div>
          <div className="why">{WHY.map(([h, t]) => <div key={h}><h3>{h}</h3><p>{t}</p></div>)}</div>
        </div></section>

        <section id="how"><div className="w">
          <div className="sh"><span>How we work</span><h2>Order in three steps</h2></div>
          <div className="steps">{STEPS.map(([h, t]) => <div key={h}><h3>{h}</h3><p>{t}</p></div>)}</div>
        </div></section>

        <section className="contact" id="contact"><div className="w">
          <div className="sh">
            <h2>Contact us</h2>
            <p>If you have any questions call us, send a message on WhatsApp or visit the station.</p>
          </div>
          <div className="cgr">
            <Enquiry />
            <ContactInfo />
          </div>
          <MapBox />
        </div></section>
      </main>

      <Footer />

      <a className="fab" href={`https://wa.me/${WHATSAPP}?text=Hi%20Icey%20Drops%2C%20I%27d%20like%20to%20order%20water.`} target="_blank" rel="noopener" aria-label="Order on WhatsApp">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>

      <BackToTop />
      <Picker open={picker} size={pickSize} onPick={pick} onClose={closePicker} />
      <CartDrawer open={drawer} onClose={() => setDrawer(false)} cart={cart} setQty={bump} storeOpen={storeOpen} />
    </>
  );
}

/* ---------- Simple hash routing: #/privacy and #/terms show the legal pages ---------- */
const parseRoute = () => {
  const h = window.location.hash;
  return h.startsWith("#/privacy") ? "privacy" : h.startsWith("#/terms") ? "terms" : "home";
};

export default function App() {
  const [route, setRoute] = useState(parseRoute);
  const [cart, setCart] = useState({}); // kept here so the cart survives a visit to the legal pages
  useEffect(() => {
    const on = () => setRoute(parseRoute());
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useLayoutEffect(() => {
    if (route !== "home") window.scrollTo({ top: 0, behavior: "instant" });
  }, [route]);
  return route === "home" ? <Home cart={cart} setCart={setCart} /> : <LegalPage doc={route} />;
}