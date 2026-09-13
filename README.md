# pramod-ahire.github.io

Personal portfolio site for **Pramod Ahire** — Senior Frontend Engineer.

Live at **https://pramod-ahire.github.io**

## Stack

No build step, no dependencies. Plain HTML, CSS and JavaScript, served directly
by GitHub Pages.

| File | Purpose |
| --- | --- |
| `index.html` | All page content, as semantic markup |
| `assets/styles.css` | Design tokens and component styles (dark + light themes) |
| `assets/main.js` | Theme toggle, scroll-spy, reveal-on-scroll — all progressive enhancement |
| `assets/pramod-ahire.jpg` | Profile photo |
| `assets/favicon.svg` | Favicon |

## Local development

Any static server works:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Conventions

- **Design tokens first.** Colours, type scale and spacing live as CSS custom
  properties in `:root`; the light theme only overrides token values, never
  component rules.
- **Content in HTML.** Nothing is rendered client-side, so the page works with
  JavaScript disabled and is fully indexable.
- **Accessibility.** Skip link, semantic landmarks, `aria-current` on the active
  nav item, visible focus rings, and `prefers-reduced-motion` support.

## Deployment

Pushing to `main` publishes the site. GitHub Pages is configured to deploy from
the `main` branch, root folder.
