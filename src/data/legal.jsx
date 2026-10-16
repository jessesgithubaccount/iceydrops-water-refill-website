import { OPEN_LABEL, CLOSE_LABEL, MAP_LABEL, WHATSAPP } from "../config";

export const Contact = () => (
  <p>
    Phone: <a href="tel:+254710747388">0710 747 388</a> or <a href="tel:+254143155549">0143 155 549</a>
    <br />
    WhatsApp:{" "}
    <a href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener">
      chat with us
    </a>
    <br />
    Address: Icey Drops & Refill, {MAP_LABEL}, Kenya
  </p>
);

export const PRIVACY = {
  title: "Privacy Policy",
  intro: 'This Privacy Policy explains what personal information Icey Drops & Refill ("we", "us") collects through this website, how we use it and the choices you have. We handle your information in line with the Kenya Data Protection Act, 2019.',
  sections: [
    ["Who we are", [
      "Icey Drops & Refill is a purified drinking water station on Mandela Road, Ongata Rongai, Kenya. When you order from us or contact us through this website, we decide how and why your information is used, which makes us the data controller."
    ]],
    ["Information we collect", [
      "We only collect what you choose to enter or share:",
      [
        "Order details: the items and quantities in your cart, your name, phone number, delivery location and any notes you add.",
        'Enquiries: your name, phone number, location (optional) and the message you write in the "Get in touch" form.',
        'Map location (optional): if you tap "Pin my current location", your device shares its GPS coordinates and how accurate they are, and you can move the pin yourself. This only happens after you allow location access in your browser. If you prefer, refuse and type your address instead.',
        "Technical information: like any website, the services that deliver this site, its maps and its fonts (listed below) receive your IP address and basic device and browser details when your browser loads them."
      ],
      "We do not collect any payment details on this website."
    ]],
    ["How your order reaches us", [
      'This website has no accounts and does not store your order on a server of ours. When you press "Send order on WhatsApp" or "Send message", the website prepares a WhatsApp message with the details you entered and opens WhatsApp on your device. We only receive your information once you send that message. Until then it stays in your browser and is lost when you close or refresh the page.'
    ]],
    ["How we use your information", [
      [
        "To confirm, prepare and deliver your order, and to contact you about it (including calling you, or our rider calling you, if we cannot find your address).",
        "To answer your questions and enquiries.",
        "To keep records of orders and deliveries, handle complaints and improve our service.",
        "To meet legal, tax and accounting obligations."
      ],
      "We rely on your consent (you choose to submit your details and to share your location), on what is needed to carry out your order, and on our legal obligations. We do not sell your personal information, and we do not use your details for marketing unless you agree to it."
    ]],
    ["Who else handles your information", [
      "We share your information only as far as needed:",
      [
        "Our team and delivery riders see your name, phone number and delivery location so they can bring your order.",
        "WhatsApp (Meta) carries your message to us. Its use is covered by WhatsApp's own terms and privacy policy.",
        "Google Maps powers the map in our Contact section and may power the map in the order form. When these load, Google may receive your IP address and device details and may set cookies.",
        "OpenStreetMap (Nominatim) and CARTO: when you pin a location, the coordinates are sent to OpenStreetMap's Nominatim service to turn them into a place name, and map tiles are loaded from OpenStreetMap or CARTO, which can see your IP address and the area you are viewing.",
        "Content and font providers: the map software (Leaflet) is loaded from unpkg, and our fonts from Google Fonts. They receive your IP address when they load."
      ],
      "These providers have their own privacy policies and some may process information outside Kenya. We may also disclose information if the law requires us to."
    ]],
    ["Cookies and tracking", [
      "We do not use advertising or analytics cookies or trackers on this website. Google Maps and the other services above may set their own cookies or similar technologies, which we do not control. You can block or delete cookies in your browser settings."
    ]],
    ["How long we keep it", [
      "We keep order and delivery information only as long as needed to complete your order, deal with any follow-up or complaint, and meet legal, tax and accounting requirements. After that we delete it or remove the details that identify you."
    ]],
    ["Keeping it safe", [
      "WhatsApp encrypts messages in transit. Within our business, orders are only seen by the people who need them to fulfil your order, and we take reasonable steps to protect the information we hold. No online service can promise perfect security, so please share only what is needed and avoid putting sensitive details in the notes field."
    ]],
    ["Your rights", [
      "Under the Data Protection Act, 2019 you have the right to:",
      [
        "be told how your personal data is used;",
        "ask for a copy of the data we hold about you;",
        "object to our use of your data;",
        "ask us to correct data that is wrong or incomplete;",
        "ask us to delete data we no longer need;",
        "receive your data in a commonly used format."
      ],
      "Where we rely on your consent, you can withdraw it at any time. This does not affect what we did before you withdrew it. To use any of these rights, call or message us on WhatsApp using the details below. We may ask you to confirm who you are first.",
      <p>
          If you are not happy with how we handle your information, you can complain to the Office of the Data
          Protection Commissioner of Kenya (
          <a href="https://www.odpc.go.ke" target="_blank" rel="noopener">odpc.go.ke</a>).
        </p>
    ]],
    ["Children", [
      "Our service is meant for adults. We do not knowingly collect information from anyone under 18 without the consent of a parent or guardian. If you think a child has sent us their details, contact us and we will delete them."
    ]],
    ["Changes to this policy", [
      "We may update this policy from time to time. The date at the top of the page shows when it last changed, and the latest version applies from that date."
    ]],
    ["Contact us", [
      "For any question about this policy or your information:",
      <Contact />
    ]]
  ]
};
export const TERMS = {
  title: "Terms of Service",
  intro: "These Terms of Service apply when you use the Icey Drops & Refill website and order water or send us a message through it. By using the website or sending an order you agree to them. If you do not agree, please do not use the website.",
  sections: [
    ["About us", [
      'Icey Drops & Refill ("we", "us") runs a purified drinking water station on Mandela Road, Ongata Rongai, Kenya. We sell water in 20L, 10L and 5L bottles, offer refills at the station and deliver to your door.'
    ]],
    ["Placing an order", [
      [
        'The cart on this website collects your order. Pressing "Send order on WhatsApp" sends us a request. It becomes a confirmed order only when we reply and confirm it on WhatsApp.',
        "We may decline, change or cancel an order, for example if an item is unavailable, your location is outside our delivery area or we cannot reach you.",
        "You must give us accurate details, including your name, phone number and delivery location.",
        "You must be 18 or older, or have a parent or guardian's permission, to place an order."
      ]
    ]],
    ["Opening hours", [
      `The website lets you add items to your cart from ${OPEN_LABEL} to ${CLOSE_LABEL}, East Africa Time (Kenya time). Orders sent outside these hours are handled when we next open. We agree delivery times with you on WhatsApp.`
    ]],
    ["Prices, payment and delivery", [
      [
        "We confirm the price with you on WhatsApp before we deliver. Prices may change from time to time.",
        "Pay after delivery: you pay when your water is delivered, using the method we agree with you on WhatsApp.",
        "Delivery is free to locations inside our delivery area. We tell you when we reply whether your location is covered.",
        "Please stay reachable on the phone number you give and make sure someone can receive the order. The map pin is only a guide, so add your estate, building and house number. If we cannot find or reach you, we may reschedule or cancel the delivery."
      ]
    ]],
    ["Bottles and refills", [
      "For hygiene and safety we may refuse to refill a bottle that is damaged, dirty or not suitable for drinking water. A bottle you buy from us belongs to you. Please keep it clean and bring it back for refills."
    ]],
    ["Cancellations and problems", [
      "To change or cancel an order, message us on WhatsApp as soon as possible, before it is on its way. If something is wrong with your order (wrong item, missing quantity, damaged bottle or a problem with the water), tell us promptly by WhatsApp or phone and we will work with you to put it right, for example by replacing the item or correcting the order. This does not affect any rights you have under Kenyan consumer law."
    ]],
    ["Using the website", [
      "Please do not:",
      [
        "place false or prank orders;",
        "send abusive, unlawful or misleading messages;",
        "try to disrupt the website or get into parts of it you are not meant to access;",
        "use automated tools to submit orders or messages."
      ],
      "We may refuse service to anyone who does."
    ]],
    ["Your information", [
      <p>
          How we handle your personal information is explained in our <a href="#/privacy">Privacy Policy</a>, which forms
          part of these terms.
        </p>
    ]],
    ["Our content", [
      "The Icey Drops & Refill name, logo, photos, text and design belong to us or are used with permission. Please do not copy or reuse them without our written permission."
    ]],
    ["Third-party services", [
      "The website relies on WhatsApp, Google Maps, OpenStreetMap, CARTO and other third parties. We do not control them and are not responsible for their availability, accuracy or policies. Maps are a guide and can be inaccurate."
    ]],
    ["Website availability", [
      'We try to keep the website working, but we provide it "as is". We cannot promise that it will always be available, error-free or fully up to date. If the website is not working, call or message us on WhatsApp to order.'
    ]],
    ["Limits on our responsibility", [
      "Nothing in these terms limits any liability that cannot be limited by law. Subject to that, we are not responsible for indirect or consequential losses, or for delays or failures caused by things outside our control, such as power or water supply problems, road conditions, weather or network and WhatsApp outages. Our total responsibility for any order is limited to the amount you paid or owe us for that order."
    ]],
    ["Changes to these terms", [
      "We may update these terms from time to time. The version on this page, with the date at the top, applies to orders placed after that date."
    ]],
    ["Governing law", [
      "These terms are governed by the laws of Kenya, and the courts of Kenya can hear any dispute about them. We would always prefer to sort out a complaint with you directly first."
    ]],
    ["Contact us", [
      "For any question about these terms:",
      <Contact />
    ]]
  ]
};
export const DOCS = { privacy: PRIVACY, terms: TERMS };

export const OTHER = { privacy: ["#/terms", "Terms of Service"], terms: ["#/privacy", "Privacy Policy"] };
