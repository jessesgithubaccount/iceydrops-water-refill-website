import { MAP_LABEL, WHATSAPP } from "../config";
import { IcPhone, IcPin, IcWhatsApp } from "./icons";

export default function ContactInfo() {
  return (
    <div className="cside">
      <div className="pn">
        <h3>Contact information</h3>
        <div className="info2">
          <div className="it">
            <IcPhone />
            <span>
              <b>Phone</b>
              <a href="tel:+254710747388">0710 747 388</a>
              <a href="tel:+254143155549">0143 155 549</a>
            </span>
          </div>
          <div className="it">
            <IcPin />
            <span>
              <b>Address</b>
              {MAP_LABEL}
            </span>
          </div>
          <div className="it">
            <IcWhatsApp />
            <span>
              <b>WhatsApp</b>
              <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener">
                Chat with us
              </a>
            </span>
          </div>
        </div>
      </div>
      <div className="pn">
        <h3>Delivery & orders</h3>
        <div className="info3">
          <div>
            <b>Delivery</b>
            <span>Free, to your door</span>
          </div>
          <div>
            <b>Orders</b>
            <span>Sent on WhatsApp</span>
          </div>
          <div>
            <b>Station</b>
            <span>Walk-in refills</span>
          </div>
        </div>
      </div>
    </div>
  );
}
