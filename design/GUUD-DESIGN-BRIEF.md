# Guud Design Brief — The Guud Network

A brief for designing (and design-syncing) The Guud Network in line with Guud's
**existing** brand system. Tokens below are sourced directly from the live Guud
Shopify theme (`jeanjack84/guud-theme`), not invented.

## Brand feeling

Warm, calm, grown-up, trustworthy. Guud talks to women about intimate health
without clinical coldness or girly cliché. Earthy and editorial, like a
thoughtful magazine you trust. The Guud Network must feel like a safe,
human place — never a sterile review site.

## Color tokens (from guud-theme)

| Token | Hex | Role |
| --- | --- | --- |
| Terracotta (primary) | `#893400` | Headings accent, primary buttons, brand mark. Guud's signature. |
| Terracotta dark | `#6b2800` | Primary hover/active. |
| Coral | `#f94c43` | Accent, highlights, energetic CTAs. Use sparingly. |
| Ink | `#1c1b1b` | Body text and headings. |
| Muted | `#6a6a6a` | Secondary text. |
| Mocha | `#a17c5e` | Secondary/positive signals (trust, online). |
| Cream | `#f7f6f4` | Page background. |
| Beige | `#f1e4d8` | Soft surfaces / cards (the "key takeaway" beige). |
| Beige tint | `#f6ece1` | Highlight boxes, AI empathy panel. |
| Honey | `#d99a2b` | Stars / warm accents (from `#f5db8b`/`#fce7a8` family). |
| Line | `#ece3da` | Hairlines, borders. |
| White | `#ffffff` | Elevated surfaces. |

Usage rules:
- Background is **cream**, not white. White is for elevated cards.
- Terracotta is the primary; coral is an accent — don't flood with coral.
- Greens/blues are off-brand. Positive/"trust" cues use **mocha + beige**, not green.

## Typography (from guud-theme)

- **Nib Pro** — display serif. Headings, hero, pull-quotes, the brand voice.
  High-contrast and editorial. Mapped to `.font-display` / `--font-display`.
- **Hurme Geometric Sans 4** — UI/body sans (Light / Regular / SemiBold).
  Everything else. Mapped to `--font-sans`.

Both are licensed Guud webfonts, self-hosted in `public/fonts/` (copied from the
theme). Set headings in Nib Pro with slight negative tracking; body in Hurme
Regular; emphasis/labels in Hurme SemiBold.

## Editorial building blocks (carry over from the Guud blog system)

Guud's approved blog style (see internal style guide) uses warm building blocks
we mirror here:
- **Takeaway / highlight box** — soft beige (`#f6ece1`) panel for key insights →
  used for the AI empathy panel and "why women trust her".
- **Callout card** — warm card for tips and "when to see a doctor" → used for the
  safety-note panel.
- **Pull-quote** — centered Nib Pro with curly quotes → used for standout
  recommendations on cards.

## Component direction for The Guud Network

- **Practitioner card**: white surface, warm hairline, terracotta name on hover,
  honey stars, mocha "trust" badge, a Nib Pro pull-quote from a real review.
- **Hero**: cream bg, Nib Pro headline with terracotta emphasis line, the
  symptom box as the centerpiece.
- **Buttons**: terracotta fill, cream text, rounded-full, terracotta-dark hover.
- Generous spacing, large radii (`--radius-xl2`), gentle entrance animation.

## How to sync to Claude Design (claude.ai design system)

This brief pairs with the `/design-sync` skill + `DesignSync` tool to keep a
shared component library in claude.ai aligned with the build:
1. `/login` with the **Claude account (subscription)** so DesignSync has
   claude.ai credentials.
2. `list_projects` → pick the Guud design-system project (or `create_project`
   "Guud Design System").
3. Sync components **one at a time** (button, card, callout, type scale, color
   tokens) — never wholesale replace.
4. Each preview file carries a `<!-- @dsCard group="..." -->` marker so it shows
   in the Design System pane.

## Source of truth

Live theme: `jeanjack84/guud-theme` → `assets/app.css`,
`config/settings_data.json`, `assets/HurmeGeometricSans4-*`, `assets/NibPro-*`.
When in doubt, match the theme.
