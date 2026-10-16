import logoImg from "../assets/logo.png";

export default function Footer() {
  return (
    <footer>
      <div className="w">
        <div>
          <img src={logoImg} width="51" height="84" alt="Icey Drops logo" className="logo flogo" loading="lazy" />
          <h3>Icey Drops & Refill</h3>
          <p>Purified drinking water for homes and offices in Ongata Rongai. Free delivery.</p>
        </div>
        <div>
          <h3>Quick links</h3>
          <a href="#shop">Shop</a>
          <a href="#services">Services</a>
          <a href="#how">How it works</a>
          <a href="#contact">Contact</a>
        </div>
        <div>
          <h3>Visit or call</h3>
          <p>Ongata Rongai, Mandela Road</p>
          <a href="tel:+254710747388">0710 747 388</a>
          <a href="tel:+254143155549">0143 155 549</a>
        </div>
      </div>
      <div className="w copy">
        © {new Date().getFullYear()} Icey Drops & Refill. All rights reserved.
        <span className="legal-links">
          <a href="#/privacy">Privacy Policy</a>
          <a href="#/terms">Terms of Service</a>
        </span>
      </div>
    </footer>
  );
}
