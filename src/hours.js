import { useEffect, useState } from "react";

// ---- Opening hours (Kenya time, EAT = UTC+3, no daylight saving) ----
export const OPEN_HOUR = 9;    // 9:00 AM
export const CLOSE_HOUR = 22;  // 10:00 PM
export const OPEN_LABEL = "9:00 AM";
export const CLOSE_LABEL = "10:00 PM";
export const CLOSED_TEXT = `Store closed. Opens at ${OPEN_LABEL}`;

// Current hour in Kenya as a decimal (e.g. 21.5 = 9:30 PM), no matter where the visitor is.
// Kenya has no daylight saving, so a fixed +3 hours from UTC is always correct.
const kenyaHour = (now = Date.now()) => {
  const d = new Date(now + 3 * 3600 * 1000);
  return d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
};

export const isStoreOpen = (now = Date.now()) => {
  const h = kenyaHour(now);
  return h >= OPEN_HOUR && h < CLOSE_HOUR;
};

// React hook: true while the store is open, and flips by itself at 9:00 AM / 10:00 PM
export function useStoreOpen() {
  const [open, setOpen] = useState(isStoreOpen);
  useEffect(() => {
    const check = () => setOpen(isStoreOpen());
    const t = setInterval(check, 10000);
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
