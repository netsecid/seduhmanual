# Contributing to seduhmanual

Thanks for your interest in contributing! seduhmanual is an open project and welcomes contributions of all kinds — new features, built-in recipes, bug fixes, and documentation improvements.

---

## Ways to contribute

### ☕ Add a built-in recipe
The most accessible contribution. Famous V60 recipes live in [`lib/builtinRecipes.ts`](lib/builtinRecipes.ts) as plain TypeScript objects.

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
}
```

Good recipes to add:
- Methods with a clear, documented step structure
- Recipes from well-known baristas, roasters, or competitions (WBC, etc.)
- Ice-brew or cold-concentration variants
- Process-specific recipes (anaerobic, carbonic maceration, etc.)

### 🛠 Add a new feature
Check the [open issues](https://github.com/netsecid/seduhmanual/issues) or propose your own. Current areas of interest:

- **Additional brew methods** — AeroPress, Chemex, Kalita Wave adapted to the step timer
- **Grind guide** — visual reference for grind sizes by brewer brand
- **Brew log** — simple history of past brews with timestamps
- **PWA / offline support** — service worker for use without internet
- **Internationalisation (i18n)** — Indonesian and other language support

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

### Project structure

```
app/            Next.js App Router pages and layout
components/     Reusable UI components
constants/      Static data (coffee process definitions)
lib/            Core logic — types, calculations, recipe storage
public/         Static assets
```

### Tech stack

| Layer       | Library / tool            |
|-------------|---------------------------|
| Framework   | Next.js 16 (App Router)   |
| Language    | TypeScript                |
| Styles      | Tailwind CSS v4           |
| State       | React hooks + localStorage|
| Audio       | Web Audio API (no files)  |
| Deploy      | Vercel                    |

No backend, no database, no authentication.

---

## Pull request checklist

- [ ] `npm run build` passes with no TypeScript errors
- [ ] New recipe IDs start with `builtin-` and are unique
- [ ] UI changes look good on mobile (max-width ~390px)
- [ ] No new external dependencies added without discussion

---

## Code style

- Functional components with explicit TypeScript types
- Tailwind classes only — no inline `style` unless necessary for dynamic values
- Named exports for utility functions, default exports for components and pages
- Keep components focused; extract sub-components when a file grows past ~200 lines

---

## License

By contributing you agree that your contributions will be licensed under the same [MIT License](LICENSE) as the rest of the project.
