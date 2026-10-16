import { useEffect } from "react";
import Footer from "../components/Footer";
import { LEGAL_UPDATED, SITE_TITLE } from "../config";
import { DOCS, OTHER } from "../data/legal";
import logoImg from "../assets/logo.png";

const renderBlock = (b, i) =>
  Array.isArray(b) ? (
    <ul key={i}>
      {b.map((li, j) => (
        <li key={j}>{li}</li>
      ))}
    </ul>
  ) : typeof b === "string" ? (
    <p key={i}>{b}</p>
  ) : (
    <div key={i}>{b}</div>
  );

export default function LegalPage({ doc }) {
  const d = DOCS[doc];
  const [otherHref, otherLabel] = OTHER[doc];
  useEffect(() => {
    const prev = document.title;
    document.title = `${d.title} | ${SITE_TITLE}`;
    return () => {
      document.title = prev;
    };
  }, [d.title]);
  return (
    <>
      <header>
        <div className="w nav">
          <a className="brand" href="#top">
            <img src={logoImg} width="33" height="54" alt="Icey Drops logo" className="logo" />
            <span>
              Icey Drops & Refill
              <small>Purified drinking water</small>
            </span>
          </a>
          <div className="right">
            <a className="btn sm" href="#top">
              ← Back to site
            </a>
          </div>
        </div>
      </header>
      <main className="legal">
        <div className="w">
          <article>
            <h1>{d.title}</h1>
            <p className="upd">Last updated: {LEGAL_UPDATED}</p>
            <p className="lead">{d.intro}</p>
            {d.sections.map(([h, blocks], i) => (
              <div className="sec" key={h}>
                <h2>
                  {i + 1}. {h}
                </h2>
                {blocks.map(renderBlock)}
              </div>
            ))}
            <p className="other">
              See also our <a href={otherHref}>{otherLabel}</a>.
            </p>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
