# seduhmanual

A V60 manual pour-over coffee brewing calculator and step-by-step timer, built as a mobile-first web app for use while brewing.

## Features

- **Brew calculator** — input coffee weight, ratio, grind size, process type, and brew mode (hot or ice brew) to get exact water amounts and recommended temperature
- **Experimental mode** — override every parameter manually: bloom water, pour amounts, step durations, and temperature — no formula locking
- **Step-by-step timer** — circular progress bar with audio alerts at each pour step (bloom → pour 1 → pour 2), ending with a "STOP — Angkat V60!" alert
- **Featured recipes** — built-in recipes from James Hoffmann, Tetsu Kasuya, Scott Rao, Lance Hedrick, Onyx Coffee Lab, and the classic Japanese ice brew method
- **Recipe library** — save and reload your favourite brew profiles, stored locally in the browser (no account needed)
- **Export / Import** — back up your saved recipes as a JSON file and restore them on any device

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- TypeScript
- Tailwind CSS v4
- Web Audio API (no external audio files)
- `localStorage` (no backend, no database)

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to Vercel

```bash
npm i -g vercel
vercel
```

Follow the prompts to link your Vercel account. For subsequent deploys:

```bash
vercel --prod
```

No environment variables are required.

## Contributing

Contributions are welcome! You can:

- **Add a built-in recipe** for a famous brewer or method
- **Propose or build new features** (brew log, grind guide, PWA, i18n, …)
- **Fix bugs** or improve documentation

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines, the recipe object schema, and the PR checklist.

## Credits

Inspired by [Homebrew](https://github.com/kendi666/Homebrew) by [@kendi666](https://github.com/kendi666) — an Android app for manual brew recipes that served as the original reference for the brewing logic and step structure used here.
