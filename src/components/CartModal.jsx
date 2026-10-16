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
      <span className="cp-rad" />
      <span className="cp-ot">
        {label}
        <small>{small}</small>
        <i>•</i>
        <b>FREE</b>
        {sub && <span className="sub">{sub}</span>}
      </span>
    </label>
  );

  return (
    <div
      className={"cm" + (shown ? " on" : "")}
      onMouseDown={(ev) => {
        if (ev.target === ev.currentTarget) onClose();
      }}
    >
      <div className={"cm-box" + (empty ? " empty" : "")} role="dialog" aria-modal="true" aria-labelledby="cmt" tabIndex={-1} ref={box}>
        <form className="cm-form" onSubmit={submit} noValidate>
          <div className="cm-head">
            <h2 id="cmt">
              <IcCart />
              My Cart
              {count > 0 && <span className="cm-n">{count}</span>}
            </h2>
            <button type="button" className="cm-close" aria-label="Close cart" onClick={onClose}>
              ×
            </button>
          </div>

          <div className="cm-body">
            {!storeOpen && (
              <p className="closedbar" role="status">
                {CLOSED_TEXT}
              </p>
            )}

            {empty ? (
              <div className="cm-empty">
                <IcCart />
                <p>Your cart is empty. Add bottles from the shop.</p>
                <button type="button" className="btn" onClick={onClose}>
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cm-items">
                  {lines.map((p) => (
                    <div className="cm-row" key={p.id}>
                      <div className="cm-img">
                        <img src={p.img} alt={`Icey Drops ${p.name}`} />
                      </div>
                      <div className="cm-info">
                        <h3>{p.name}</h3>
                        <small>
                          {p.note}
                          {p.price != null ? ` · ${money(p.price)}` : " · Pay after delivery"}
                        </small>
                        <button type="button" className="cm-rm" aria-label={`Remove ${p.name}`} onClick={() => remove(p.id)}>
                          Remove
                        </button>
                      </div>
                      <div className="cm-ctl">
                        <div className="cm-qty">
                          <button type="button" aria-label={`Fewer ${p.name}`} onClick={() => setQty(p.id, -1)}>
                            −
                          </button>
                          <b>{cart[p.id]}</b>
                          <button type="button" aria-label={`More ${p.name}`} disabled={!storeOpen} onClick={() => setQty(p.id, 1)}>
                            +
                          </button>
                        </div>
                        {p.price != null && <span className="cm-line">{money(p.price * cart[p.id])}</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" className="cm-more" onClick={onClose}>
                  + Add more items
                </button>

                <div className="cm-sec">
                  <h3>How should we get it to you?</h3>
                  {shipOpt("pickup", "Store pickup ", `(Walk in, ${MAP_LABEL})`)}
                  {shipOpt(
                    "delivery",
                    "Delivery to my location ",
                    "(To your door)",
                    mode === "delivery" && f.loc.trim() ? `At ${f.loc.trim()}` : "Add your spot below so our rider finds you."
                  )}
                </div>

                <div className="cm-sec cm-fields">
                  <h3>Your details</h3>
                  <div className="cm-2">
                    <label>
                      Your name
                      <input value={f.name} onChange={set("name")} autoComplete="name" />
                    </label>
                    <label>
                      Phone number
                      <input value={f.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" />
                    </label>
                  </div>

                  {mode === "delivery" && (
                    <>
                      <label>
                        Delivery location (required)
                        <input value={f.loc} onChange={set("loc")} placeholder="Estate, building, house number" />
                      </label>
                      <div className="pin">
                        {pinState === "done" ? (
                          <div className="pin-ok">
                            <span>
                              📍 Location pinned{pin.manual ? " (adjusted by you)" : pin.acc ? ` (±${pin.acc} m)` : ""}
                            </span>
                            <button type="button" onClick={clearPin}>
                              Remove
                            </button>
                          </div>
                        ) : (
                          <button type="button" className="pin-btn" onClick={getPin} disabled={pinState === "loading"}>
                            {pinState === "loading" ? `Finding your exact spot…${pin ? ` (±${pin.acc} m)` : ""}` : "📍 Pin my current location (required)"}
                          </button>
                        )}
                        <div className={"mapwrap" + (mapFull ? " full" : "")}>
                          <MapPicker pin={mapPin} onMove={movePin} onFail={() => setMapFailed(true)} />
                          {!mapFailed && (
                            <button type="button" className="map-exp" onClick={() => setMapFull((v) => !v)} aria-label={mapFull ? "Close full-screen map" : "Expand map"}>
                              {mapFull ? "✓ Done" : "⤢ Expand map"}
                            </button>
                          )}
                          {mapFull && (
                            <div className="map-bar" role="status">
                              <b>Delivery spot</b>
                              {f.loc.trim() || "Drag the pin or tap the map to your exact spot."}
                            </div>
                          )}
                        </div>
                        <small>{pinHint}</small>
                      </div>
                    </>
                  )}

                  <label>
                    Notes (optional)
                    <textarea value={f.notes} onChange={set("notes")} />
                  </label>
                </div>
              </>
            )}
          </div>

          {!empty && (
            <div className="cm-foot">
              <div className="cm-sum">
                <span>
                  Total
                  <small>{`${count} item${count === 1 ? "" : "s"} · Free shipping`}</small>
                </span>
                <b>{allPriced ? money(total) : "Pay after delivery"}</b>
              </div>
              <div className="err" role="alert">
                {err}
              </div>
              <button className="cp-go" type="submit">
                Place order
              </button>
              <Consent action="placing your order" />
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
