# seduhmanual

A V60 manual pour-over coffee calculator and step-by-step brew timer, built as a mobile-first, installable web app for use while brewing.

## The name

**seduhmanual** comes from Bahasa Indonesia: **seduh** means “to brew” and **manual** means “manual” — together, “manual brew.” It is a small nod to the hand-poured, no-machine approach the app is built around.

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
A circular progress timer with Web Audio API beeps at each step transition. It works with any number of steps — from a simple 2-step Hario guide up to Hoffmann's 5-step technique.

- Each phase gets its own color on the progress ring, with the elapsed portion filling in as you brew.
- The current phase shows the cumulative water target, e.g. “Pour until 120 ml total.”
- A next-step preview tells you what is coming and how many seconds remain.
- The screen stays awake while the timer runs on browsers that support the Screen Wake Lock API.
- Ends with a “STOP — Remove the V60!” alert.

### 🎨 Themes
Six built-in themes:
- **Auto** — follows the system preference: Paper in light mode, Espresso in dark mode
- **Cafe** — the original warm cream and terracotta look
- **Paper** — minimal light, with near-black ink and a single clay accent
- **Espresso** — warm dark, with cocoa surfaces and copper accents
- **Single Origin** — parchment and forest green, inspired by roaster packaging
- **Cupping Lab** — cool gray and teal, with a precise, professional feel

Pick a theme from the palette button in the header. The choice is saved locally, applied before the page paints, and updates the browser chrome color. The logo and timer phase colors adapt to every theme.

### 📲 Installable App
Use the install button in the header to add seduhmanual to your home screen. The app ships with a web app manifest, service worker, and dedicated app/favicon icons.

> The service worker is intentionally network-only, so installing gives you a home-screen app but does not provide offline use yet.

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

### 🖼 Share a Recipe
Every saved custom recipe gets a **Share** button on the Recipes page. It opens a live **Block Poster** editor:

- A bold title block, water hero, 3×2 metrics grid, phase timeline, and step ledger
- Seven palettes, plus custom background, title-block, and accent colors
- **Editorial** (serif) or **Modern** (sans) typography
- **Portrait 4:5** or **Square 1:1** format
- Automatic text contrast against the chosen background

Share cards open with a palette chosen for strong block contrast: light app themes keep their matching palette, while dark app themes start with Single Origin. You can still switch to any palette or set a custom block color.

The card is rendered locally at 1080px wide, then shared through the device share sheet when available. Browsers without file sharing get a PNG download instead. Every card ends with a **Make your own recipe** call-to-action and the site URL, `https://seduhmanual.vercel.app`. Nothing is uploaded and no account is required.

### 📤 Export / Import
Back up your saved recipes as a timestamped `.json` file and restore them on any device. Import merges new recipes without overwriting existing ones. Also handles the old recipe format from earlier versions of the app — backwards compatible.

---

## Stack

| Layer | Tool |
|---|---|
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| Language | TypeScript |
| Styles | Tailwind CSS v4 with semantic theme tokens |
| Themes | Six CSS-variable palettes, Auto light/dark |
| Audio | Web Audio API (no external files) |
| Storage | `localStorage` (recipes, theme; no backend, no database) |
| Sharing | Canvas-rendered PNG + Web Share API (no backend) |
| PWA | Web app manifest + service worker |
| Deploy | Vercel |

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To verify a production build:

```bash
npm run build
npm run start
```

No environment variables are required.

## Deploying to Vercel

```bash
npm i -g vercel
vercel
```

Follow the prompts to link your Vercel account. For subsequent deploys:

```bash
vercel --prod
```

---

## Contributing

Contributions are welcome! You can:

- **Add a built-in recipe** for a famous brewer or method — recipes live in [`lib/builtinRecipes.ts`](lib/builtinRecipes.ts) as plain TypeScript objects with a `steps[]` array
- **Add a theme** — palettes live in [`app/globals.css`](app/globals.css) and the picker registry in [`lib/themes.ts`](lib/themes.ts)
- **Improve the share cards** — the canvas renderer is in [`lib/shareCard.ts`](lib/shareCard.ts) and the editor in [`components/ShareRecipeModal.tsx`](components/ShareRecipeModal.tsx)
- **Build new features** — brew log, grind visual guide, offline support, i18n, AeroPress/Chemex support, …
- **Fix bugs** or improve documentation

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines, the recipe step schema, theme instructions, code style rules, and the PR checklist.

---

## Credits

**Inspired by** [Homebrew](https://github.com/kendi666/Homebrew) by [@kendi666](https://github.com/kendi666) — an Android app for manual brew recipes that served as the original reference for the brewing logic and step structure.

**Recipe references** — step timing, water amounts, and technique notes for the featured methods were sourced and verified against:
- [Honest Coffee Guide — Brew Recipes](https://honestcoffeeguide.com/brew-recipes/) — a well-researched collection of specialty coffee recipes with accurate parameters for James Hoffmann, Tetsu Kasuya, Matt Winton, April Coffee Roasters, and others
- Original source videos and write-ups by each recipe's author where available
