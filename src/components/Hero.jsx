import { useEffect, useState } from "react";
import { OFFERS } from "../data/content";

export default function Hero() {
  const [cur, setCur] = useState(0);
  useEffect(() => {
    if (OFFERS.length < 2 || window.matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const t = setInterval(() => setCur((c) => (c + 1) % OFFERS.length), 6e3);
    return () => clearInterval(t);
  }, [cur]);
  return (
    <div className="hero">
      <div className="w" id="slides">
        {OFFERS.map((o, i) => (
          <div className={"slide" + (i === cur ? " on" : "")} key={o.heading}>
            <div>
              <span className="tag">
                {o.tag.split("|").map((t, k) => (
                  <span className="tl" key={k}>
                    {t}
                  </span>
                ))}
              </span>
              <h1>{o.heading}</h1>
              <p>{o.text}</p>
              <a className="btn w2" href="#shop">
                Learn More
              </a>
            </div>
            <div className="art">
              <div className="badge">
                <span>
                  {o.badge}
                  <small>{o.badgeSmall}</small>
                </span>
              </div>
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
