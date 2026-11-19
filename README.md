# Oat & Ember Bakehouse: Bakery Website & Project Hub

Prototype: a UX/UI website project presented as client work, for a small neighbourhood bakery in Westbrook.

- **`index.html`: the website.** Live stock and reserve-for-pickup, an allergen exclusion filter, a bake schedule, a cake builder with a live preview, opening hours and FAQ.
- **`project.html`: the project hub.** The case study a client would receive: brief, sell-out analysis, counter observation, cake-DM audit, personas, **service blueprint**, wireframes, visual design, usability testing and handoff.

> Research figures and test results in the project hub are illustrative: they show the method, not real data.

## The brief in one line

By ten o'clock the sourdough and cardamom buns are gone, and every cake order takes about 14 Instagram messages, answered at night by a team that starts baking at 4am.

## What the website does

| Problem | Solution |
|---|---|
| Favourites sell out by 10am | **Live stock** badges and **Reserve for pickup**, with day and time slots and a pickup code |
| Sold-out items look like they don't exist | They stay visible, with **"Pre-order for tomorrow"** |
| Allergen questions at the counter | **"Hide anything containing…"** filters, a vegan toggle, "Contains" on every item and an honest note about traces |
| "When does the bread come out?" | A **Fresh out of the oven** timeline that highlights the latest batch |
| Cake orders by DM | A **cake builder** with a live SVG preview, itemised live price, message and earliest-date rules |

## Business rules (all in config)

- Hours: Tue–Fri 7am–3pm, Sat 7:30am–2pm, Sun 8am–1pm, closed Mondays. The status pill and hours table use the visitor's current time.
- Same-day reservations close at 1pm. Choosing today shows warnings when a quantity exceeds today's stock.
- Cakes need 3 days' notice, never on a Monday, and can be ordered up to 90 days ahead.

## UX details worth noticing

- The error summary pattern with linked fields, inline errors, `aria-invalid` and focus management
- Messages that explain the fix: "We need three days' notice. The earliest is Sun, Nov 22"
- The cake preview is an SVG with a live `<desc>`, so screen readers hear the cake you've built
- The pickup code is large and dashed, so staff can read it at arm's length

## Accessibility (WCAG 2.2 AA)

Every text colour pair was contrast-checked (crust 13.4:1, body 8.1:1, captions 5.3:1, berry 6.7:1, sage 5.5:1). Butter yellow is only ever a background behind dark text. The site uses native controls, 44px+ targets, visible focus and `prefers-reduced-motion` support. An automated audit found no heading skips, unlabelled inputs, broken anchors or missing alt text.

## Tech

Plain HTML, CSS and vanilla JavaScript. No build step. If `img/hero-bakery.jpg` is missing, the hero falls back to a drawn SVG loaf.

```
index.html     website
project.html   project hub / case study (incl. service blueprint)
styles.css     design tokens + website styles
project.css    project hub styles
js/app.js      hours, stock, filters, pickup ordering, cake builder
```

## Run locally / host for free

Open `index.html` in a browser, or host the folder on GitHub Pages or Netlify Drop.
