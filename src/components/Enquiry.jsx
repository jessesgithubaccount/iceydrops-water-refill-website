import { useState } from "react";
import { openWhatsApp } from "../lib/utils";
import Consent from "./Consent";

export default function Enquiry() {
  const [f, setF] = useState({ name: "", phone: "", loc: "", msg: "" });
  const [err, setErr] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    const name = f.name.trim(),
      phone = f.phone.trim(),
      loc = f.loc.trim(),
      msg = f.msg.trim();
    if (!msg) return setErr("Write your message first.");
    setErr("");
    openWhatsApp(
      `Hello Icey Drops & Refill,\n${msg}${name ? `\n\nName: ${name}` : ""}${phone ? `\nPhone: ${phone}` : ""}${loc ? `\nLocation: ${loc}` : ""}`
    );
  };
  return (
    <form className="pn ef" onSubmit={submit} noValidate>
      <h3>Get in touch</h3>
      <div className="row2">
        <label>
          Name
          <input value={f.name} onChange={set("name")} autoComplete="name" placeholder="Enter your name" />
        </label>
        <label>
          Phone number
          <input value={f.phone} onChange={set("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder="Enter your phone number" />
        </label>
      </div>
      <label>
        Delivery location (optional)
        <input value={f.loc} onChange={set("loc")} placeholder="Estate or building" />
      </label>
      <label>
        Your message
        <textarea value={f.msg} onChange={set("msg")} rows={5} />
      </label>
      <div className="err" role="alert">
        {err}
      </div>
      <button className="send">Send message</button>
      <Consent action="sending a message" />
    </form>
  );
}
