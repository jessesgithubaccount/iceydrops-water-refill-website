import { useEffect, useRef, useState } from "react";
import { CLOSED_TEXT, MAP_LABEL, MAP_QUERY } from "../config";
import { PRODUCTS } from "../data/content";
import { useStoreOpen } from "../hooks/useStoreOpen";
import { money, openWhatsApp } from "../lib/utils";
import Consent from "./Consent";
import MapPicker from "./MapPicker";
import { IcCart } from "./icons";

const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function CartModal({ cart, setCart, onClose }) {
  const storeOpen = useStoreOpen();
  const [mode, setMode] = useState("delivery");
  const [f, setF] = useState({ name: "", phone: "", loc: "", notes: "" });
  const [err, setErr] = useState("");
  const autoLoc = useRef("");
  const [pin, setPin] = useState(null);
  const [pinState, setPinState] = useState("idle"); // idle | loading | done | error
  const set = (k) => (e) => {
    setF({ ...f, [k]: e.target.value });
    setErr("");
  };

  // Reverse-geocode the pin into a readable place name (OpenStreetMap Nominatim).
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
        .map((x) => x.trim())
        .filter((x, i, arr) => x && arr.indexOf(x) === i)
        .join(", ");
      if (!name) return;
      // Only overwrite the field if the user hasn't typed their own text.
      setF((cur) => (!cur.loc.trim() || cur.loc === autoLoc.current ? { ...cur, loc: name } : cur));
      autoLoc.current = name;
    } catch (_) {
      /* naming is best-effort */
    }
  };

  const watchId = useRef(null);
  const manual = useRef(false);
  const [mapFailed, setMapFailed] = useState(false);
  const stopWatch = () => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };
  useEffect(() => stopWatch, []);

  const getPin = () => {
    if (!navigator.geolocation) {
      setPinState("error");
      return;
    }
    stopWatch();
    setErr("");
    setPinState("loading");
    setPin(null);
    setMapFailed(false);
    manual.current = false;
    let best = null,
      timer = null;
    const finish = () => {
      clearTimeout(timer);
      stopWatch();
      if (manual.current) return;
      if (!best) {
        setPinState("error");
        return;
      }
      setPinState("done");
      nameThePlace(best.lat, best.lng);
    };
    watchId.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        if (!best || accuracy < best.acc) {
          best = { lat, lng, acc: Math.round(accuracy) };
          setPin(best);
        }
        if (accuracy <= 10) finish();
      },
      (e) => {
        if (e.code === 1) {
          best = null;
          finish();
        }
      },
      { enableHighAccuracy: true, timeout: 25e3, maximumAge: 0 }
    );
    timer = setTimeout(finish, 2e4);
  };

  const movePin = (lat, lng) => {
    manual.current = true;
    stopWatch();
    setPinState("done");
    setPin({ lat, lng, acc: 0, manual: true });
    setErr("");
    nameThePlace(lat, lng);
  };
  const clearPin = () => {
    manual.current = false;
    stopWatch();
    setPin(null);
    setPinState("idle");
  };
  const choose = (m) => {
    setMode(m);
    if (m === "pickup") stopWatch();
  };

  const lines = PRODUCTS.filter((p) => cart[p.id] > 0);
  const count = lines.reduce((a, p) => a + cart[p.id], 0);
  const allPriced = lines.length > 0 && lines.every((p) => p.price != null);
  const total = lines.reduce((a, p) => a + (p.price || 0) * cart[p.id], 0);
  const setQty = (id, d) => {
    if (d > 0 && !storeOpen) return;
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + d) }));
  };
  const remove = (id) => setCart((c) => ({ ...c, [id]: 0 }));
  // Cancel the whole order: empty the cart (back to 0) and close the pop-up.
  const cancelOrder = () => {
    setCart({});
    onClose();
  };

  const submit = (e) => {
    e.preventDefault();
    const name = f.name.trim(),
      phone = f.phone.trim(),
      loc = f.loc.trim(),
      notes = f.notes.trim();
    if (!lines.length) return setErr("Add at least one bottle to your cart.");
    if (!name) return setErr("Enter your name.");
    if (phone.replace(/\D/g, "").length < 9) return setErr("Enter a phone number we can reach.");
    if (mode === "delivery" && !loc) return setErr("Enter your delivery location.");
    if (mode === "delivery" && !pin && !mapFailed) return setErr("Pin your location so our rider can find you.");
    setErr("");
    const items = lines.map((p) => `• ${cart[p.id]} × ${p.name}`).join("\n");
    const ship =
      mode === "pickup"
        ? `Shipping: Store pickup (${MAP_LABEL})`
        : `Shipping: Delivery\nDelivery location: ${loc}${
            pin
              ? `\nPinned location: https://www.google.com/maps?q=${pin.lat.toFixed(6)},${pin.lng.toFixed(6)}${
                  pin.manual ? " (set by customer on map)" : pin.acc ? ` (GPS ±${pin.acc} m)` : ""
                }`
              : ""
          }`;
    openWhatsApp(
      `Hello Icey Drops & Refill, I'd like to order:\n${items}${allPriced ? `\nTotal: ${money(total)}` : ""}\n\nName: ${name}\nPhone: ${phone}\n${ship}${
        notes ? `\nNotes: ${notes}` : ""
      }`
    );
  };

  // --- modal behaviour: scroll lock, focus trap, Escape ---
  const [mapFull, setMapFull] = useState(false);
  const [shown, setShown] = useState(false);
  const box = useRef(null);
  const mapFullRef = useRef(false);
  mapFullRef.current = mapFull;
  const closeFn = useRef(onClose);
  closeFn.current = onClose;

  useEffect(() => {
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => {
      setShown(true);
      if (box.current) box.current.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      if (prevFocus && prevFocus.focus) prevFocus.focus({ preventScroll: true });
    };
  }, []);

  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        if (mapFullRef.current) setMapFull(false);
        else closeFn.current();
        return;
      }
      if (ev.key !== "Tab" || !box.current) return;
      const els = Array.from(box.current.querySelectorAll(FOCUSABLE)).filter((n) => n.getClientRects().length);
      if (!els.length) return;
      const first = els[0],
        last = els[els.length - 1],
        cur = document.activeElement;
      if (ev.shiftKey && (cur === first || cur === box.current)) {
        ev.preventDefault();
        last.focus();
      } else if (!ev.shiftKey && cur === last) {
        ev.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!pin || pinState === "idle" || pinState === "error") setMapFull(false);
  }, [pin, pinState]);

  const pinHint =
    pinState === "error"
      ? "Couldn't get your location. Allow location access and try again, or tap the map / drag the pin to your exact spot."
      : pinState === "done" && mapFailed
      ? "Map couldn't load, but your GPS pin is saved. Add your house or building number above."
      : pinState === "done" && pin && pin.manual
      ? "Pin moved. Please add your house or building number above."
      : pinState === "done" && pin && pin.acc > 50
      ? `Rough location only (±${pin.acc} m). Drag the pin (or tap the map) to your exact spot.`
      : pinState === "done"
      ? "Is the pin on your spot? If not, drag it or tap the map. Then add your house or building number."
      : "Required for delivery. Tap \"Pin my current location\", or tap the map / drag the pin to your exact spot. We only receive it if you send your order.";

  // The map is always on screen in delivery mode. Until the customer pins, it just shows the station area.
  const [sLat, sLng] = MAP_QUERY.split(",").map(Number);
  const mapPin = pin || { lat: sLat, lng: sLng, acc: 0, zoom: 15 };

  const empty = lines.length === 0;

  // Plain render helper (not a component) so the radios keep focus across re-renders.
  const shipOpt = (k, label, small, sub) => (
    <label key={k} className={"cp-opt" + (mode === k ? " on" : "")}>
      <input type="radio" name="ship" className="vh" checked={mode === k} onChange={() => choose(k)} />
      <span className="cp-rad" aria-hidden="true" />
      <span className="cp-ot">
        <b>{label}</b>
        {small && (
          <>
            <i>•</i>
            <small>{small}</small>
          </>
        )}
        <span className="sub">{sub}</span>
      </span>
    </label>
  );

  return (
    <div
      className={"cm" + (shown ? " on" : "")}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={"cm-box" + (empty ? " empty" : "")}
        ref={box}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Your cart"
      >
        <div className="cm-head">
          <h2>
            <IcCart />
            Your cart
            {count > 0 && <span className="cm-n">{count}</span>}
          </h2>
          <button type="button" className="cm-close" aria-label="Close cart" onClick={onClose}>
            ×
          </button>
        </div>

        {empty ? (
          <div className="cm-body">
            <div className="cm-empty">
              <IcCart />
              <p>Your cart is empty.</p>
              <button type="button" className="btn" onClick={onClose}>
                Browse our water
              </button>
            </div>
          </div>
        ) : (
          <form className="cm-form" onSubmit={submit} noValidate>
            <div className="cm-body">
              {!storeOpen && (
                <p className="closedbar" role="status">
                  {CLOSED_TEXT}
                </p>
              )}

              {lines.map((p) => (
                <div className="cm-row" key={p.id}>
                  <div className="cm-img">
                    <img src={p.img} alt="" />
                  </div>
                  <div className="cm-info">
                    <h3>{p.name}</h3>
                    <small>{p.note}</small>
                    <button type="button" className="cm-rm" onClick={() => remove(p.id)}>
                      Remove
                    </button>
                  </div>
                  <div className="cm-ctl">
                    <div className="cm-qty">
                      <button type="button" aria-label={`Fewer ${p.name}`} onClick={() => setQty(p.id, -1)}>
                        −
                      </button>
                      <b>{cart[p.id]}</b>
                      <button
                        type="button"
                        aria-label={`More ${p.name}`}
                        disabled={!storeOpen}
                        onClick={() => setQty(p.id, 1)}
                      >
                        +
                      </button>
                    </div>
                    {p.price != null && <span className="cm-line">{money(p.price * cart[p.id])}</span>}
                  </div>
                </div>
              ))}

              <div className="cm-actions">
                <button type="button" className="cm-more" onClick={onClose}>
                  + Add more bottles
                </button>
                <button type="button" className="cm-cancel" onClick={cancelOrder}>
                  Cancel order
                </button>
              </div>

              <div className="cm-sec">
                <h3>How would you like to get it?</h3>
                {shipOpt("delivery", "Delivery", "Free", "We bring it to your door")}
                {shipOpt("pickup", "Store pickup", "Free", MAP_LABEL)}
              </div>

              <div className="cm-fields">
                <div className="cm-2">
                  <label>
                    Name
                    <input type="text" value={f.name} onChange={set("name")} autoComplete="name" placeholder="Your name" />
                  </label>
                  <label>
                    Phone
                    <input
                      type="tel"
                      inputMode="tel"
                      value={f.phone}
                      onChange={set("phone")}
                      autoComplete="tel"
                      placeholder="07xx xxx xxx"
                    />
                  </label>
                </div>

                {mode === "delivery" && (
                  <>
                    <label>
                      Delivery location
                      <input
                        type="text"
                        value={f.loc}
                        onChange={set("loc")}
                        autoComplete="street-address"
                        placeholder="Estate, street, house / building no."
                      />
                    </label>

                    <div className="pin">
                      {pinState === "done" && pin ? (
                        <div className="pin-ok">
                          <span>✓ Location pinned</span>
                          <button type="button" onClick={clearPin}>
                            Clear
                          </button>
                        </div>
                      ) : (
                        <button type="button" className="pin-btn" onClick={getPin} disabled={pinState === "loading"}>
                          {pinState === "loading" ? "Finding you…" : "📍 Pin my current location"}
                        </button>
                      )}
                      <small>{pinHint}</small>
                    </div>

                    <div className={"mapwrap" + (mapFull ? " full" : "")}>
                      <button
                        type="button"
                        className="map-exp"
                        onClick={() => setMapFull((v) => !v)}
                        aria-label={mapFull ? "Close full-screen map" : "Open full-screen map"}
                      >
                        {mapFull ? "Done" : "⤢ Full screen"}
                      </button>
                      <MapPicker pin={mapPin} onMove={movePin} onFail={() => setMapFailed(true)} />
                      <div className="map-bar">
                        <b>Delivery location</b>
                        {f.loc || "Tap the map or drag the pin to your spot"}
                      </div>
                    </div>
                  </>
                )}

                <label>
                  Notes (optional)
                  <textarea rows={2} value={f.notes} onChange={set("notes")} placeholder="Gate colour, landmark, best time…" />
                </label>
              </div>
            </div>

            <div className="cm-foot">
              <div className="err" role="alert">
                {err}
              </div>
              <div className="cm-sum">
                <span>
                  Total
                  <small>
                    {count} item{count === 1 ? "" : "s"} • Free delivery
                  </small>
                </span>
                <b>{allPriced ? money(total) : "—"}</b>
              </div>
              <button type="submit" className="cp-go">
                <span>Send order on WhatsApp</span>
                <span>→</span>
              </button>
              <Consent action="sending your order" />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
