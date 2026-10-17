# Icey Drops & Refill

Water-delivery site for Ongata Rongai, converted from the single-file preview into a Vite + React project.

## Run

```bash
npm install
cp .env.example .env   # add your keys (see below)
npm run dev            # http://localhost:5173
npm run build          # outputs to dist/
npm run preview        # serve the production build
```

## Environment

| Variable | Used for |
| --- | --- |
| `VITE_GOOGLE_MAPS_KEY` | Google Maps key for the pin-your-location map in the cart. Set it on your host too (e.g. Vercel environment variables) and redeploy. If it is missing or rejected, a plain Google embed is shown instead |

Vite inlines these into the browser bundle, so restrict both keys by HTTP referrer in their dashboards.

## Structure

- `src/config.js` phone number, hours, address, env keys
- `src/data/content.js` products, offers, services, nav
- `src/data/legal.jsx` Privacy Policy and Terms text
- `src/hooks/` useStoreOpen (Kenya time), useScrollReveal, useActiveSection
- `src/lib/` maps.js (Google Maps engine), utils.js (WhatsApp, cart route)
- `src/components/` Hero, ProductCard, CartModal, MapPicker, Enquiry, ...
- `src/pages/` Home, LegalPage
- `src/App.jsx` hash router: `#/cart`, `#/privacy`, `#/terms`
- `src/assets/` logo, product and hero images (extracted from base64)
- `src/styles.css` all styles, unchanged from the original
