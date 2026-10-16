import { useEffect, useRef, useState } from "react";
import BackToTop from "../components/BackToTop";
import ContactInfo from "../components/ContactInfo";
import Enquiry from "../components/Enquiry";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import MapBox from "../components/MapBox";
import Picker from "../components/Picker";
import ProductCard from "../components/ProductCard";
import { IcCart, Icon, WhatsAppGlyph } from "../components/icons";
import logoImg from "../assets/logo.png";
import aboutImg from "../assets/about.jpg";
import { CLOSED_TEXT, WHATSAPP } from "../config";
import { NAV, PRODUCTS, SERVICES, STEPS, WHY } from "../data/content";
import { useActiveSection } from "../hooks/useActiveSection";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { useStoreOpen } from "../hooks/useStoreOpen";
import { goCart } from "../lib/utils";

export default function Home({ cart, setCart }) {
  useScrollReveal();
  const active = useActiveSection();

  // Honour deep links like /#shop on first load.
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (id) requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
  }, []);

  const [picker, setPicker] = useState(false);
  const [pickerProduct, setPickerProduct] = useState(null); // kept after close so the popup text doesn't flicker while it fades
  const [menu, setMenu] = useState(false);
  const pending = useRef(null);
  const storeOpen = useStoreOpen();

  const bump = (id, d = 1) => {
    if (d > 0 && !storeOpen) return;
    setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] || 0) + d) }));
  };
  const count = Object.values(cart).reduce((a, b) => a + b, 0);

  const onAdd = (p, btn, done) => {
    if (!storeOpen) return;
    if (p.ask) {
      pending.current = { btn, done };
      setPickerProduct(p);
      setPicker(true);
      return;
    }
    bump(p.id);
    done();
    goCart();
  };
  const closePicker = () => {
    setPicker(false);
    pending.current?.btn?.focus();
    pending.current = null;
  };
  useEffect(() => {
    if (!storeOpen && picker) {
      setPicker(false);
      pending.current = null;
    }
  }, [storeOpen]); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (id) => {
    bump(id);
    setPicker(false);
    pending.current?.done();
    pending.current = null;
    goCart();
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenu(false);
        if (picker) closePicker();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [picker]);

  return (
    <>
      <div className="top">
        <div className="w">
          <a href="tel:+254710747388">Call: 0710 747 388 &nbsp;|&nbsp; 0143 155 549</a>
          <span className="hide">Ongata Rongai, Mandela Road</span>
        </div>
      </div>

      <header>
        <div className="w nav">
          <a className="brand" href="#top">
            <img src={logoImg} width="33" height="54" alt="Icey Drops logo" className="logo" />
            <span>
              Icey Drops & Refill
              <small>Purified drinking water</small>
            </span>
          </a>
          <nav id="mainnav" className={menu ? "open" : ""}>
            {NAV.map(([id, label]) => (
              <a key={id} href={`#${id}`} onClick={() => setMenu(false)} className={active === id ? "on" : ""} aria-current={active === id ? "true" : undefined}>
                {label}
              </a>
            ))}
          </nav>
          <div className="right">
            <button className="burger" aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu} aria-controls="mainnav" onClick={() => setMenu((m) => !m)}>
              <span />
              <span />
              <span />
            </button>
            <button className="btn sm cartbtn" aria-label={count ? `Open cart, ${count} item${count === 1 ? "" : "s"}` : "Open cart"} onClick={goCart}>
              <IcCart />
              {count > 0 && <b key={count}>{count}</b>}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        <Hero />

        <div className="strip">
          <div className="w">
            <div>
              <Icon>
                <path d="M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z" />
              </Icon>
              <span>
                100% purified<small>Safe and healthy</small>
              </span>
            </div>
            <div>
              <Icon>
                <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" />
                <path d="M8.5 12l2.5 2.5 4.5-5" />
              </Icon>
              <span>
                Premium quality<small>Trusted water</small>
              </span>
            </div>
            <div>
              <Icon>
                <path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2" />
                <path d="M20 4v5h-5M4 20v-5h5" />
              </Icon>
              <span>
                Refill & reuse<small>A sustainable choice</small>
              </span>
            </div>
          </div>
        </div>

        <section className="about">
          <div className="w">
            <div>
              <span style={{ color: "var(--blue)", fontWeight: 600, fontSize: 14 }}>About us</span>
              <h2>Pure water for homes and businesses in Rongai</h2>
              <p>
                Icey Drops & Refill is a purified drinking water station on Mandela Road. Bring your bottle for a refill, or order online and we bring fresh
                water to your door, free of charge.
              </p>
              <p>Pure. Clean. Safe. Every drop counts.</p>
              <a className="btn rect" href="#shop">
                Fast Delivery
              </a>
            </div>
            <div className="pic">
              <img src={aboutImg} alt="Free delivery from Icey Drops & Refill" />
            </div>
          </div>
        </section>

        <section className="alt" id="shop">
          <div className="w">
            <div className="sh">
              <span>Our products</span>
              <h2>Delivered fresh to your door</h2>
              <p>Add what you need to your cart, then send the order to us on WhatsApp.</p>
            </div>
            {!storeOpen && (
              <p className="closedbar" role="status">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                <span>{CLOSED_TEXT}</span>
              </p>
            )}
            <div className="grid">
              {PRODUCTS.filter((p) => !p.hide).map((p) => (
                <ProductCard key={p.id} p={p} onAdd={onAdd} open={storeOpen} />
              ))}
            </div>
          </div>
        </section>

        <section id="services">
          <div className="w">
            <div className="sh">
              <span>Services</span>
              <h2>Water for every need</h2>
            </div>
            <div className="svc">
              {SERVICES.map(([ico, h, t]) => (
                <div key={h}>
                  <div className="ico">{ico}</div>
                  <h3>{h}</h3>
                  <p>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="alt">
          <div className="w">
            <div className="sh">
              <span>Why choose us</span>
              <h2>Taste the difference</h2>
            </div>
            <div className="why">
              {WHY.map(([h, t]) => (
                <div key={h}>
                  <h3>{h}</h3>
                  <p>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how">
          <div className="w">
            <div className="sh">
              <span>How we work</span>
              <h2>Order in three steps</h2>
            </div>
            <div className="steps">
              {STEPS.map(([h, t]) => (
                <div key={h}>
                  <h3>{h}</h3>
                  <p>{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact" id="contact">
          <div className="w">
            <div className="sh">
              <h2>Contact us</h2>
              <p>If you have any questions call us, send a message on WhatsApp or visit the station.</p>
            </div>
            <div className="cgr">
              <Enquiry />
              <ContactInfo />
            </div>
          </div>
        </section>

        <section className="mapsec" id="map" aria-label="Find us on Google Maps">
          <div className="w">
            <MapBox />
          </div>
        </section>
      </main>

      <Footer />

      <a className="fab" href={`https://wa.me/${WHATSAPP}?text=Hi%20Icey%20Drops%2C%20I%27d%20like%20to%20order%20water.`} target="_blank" rel="noopener" aria-label="Order on WhatsApp">
        <WhatsAppGlyph />
      </a>
      <BackToTop />
      <Picker open={picker} product={pickerProduct} onPick={pick} onClose={closePicker} />
    </>
  );
}
