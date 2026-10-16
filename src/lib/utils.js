import { WHATSAPP } from "../config";

export const openWhatsApp = (message) =>
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(message)}`, "_blank", "noopener");

export const money = (n) => `KSh ${n.toLocaleString()}`;

// Tracks whether the cart route was reached by an in-app navigation,
// so closing it can go back in history instead of leaving a stale hash.
let cartPushed = false;
export const wasCartPushed = () => cartPushed;
export const setCartPushed = (v) => {
  cartPushed = v;
};
export const goCart = () => {
  cartPushed = true;
  window.location.hash = "#/cart";
};
