import { useEffect, useRef, useState } from "react";
import { makeGoogleMap, makeLeafletMap } from "../lib/maps";

/** Draggable-pin map. Tries Google Maps first, falls back to Leaflet/CARTO. */
export default function MapPicker({ pin, onMove, onFail }) {
  const box = useRef(null);
  const engine = useRef(null);
  const moveRef = useRef(onMove);
  moveRef.current = onMove;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let dead = false;
    const fail = () => {
      if (!dead) {
        setFailed(true);
        onFail();
      }
    };
    const moved = (lat, lng) => moveRef.current(lat, lng);
    const startLeaflet = () => makeLeafletMap(box.current, pin, moved);
    const start = makeGoogleMap(box.current, pin, moved).catch(() => {
      box.current.innerHTML = "";
      return startLeaflet();
    });
    // Google calls this (via gm_authFailure) when the API key is rejected after load.
    window.__gmFail = () => {
      if (dead) return;
      engine.current?.destroy?.();
      engine.current = null;
      if (box.current) box.current.innerHTML = "";
      startLeaflet()
        .then((e) => {
          if (dead) e.destroy();
          else engine.current = e;
        })
        .catch(fail);
    };
    start
      .then((e) => {
        if (dead) e.destroy();
        else engine.current = e;
      })
      .catch(fail);
    return () => {
      dead = true;
      window.__gmFail = null;
      engine.current?.destroy?.();
      engine.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    engine.current?.update(pin.lat, pin.lng, pin.acc);
  }, [pin.lat, pin.lng, pin.acc]);

  useEffect(() => {
    if (!box.current || typeof ResizeObserver === "undefined") return;
    let t;
    const ro = new ResizeObserver(() => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (engine.current && engine.current.resize) engine.current.resize();
      }, 80);
    });
    ro.observe(box.current);
    return () => {
      clearTimeout(t);
      ro.disconnect();
    };
  }, []);

  // Last resort when neither interactive map can load: a plain Google embed (no API key needed).
  if (failed)
    return (
      <div className="mp">
        <iframe
          title="Map of your delivery spot"
          src={`https://www.google.com/maps?q=${pin.lat},${pin.lng}&z=17&output=embed`}
          style={{ border: 0, width: "100%", height: "100%" }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  return <div className="mp" ref={box} role="application" aria-label="Map showing your delivery spot" />;
}
