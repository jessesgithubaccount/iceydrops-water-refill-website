import { useEffect, useRef } from "react";

export default function Picker({ open, product, onPick, onClose }) {
  const [refillId, newId] = product?.ask || [];
  const firstBtn = useRef();
  useEffect(() => {
    if (open) firstBtn.current?.focus();
  }, [open]);
  return (
    <div className={"pk" + (open ? " on" : "")} aria-hidden={!open} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="pkb" role="dialog" aria-modal="true" aria-labelledby="pkt">
        <button type="button" className="x" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <h3 id="pkt">What would you like?</h3>
        <p>Choose how you want your {product?.size} water.</p>
        <button ref={firstBtn} type="button" className="btn" onClick={() => onPick(refillId)}>
          Refill
        </button>
        <button type="button" className="btn" onClick={() => onPick(newId)}>
          Purchase bottle + water
        </button>
      </div>
    </div>
  );
}
