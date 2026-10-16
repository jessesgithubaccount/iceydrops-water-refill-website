import { useEffect, useState } from "react";
import { OPEN_HOUR, CLOSE_HOUR } from "../config";

// Kenya is UTC+3 with no DST.
const kenyaHour = (now = Date.now()) => {
  const d = new Date(now + 3 * 3600 * 1e3);
  return d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
};

export const isStoreOpen = (now = Date.now()) => {
  const h = kenyaHour(now);
  return h >= OPEN_HOUR && h < CLOSE_HOUR;
};

export function useStoreOpen() {
  const [open, setOpen] = useState(isStoreOpen);
  useEffect(() => {
    const check = () => setOpen(isStoreOpen());
    const t = setInterval(check, 1e4);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    check();
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, []);
  return open;
}
