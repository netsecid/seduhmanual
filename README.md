# seduhmanual

A V60 manual pour-over coffee brewing calculator and step-by-step timer, built as a mobile-first web app for use while brewing.

---

## Features

### ☕ Brew Calculator
Input coffee weight, ratio, grind size, process type, and brew mode (hot or ice brew). The app calculates exact water amounts for each pour step and recommends a brewing temperature based on the coffee's process type.

### 🧪 Experimental Mode
A free-form brew editor — toggle it on to take full manual control of every parameter:
- Any number of steps (add or remove freely)
- Per-step: custom name, water amount, and duration in seconds
- Step start times auto-stack from each step's duration — no manual time math
- Temperature, grind, process, and brew mode all remain editable
- Save the result as a recipe and reload it later with all steps intact

### ⏱ Step-by-Step Timer
A circular progress timer with Web Audio API beeps at each step transition. Works with any number of steps — from a simple 2-step Hario guide up to Hoffmann's 5-step technique. Ends with a "STOP — Angkat V60!" alert.

### 📖 Featured Methods
Seven curated recipes from well-known specialty coffee brewers, each with real, accurate step-by-step timing. Loading a featured recipe opens it directly in Experimental Mode with the correct steps pre-filled.

| Recipe | Author | Steps | Ratio | Grind |
|---|---|---|---|---|
| Ultimate V60 | James Hoffmann | 5 | 1:17 | Medium-Fine |
| 4:6 Method | Tetsu Kasuya | 4 | 1:15 | Medium-Coarse |
| Five-Pour (2021 WBC) | Matt Winton | 5 | 1:15 | Medium |
| Six-Pour | April Coffee Roasters | 6 | 1:15 | Medium-Coarse |
| Scott Rao's V60 | Scott Rao | 3 | 1:15 | Medium-Fine |
| Basic V60 | Hario | 2 | 1:17 | Medium-Fine |
| Japanese Ice Brew | Traditional | 3 | 1:15 | Medium-Fine |

Each card has an **ⓘ** button that expands detailed method notes and technique tips.

### 🗂 Recipe Library
Save any brew — calculator or experimental — as a named recipe, stored locally in the browser. No account, no sync, no server.

- **My Recipes** section on the Recipes page shows all saved profiles
- **Featured Methods** section shows the built-in recipes (always available, never deletable)
- Load any recipe back into the calculator or experimental editor with one tap

### 📤 Export / Import
Back up your saved recipes as a timestamped `.json` file and restore them on any device. Import merges new recipes without overwriting existing ones. Also handles the old recipe format from earlier versions of the app — backwards compatible.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| Language | TypeScript |
| Styles | Tailwind CSS v4 |
| Audio | Web Audio API (no external files) |
| Storage | `localStorage` (no backend, no database) |
| Deploy | Vercel |

---

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

No environment variables required.

---

## Contributing

Contributions are welcome! You can:

- **Add a built-in recipe** for a famous brewer or method — recipes live in [`lib/builtinRecipes.ts`](lib/builtinRecipes.ts) as plain TypeScript objects with a `steps[]` array
- **Build new features** — brew log, grind visual guide, PWA/offline support, i18n, Hario Switch support, …
- **Fix bugs** or improve documentation

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines, the recipe step schema, code style rules, and the PR checklist.

---

## Credits

**Inspired by** [Homebrew](https://github.com/kendi666/Homebrew) by [@kendi666](https://github.com/kendi666) — an Android app for manual brew recipes that served as the original reference for the brewing logic and step structure.

**Recipe references** — step timing, water amounts, and technique notes for the featured methods were sourced and verified against:
- [Honest Coffee Guide — Brew Recipes](https://honestcoffeeguide.com/brew-recipes/) — a well-researched collection of specialty coffee recipes with accurate parameters for James Hoffmann, Tetsu Kasuya, Matt Winton, April Coffee Roasters, and others
- Original source videos and write-ups by each recipe's author where available
