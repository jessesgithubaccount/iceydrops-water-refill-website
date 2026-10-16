import p20 from "../assets/bottle-20l.jpg";
import p10 from "../assets/bottle-10l.jpg";
import p5 from "../assets/bottle-5l.jpg";

// `ask` makes the card open the Refill / New-bottle popup; [refillId, newBottleId] are the hidden cart items it adds.
export const PRODUCTS = [
  { id: "w20", name: "20L Water", note: "Free delivery", price: null, img: p20, size: "20L", ask: ["r20", "n20"] },
  { id: "r20", name: "20L Refill", note: "Free delivery", price: null, img: p20, hide: true },
  { id: "n20", name: "20L New Bottle + Water", note: "Free delivery", price: null, img: p20, hide: true },
  { id: "m10", name: "10L Bottle", note: "Free delivery", price: null, img: p10, size: "10L", ask: ["r10", "n10"] },
  { id: "r10", name: "10L Refill", note: "Free delivery", price: null, img: p10, hide: true },
  { id: "n10", name: "10L New Bottle + Water", note: "Free delivery", price: null, img: p10, hide: true },
  { id: "s5", name: "5L Bottle", note: "Free delivery", price: null, img: p5, size: "5L", ask: ["r5", "n5"] },
  { id: "r5", name: "5L Refill", note: "Free delivery", price: null, img: p5, hide: true },
  { id: "n5", name: "5L New Bottle + Water", note: "Free delivery", price: null, img: p5, hide: true },
];

export const OFFERS = [
  {
    tag: "huna credo?|tuma na app",
    heading: "Order Now Pay After Delivery",
    text: "Tap Once and your order lands on our WhatsApp.",
    badge: "WhatsApp",
    badgeSmall: "orders",
  },
];

export const SERVICES = [
  ["🏠", "Home delivery", "Dispenser refills brought to your house, free of charge."],
  ["🏢", "Office supply", "Regular water for your team, ordered in a minute."],
  ["♻️", "Station refills", "Walk in with your bottle and refill it at the station."],
];

export const WHY = [
  ["Purified & safe", "Clean, healthy drinking water for the whole family."],
  ["Free delivery", "No delivery charge on your order."],
  ["Order on WhatsApp", "No more calling every time you need water."],
  ["No contract", "Order only when you need water."],
  ["Reliable", "A local station you can count on."],
  ["Eco-friendly", "Refill and reuse your bottles."],
];

export const STEPS = [
  ["Fill your cart", "Choose your bottles and how many you need."],
  ["Send on WhatsApp", "Add your name and location, then tap send."],
  ["We deliver", "We confirm your order and bring the water."],
];

export const NAV = [
  ["top", "Home"],
  ["shop", "Shop"],
  ["services", "Services"],
  ["how", "How it works"],
  ["contact", "Contact"],
];
