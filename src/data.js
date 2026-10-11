// ---- Edit these ----
export const WHATSAPP = "254710747388";

// Google Maps API key (shows apartment and business names on the order map).
// Leave "" to use the free OpenStreetMap map instead. See the notes in the chat for how to get a key.
export const GOOGLE_MAPS_KEY = "AIzaSyAiUVjxlXXQ9hr9k5tSn3dl2mdjbPYAENI";

// Free CARTO map key (clearer labels). Get one at carto.com/basemaps/apikey (emailed instantly, no account).
// Leave "" to use the plain OpenStreetMap map.
export const CARTO_KEY = "cb1_4fyx_1_2992366b741eb3479e308d6f";

// Where the station is, for the map in the Contact section.
// MAP_QUERY is the station's exact coordinates: "latitude,longitude".
// To change it: on Google Maps press and hold the spot, then tap the numbers to copy them.
export const MAP_QUERY = "-1.396972,36.750361";
export const MAP_LABEL = "Ongata Rongai, Mandela Road";

// Date shown at the top of the Privacy Policy and Terms of Service. Update it whenever you change either.
export const LEGAL_UPDATED = "11 October 2026";

// price: number in KSh to show prices and a total; null hides prices
export const PRODUCTS = [
  { id: "w20", name: "20L Water", note: "Free delivery", price: null, img: "/product-20l.jpg", ask: true },
  { id: "r20", name: "20L Refill", note: "Free delivery", price: null, img: "/product-20l.jpg", hide: true },
  { id: "n20", name: "20L New Bottle + Water", note: "Free delivery", price: null, img: "/product-20l.jpg", hide: true },
  { id: "m10", name: "10L Bottle", note: "Free delivery", price: null, img: "/product-10l.jpg" },
  { id: "s5", name: "5L Bottle", note: "Free delivery", price: null, img: "/product-5l.jpg" },
];

export const OFFERS = [
  {
    tag: "No more calls",
    heading: "Order Now Pay After Delivery",
    text: "Tap Once and your order lands on our WhatsApp.",
    badge: "WhatsApp",
    badgeSmall: "orders",
  },
];
// --------------------
