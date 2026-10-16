import { useLayoutEffect } from "react";

const REVEAL = ".strip > .w, main > section > .w";

export function useScrollReveal() {
  useLayoutEffect(() => {
    if (!document.documentElement.classList.contains("js-rv")) return;
    const els = [...document.querySelectorAll(REVEAL)];
    els.forEach((el) => el.classList.add("rv"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
