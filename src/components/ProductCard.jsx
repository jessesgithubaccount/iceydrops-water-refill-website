import { useEffect, useRef, useState } from "react";
import { CLOSED_TEXT } from "../config";
import { IcCart } from "./icons";

export default function ProductCard({ p, onAdd, open }) {
  const [added, setAdded] = useState(false);
  const [tip, setTip] = useState(false);
  const timer = useRef();
  const tipTimer = useRef();
  useEffect(
    () => () => {
      clearTimeout(timer.current);
      clearTimeout(tipTimer.current);
    },
    []
  );
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
      <div className="im">
        <img src={p.img} alt={`Icey Drops ${p.name}`} loading="lazy" />
      </div>
      <div className="bd">
        <h3>{p.name}</h3>
        <small>
          {p.note}
          {p.price != null && <> · KSh {p.price}</>}
        </small>
        <button
          className={"btn sm" + (open ? "" : " off")}
          aria-disabled={!open}
          aria-describedby={open ? undefined : `tip-${p.id}`}
          onClick={(e) => click(e.currentTarget)}
        >
          {open ? (
            added ? (
              "Added ✓"
            ) : (
              <>
                <IcCart />
                Add to cart
              </>
            )
          ) : (
            "Store closed"
          )}
        </button>
      </div>
      {!open && (
        <span className="tip" id={`tip-${p.id}`} role="tooltip">
          {CLOSED_TEXT}
        </span>
      )}
    </div>
  );
}
