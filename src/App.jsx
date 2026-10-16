import { useCallback, useLayoutEffect, useEffect, useState } from "react";
import CartModal from "./components/CartModal";
import Home from "./pages/Home";
import LegalPage from "./pages/LegalPage";
import { setCartPushed, wasCartPushed } from "./lib/utils";

// Tiny hash router: #/cart opens the cart over Home, #/privacy and #/terms are pages.
const parseRoute = () => {
  const h = window.location.hash;
  return h.startsWith("#/cart") ? "cart" : h.startsWith("#/privacy") ? "privacy" : h.startsWith("#/terms") ? "terms" : "home";
};

export default function App() {
  const [route, setRoute] = useState(parseRoute);
  const [cart, setCart] = useState({});

  useEffect(() => {
    const on = () => {
      const r = parseRoute();
      if (r !== "cart") setCartPushed(false);
      setRoute(r);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);

  useLayoutEffect(() => {
    if (route !== "home" && route !== "cart") window.scrollTo({ top: 0, behavior: "instant" });
  }, [route]);

  const closeCart = useCallback(() => {
    if (wasCartPushed()) {
      setCartPushed(false);
      window.history.back();
    } else {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      setRoute("home");
    }
  }, []);

  if (route === "home" || route === "cart") {
    return (
      <>
        <Home cart={cart} setCart={setCart} />
        {route === "cart" && <CartModal cart={cart} setCart={setCart} onClose={closeCart} />}
      </>
    );
  }
  return <LegalPage doc={route} />;
}
