# Contributing to seduhmanual

Thanks for your interest in contributing! seduhmanual is an open project and welcomes contributions of all kinds — new features, built-in recipes, themes, bug fixes, and documentation improvements.

The name comes from Bahasa Indonesia: **seduh** (“to brew”) + **manual** — “manual brew.”

---

## Ways to contribute

### ☕ Add a built-in recipe
The most accessible contribution. Famous V60 recipes live in [`lib/builtinRecipes.ts`](lib/builtinRecipes.ts) as plain TypeScript objects.

Each built-in recipe needs its own `steps[]` array. The file provides a `step()` helper:

```ts
step(name, waterAmount, duration, description?)
```

A recipe object looks like this:

```ts
{
  id: "builtin-your-unique-id",      // kebab-case, must be globally unique
  name: "Recipe Name",
  beanName: "Recommended bean / roast level",
  author: "Brewer's Name",
  processType: "Washed",             // see ProcessType in lib/types.ts
  grindSize: "Medium",               // see GrindSize in lib/types.ts
  ratio: 15,                         // water-to-coffee ratio (e.g. 15 = 1:15)
  coffeeWeight: 15,                  // suggested dose in grams
  brewMode: "hot",                   // "hot" | "ice"
  isBuiltIn: true,                   // always true for built-in recipes
  notes: "Step-by-step notes about the method, tips, target brew time, etc.",
  createdAt: "",                     // leave empty for built-in recipes
  steps: [
    step("Bloom", 30, 45, "Saturate the grounds evenly"),
    step("Pour 1", 120, 45, "Slow spiral pour from the center outward"),
    step("Drain", 0, 90, "Let the bed drain fully"),
  ],
}
```

Step timing is **duration-based**: each step's start time is the sum of all previous durations. Use `waterAmount: 0` for non-pour phases such as stirring or draining. Built-in recipes load into Experimental Mode so the timer follows the actual technique.

Good recipes to add:
- Methods with a clear, documented step structure
- Recipes from well-known baristas, roasters, or competitions (WBC, etc.)
- Ice-brew or cold-concentration variants
- Process-specific recipes (anaerobic, carbonic maceration, etc.)

### 🎨 Add a theme
The app ships with six themes: Auto, Cafe, Paper, Espresso, Single Origin, and Cupping Lab. All colors are semantic tokens, so a new theme is a palette block plus a picker entry.

1. Add a complete `[data-theme="your-theme"]` block in [`app/globals.css`](app/globals.css). Include every token: `canvas`, `surface`, `accent-soft`, `line`, `line-soft`, `ink`, `on-ink`, `ink-muted`, `ink-subtle`, `accent`, `accent-strong`, `on-accent`, `success`, `on-success`, `display-font`, and `phase-1` … `phase-8`.
2. Add the theme to `THEMES` and `THEME_COLORS` in [`lib/themes.ts`](lib/themes.ts) with a name, description, three preview swatches, and browser `themeColor`.
3. Test the home page, Recipes page, Experimental Mode, timer, theme picker, and install prompt in the new theme.

Do not hardcode hex colors in components — use the semantic utilities (`bg-surface`, `text-ink`, `text-ink-muted`, `border-line`, `text-accent`, etc.) or the theme CSS variables.

### 🖼 Improve share cards
The custom-recipe share flow is split across two files:

- [`lib/shareCard.ts`](lib/shareCard.ts) — builds the card data and renders the Block Poster onto a canvas
- [`components/ShareRecipeModal.tsx`](components/ShareRecipeModal.tsx) — the card editor, palette controls, and Web Share/download actions

Add palettes to `SHARE_PRESETS`. Each preset defines `bg`, `ink`, `accent`, `block`, `onBlock`, and three `phases` colors. The renderer supports **Portrait 4:5** and **Square 1:1**. The layout is a title block, water hero, 3×2 metrics, phase timeline, step ledger, and CTA. If you change spacing or typography, test a long recipe name, a long bean name, and a recipe with many steps in both formats. The card’s call-to-action URL is `SITE_URL` in `lib/shareCard.ts` — update it if the deployment domain changes.

### 🛠 Add a new feature
Check the [open issues](https://github.com/netsecid/seduhmanual/issues) or propose your own. Current areas of interest:

- **Additional brew methods** — AeroPress, Chemex, Kalita Wave adapted to the step timer
- **Offline support** — caching strategy for the service worker
- **Shareable links** — encode a recipe into a URL or QR code so it can be imported directly
- **Grind guide** — visual reference for grind sizes by brewer brand
- **Brew log** — simple history of past brews with timestamps
- **Internationalisation (i18n)** — the UI is currently English
- **PWA polish** — install prompts, shortcuts, and manifest improvements

### 🐛 Fix a bug
Open an issue first if it's non-trivial so we can discuss the approach before you spend time on it.

### 📝 Improve documentation
Typo fixes, clearer explanations, better code comments — all welcome, no issue needed.

---

## Development setup

```bash
git clone https://github.com/netsecid/seduhmanual.git
cd seduhmanual
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app hot-reloads on save.

To verify a production build:

```bash
npm run build
npm run start
```

### Project structure

```
app/            Next.js App Router pages, layout, metadata, manifest, app icons
components/     UI components — forms, timer, recipe card, theme picker,
                share editor, install prompt, brand mark, numeric input
constants/      Static data (coffee process definitions)
lib/            Core logic — types, calculations, recipe storage, built-ins,
                themes, share cards
public/         Static assets, PWA icons, service worker
```

### Tech stack

| Layer       | Library / tool                     |
|-------------|------------------------------------|
| Framework   | Next.js 16 (App Router)            |
| Language    | TypeScript                         |
| Styles      | Tailwind CSS v4 + theme tokens     |
| Themes      | Six palettes, Auto light/dark      |
| State       | React hooks + localStorage         |
| Audio       | Web Audio API (no files)           |
| Sharing     | Canvas PNG + Web Share API         |
| PWA         | Web app manifest + service worker  |
| Deploy      | Vercel                             |

No backend, no database, no authentication.

---

## Pull request checklist

- [ ] `npm run build` passes with no TypeScript errors
- [ ] New recipe IDs start with `builtin-`, are unique, and include `steps[]`
- [ ] New themes include a complete token block and a `lib/themes.ts` entry
- [ ] UI changes look good on mobile (max-width ~390px)
- [ ] Color changes use semantic tokens, not hardcoded hex values
- [ ] Theme-sensitive changes were checked in both light and dark palettes
- [ ] Share-card changes were checked in portrait and square formats
- [ ] UI copy is in English
- [ ] No new external dependencies added without discussion

---

## Code style

- Functional components with explicit TypeScript types
- Tailwind classes only — no inline `style` unless necessary for dynamic values (theme variables, phase colors)
- Named exports for utility functions, default exports for components and pages
- Numeric fields must use `components/NumericInput.tsx`; binding a number directly to an input's `value` recreates the “stuck at 0” bug
- Headings use `font-display` (or `var(--display-font)`) so per-theme typography applies
- Keep components focused; extract sub-components when a file grows past ~200 lines

---

## License

By contributing you agree that your contributions will be licensed under the same [MIT License](LICENSE) as the rest of the project.
