# CodeAlpha Store — Design System & UI Specification

> **Document Purpose**: This document provides an exhaustive, source-verified specification of the visual design system, design tokens, typography, component geometry, interactive states, and responsive layouts implemented in this codebase.
>
> All values, selectors, tokens, and rules documented below are extracted directly from the source stylesheets (`frontend/src/index.css`, `frontend/src/App.css`), HTML entry points (`frontend/index.html`), and React components.

---

## 1. Color Palette & Design Tokens

All core design tokens are defined on the `:root` pseudo-class in [`frontend/src/index.css`](file:///c:/Users/Spoof/.gemini/antigravity-ide/scratch/CodeAlpha_EcommerceStore/frontend/src/index.css#L5-L82).

### Background & Surface Tokens
| Token | Implemented Value | Source File | Usage / Components |
|---|---|---|---|
| `--bg-page` | `#FAF7F2` | `frontend/src/index.css` | Document background, HTML, Body, `.store-layout` |
| `--bg-surface` | `#FFFFFF` | `frontend/src/index.css` | Cards, Modal boxes, Dropdowns, Inputs, Cart drawer |
| `--bg-subtle` | `#F4EFE8` | `frontend/src/index.css` | Secondary hover surfaces, icon backgrounds, pills, skeletons |
| `--bg-muted` | `#E9E2D7` | `frontend/src/index.css` | Low-contrast backdrops, subtle dividers, progress track |
| `--bg-card` | `#FFFFFF` | `frontend/src/index.css` | Catalog product card surface |
| `--bg-elevated` | `#FFFFFF` | `frontend/src/index.css` | Raised menus, dropdown panels, quick view dialogs |
| `--bg-dark` | `#191512` | `frontend/src/index.css` | Deep charcoal brand contrast, espresso footer backgrounds |
| `--bg-dark-surface`| `#241F1A` | `frontend/src/index.css` | Dark elevated cards, brand manifesto callouts |

### Typography Color Tokens
| Token | Implemented Value | Source File | Usage / Components |
|---|---|---|---|
| `--text-primary` | `#191512` | `frontend/src/index.css` | Primary headings, product titles, price numerals, action text |
| `--text-secondary` | `#585149` | `frontend/src/index.css` | Body copy, meta descriptions, secondary badges, input labels |
| `--text-muted` | `#8A8277` | `frontend/src/index.css` | Item counters, tertiary metadata, placeholders, order timestamps |
| `--text-brand` | `#D96B27` | `frontend/src/index.css` | Warm terracotta brand accent text, category eyebrow tags |
| `--text-brand-hover` | `#BF5615` | `frontend/src/index.css` | Hover states for branded text links |
| `--text-inverse` | `#FAF7F2` | `frontend/src/index.css` | Text on dark buttons, toast alerts, dark banners |
| `--text-inverse-muted`| `#C4BCB0` | `frontend/src/index.css` | Muted descriptions inside dark footer containers |

### Accent Tokens
| Token | Implemented Value | Source File | Usage / Components |
|---|---|---|---|
| `--accent-primary` | `#D96B27` | `frontend/src/index.css` | Primary call-to-action buttons, active badges, highlights |
| `--accent-primary-hover`| `#C25716` | `frontend/src/index.css` | Button hover and active press states |
| `--accent-primary-subtle`| `rgba(217, 107, 39, 0.09)`| `frontend/src/index.css` | Active category tab backgrounds, focus ring glows |
| `--accent-dark` | `#191512` | `frontend/src/index.css` | High-contrast secondary buttons, circular close icon hovers |
| `--accent-dark-hover` | `#2E2823` | `frontend/src/index.css` | Hover state for dark accents |
| `--accent-warm` | `#A65825` | `frontend/src/index.css` | Cognac highlight strokes, review star icons |
| `--accent-warm-subtle` | `rgba(166, 88, 37, 0.08)`| `frontend/src/index.css` | Subtle badge tinted backgrounds |

### Border Tokens
| Token | Implemented Value | Source File | Usage / Components |
|---|---|---|---|
| `--border-subtle` | `#EAE4D9` | `frontend/src/index.css` | Card perimeters, hairline dividers, navbar bottom border |
| `--border-medium` | `#D7CFBF` | `frontend/src/index.css` | Form field borders, secondary button perimeters |
| `--border-strong` | `#191512` | `frontend/src/index.css` | High-contrast selection borders |
| `--border-focus` | `#D96B27` | `frontend/src/index.css` | Input active focus outline and highlight border |

### Semantic Status Tokens
| Token | Implemented Value | Source File | Usage / Components |
|---|---|---|---|
| `--status-in-stock` | `#256A47` | `frontend/src/index.css` | "In Stock" badge text, completed stepper badges, success states |
| `--status-in-stock-bg` | `#EAF5EE` | `frontend/src/index.css` | Background pill for in-stock and confirmed statuses |
| `--status-low-stock` | `#B8621B` | `frontend/src/index.css` | "Only X Left" warning status badge text |
| `--status-low-stock-bg`| `#FDF1E6` | `frontend/src/index.css` | Low stock alert background pill |
| `--status-out-stock` | `#8B2323` | `frontend/src/index.css` | "Sold Out" status badge text, error alert text |
| `--status-out-stock-bg`| `#FAEAEA` | `frontend/src/index.css` | Error alert banners, sold-out pill background |
| `--status-featured` | `#8D4C1B` | `frontend/src/index.css` | "Featured Selection" pill text |
| `--status-featured-bg` | `#F9EDE2` | `frontend/src/index.css` | Featured badge background |

---

## 2. Typography Specification

### Font Families & External Imports
Imported in [`frontend/index.html`](file:///c:/Users/Spoof/.gemini/antigravity-ide/scratch/CodeAlpha_EcommerceStore/frontend/index.html#L11-L13):
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
```

| Token / Typeface | Value | Source File | Role |
|---|---|---|---|
| `--font-sans` | `'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | `frontend/src/index.css` | Body copy, metadata, form inputs, button labels |
| `--font-display` | `'Outfit', 'Plus Jakarta Sans', sans-serif` | `frontend/src/index.css` | Headings (`h1`–`h6`), modal titles, brand wordmark |
| `--font-serif` | `'Instrument Serif', Georgia, 'Times New Roman', serif` | `frontend/src/index.css` | Editorial retail accents, edition headers |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` | `frontend/src/index.css` | Technical specifications, reference tokens |

### Typographic Hierarchy & Scale
| Hierarchy Level | Font Family | Size | Weight | Line Height | Letter Spacing | Implemented Selector / Source |
|---|---|---|---|---|---|---|
| **Display / Hero H1** | `Outfit` | `3.25rem` (52px) | 800 | 1.08 | `-0.03em` | `.hero-title` (`App.css:502`) |
| **Section Heading H2** | `Outfit` | `2.25rem` (36px) | 800 | 1.15 | `-0.025em` | `h2`, `.values-title` (`App.css:1328`) |
| **Modal Heading H2/H3**| `Outfit` | `1.45rem` (23px) | 800 | 1.2 | `-0.02em` | `.checkout-header-title` (`App.css:2892`) |
| **Drawer Heading** | `Outfit` | `1.2rem` (19px) | 800 | 1.2 | normal | `.drawer-heading` (`App.css:2314`) |
| **Card Product Title** | `Plus Jakarta Sans` | `1.05rem` (17px) | 700 | 1.35 | `-0.01em` | `.card-title` (`App.css:984`) |
| **Price (Tabular)** | `Plus Jakarta Sans` | `1.15rem` (18px) | 800 | 1 | normal | `.card-price`, `.tabular-nums` (`App.css:1014`) |
| **Body Copy** | `Plus Jakarta Sans` | `1rem` (16px) | 400 / 500 | 1.6 | normal | `p`, `.hero-subtitle` (`App.css:520`) |
| **Eyebrow / Edition** | `Plus Jakarta Sans` | `0.72rem` (11.5px)| 800 | 1.2 | `0.12em` (uppercase) | `.orders-eyebrow`, `.hero-badge` |
| **Form Label** | `Plus Jakarta Sans` | `0.84rem` (13.5px)| 700 | 1.2 | normal | `.checkout-field-label` (`App.css:2990`) |
| **Status / Pill Text** | `Plus Jakarta Sans` | `0.75rem` (12px) | 700 | 1.2 | `0.02em` | `.card-stock-pill` (`App.css:1025`) |

---

## 3. Spacing & Shape Geometry

### Border Radius Tokens (`frontend/src/index.css`)
- `--radius-xs`: `4px` (Smallest tags, micro-badges)
- `--radius-sm`: `8px` (Icon buttons, quantity stepper controls)
- `--radius-md`: `12px` (Form input fields, review summary boxes)
- `--radius-lg`: `18px` (Catalog product cards, values grid cards)
- `--radius-xl`: `24px` (Dialog modals, floating drawers, auth card)
- `--radius-pill`: `9999px` (Action buttons, category filter tabs, badges, cart pill)

### Elevation & Box Shadows (`frontend/src/index.css`)
- `--shadow-xs`: `0 1px 2px rgba(25, 21, 18, 0.04)`
- `--shadow-sm`: `0 2px 6px rgba(25, 21, 18, 0.05)`
- `--shadow-md`: `0 6px 18px rgba(25, 21, 18, 0.06), 0 2px 4px rgba(25, 21, 18, 0.02)`
- `--shadow-lg`: `0 14px 34px rgba(25, 21, 18, 0.08), 0 4px 10px rgba(25, 21, 18, 0.03)`
- `--shadow-hover`: `0 18px 40px rgba(217, 107, 39, 0.12), 0 6px 16px rgba(25, 21, 18, 0.06)`
- `--shadow-modal`: `0 25px 60px rgba(25, 21, 18, 0.18), 0 8px 20px rgba(25, 21, 18, 0.08)`
- **Checkout Modal Special**: `0 24px 60px -12px rgba(25, 21, 18, 0.28), 0 6px 20px rgba(0, 0, 0, 0.06)`

---

## 4. Component Design Specifications

### 1. Primary Action Button
- **Class**: `.editorial-button-primary` (`frontend/src/App.css:1783`)
- **Geometry**: `padding: 0.85rem 1.6rem`, `border-radius: var(--radius-pill)` (9999px), `width: 100%`.
- **Palette**: `background-color: var(--accent-primary)` (`#D96B27`), text `#FFFFFF`, font-weight `700`.
- **Shadow**: `box-shadow: 0 3px 10px rgba(217, 107, 39, 0.28)`.
- **Hover**: `background-color: var(--accent-primary-hover)` (`#C25716`), `transform: translateY(-1px)`, `box-shadow: 0 5px 16px rgba(217, 107, 39, 0.38)`.
- **Active / Pressed**: `transform: scale(0.98)` (`index.css:151`).
- **Success Modifier**: `.btn-success` switches background to `var(--status-in-stock)` (`#256A47`).

### 2. Secondary Outline Button
- **Class**: `.editorial-button-secondary` (`frontend/src/App.css:1290`)
- **Geometry**: `padding: 0.65rem 1.4rem`, `border-radius: var(--radius-pill)`, `font-size: 0.88rem`, `font-weight: 600`.
- **Palette**: `background-color: var(--bg-surface)` (`#FFFFFF`), `border: 1px solid var(--border-medium)` (`#D7CFBF`), `color: var(--text-primary)` (`#191512`).
- **Hover**: `background-color: var(--bg-subtle)` (`#F4EFE8`), `border-color: var(--text-primary)`.

### 3. Liquid Glass Cart Pill Button
- **Class**: `.nav-cart-btn.nav-glass-cart-btn` (`frontend/src/App.css:221-279`)
- **Geometry**: `min-height: 42px`, `padding: 0.5rem 1.15rem`, `border-radius: var(--radius-pill)`.
- **Materiality**:
  - `background: linear-gradient(135deg, rgba(217, 107, 39, 0.90) 0%, rgba(194, 87, 22, 0.84) 100%)`.
  - `backdrop-filter: blur(12px)`.
  - `border: 1px solid rgba(255, 255, 255, 0.40)`.
  - Inner specular reflection (`.glass-btn-reflection`): `height: 50%`, `background: linear-gradient(180deg, rgba(255, 255, 255, 0.35) 0%, rgba(255, 255, 255, 0.06) 65%, transparent 100%)`.
- **Shadows**:
  - Inset specular light: `inset 0 1px 1px 0 rgba(255, 255, 255, 0.5)`
  - Inset ambient occlusion: `inset 0 -1px 2px 0 rgba(0, 0, 0, 0.16)`
  - Drop glow: `0 4px 14px rgba(217, 107, 39, 0.28)`
- **Hover**: `transform: translateY(-1.5px)`, `border-color: rgba(255, 255, 255, 0.60)`, `box-shadow: 0 6px 22px rgba(217, 107, 39, 0.4), 0 0 14px rgba(245, 166, 35, 0.30)`.

### 4. Spotlight Product Card
- **Class**: `.retail-product-card.spotlight-card` (`frontend/src/App.css:859-923`)
- **Geometry**: `border-radius: var(--radius-lg)` (18px), `border: 1px solid var(--border-subtle)` (`#EAE4D9`), `box-shadow: var(--shadow-sm)`.
- **Aspect Ratio**: Media container strictly `aspect-ratio: 4 / 3.4`, `background-color: var(--bg-subtle)`.
- **Dynamic Cursor Spotlight**:
  - Background radial glow (`.card-spotlight-glow`): `radial-gradient(420px circle at var(--mouse-x) var(--mouse-y), rgba(217, 107, 39, 0.12) 0%, rgba(245, 166, 35, 0.05) 35%, transparent 70%)`.
  - Glowing perimeter mask (`.card-spotlight-border`): `padding: 1.5px`, `mask-composite: exclude`, illuminated via dynamic CSS coordinates on pointer move.
- **Hover**: `transform: translateY(-3px)`, `box-shadow: 0 12px 28px rgba(25, 21, 18, 0.07), 0 2px 6px rgba(217, 107, 39, 0.08)`, `border-color: rgba(217, 107, 39, 0.28)`.

### 5. Form Input Controls
- **Class**: `.checkout-input`, `.auth-input`, `.newsletter-input`
- **Geometry**: `height: 44px` (touch target standard), `border-radius: var(--radius-md)` (12px), `padding: 0.75rem 1rem`.
- **Palette**: `background-color: var(--bg-surface)` (`#FFFFFF`), `border: 1px solid var(--border-medium)` (`#D7CFBF`), `color: var(--text-primary)`.
- **Focus State**: `border-color: var(--border-focus)` (`#D96B27`), `box-shadow: 0 0 0 3px var(--accent-primary-subtle)` (`rgba(217, 107, 39, 0.09)`), `outline: none`.

### 6. Modal Dialogs & Backdrop
- **Backdrop**: `.editorial-modal-overlay` (`App.css:1508`) with `background-color: rgba(25, 21, 18, 0.65)`, `backdrop-filter: blur(8px)`, `z-index: 70`.
- **Dialog Shell**: `.editorial-modal-box` with `border-radius: var(--radius-xl)` (24px), `max-width: 520px`, `padding: 2.25rem`, `box-shadow: var(--shadow-modal)`.
- **Animation**: Scaled entry `@keyframes modalScaleUp` (from `scale(0.95) translateY(8px)` with opacity 0 to `scale(1) translateY(0)` with opacity 1 in 240ms).
- **Dismiss Control**: Circular 36×36px pill with `border-radius: 50%`, `background-color: var(--bg-subtle)` transitioning to `var(--accent-dark)` on hover.

### 7. Cart Slide-Over Drawer
- **Backdrop**: `.editorial-drawer-overlay` with `z-index: 80`, `justify-content: flex-end`.
- **Panel**: `.editorial-drawer-panel` (`App.css:2280`) with `max-width: 440px`, `height: 100%`, `animation: slideInRight 240ms cubic-bezier(0.16, 1, 0.3, 1)`.
- **Delivery**: Calculated at checkout (`.shipping-complimentary` text badge displaying "Calculated at checkout").


---

## 5. Interaction, Motion & Accessibility Specs

### Timing Functions & Transitions
- **`--transition-fast`**: `150ms cubic-bezier(0.16, 1, 0.3, 1)` (Button color hovers, focus outlines, dismiss icons).
- **`--transition-smooth`**: `240ms cubic-bezier(0.16, 1, 0.3, 1)` (Card lifts, modal scales, drawer slides).
- **`--transition-bounce`**: `320ms cubic-bezier(0.34, 1.56, 0.64, 1)` (Success checkmark pops, badge reveals).

### Accessibility Rules
1. **Focus Rings**:
   ```css
   :focus-visible {
     outline: 2px solid var(--accent-primary);
     outline-offset: 3px;
   }
   ```
2. **Reduced Motion**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
     }
     .card-spotlight-glow, .card-spotlight-border { display: none !important; }
   }
   ```
3. **Touch Device Hover Suppression**:
   ```css
   @media (hover: none) {
     .card-spotlight-glow, .card-spotlight-border { display: none !important; }
   }
   ```
4. **Body Scroll Lock**:
   ```css
   body.modal-open {
     overflow: hidden;
     overscroll-behavior: contain;
   }
   ```

---

## 6. Layout & Responsive Breakpoints

### Primary Viewport Breakpoints
| Breakpoint | CSS Media Query | Target Devices | Source File & Layout Adjustments |
|---|---|---|---|
| **Max Width** | `--max-width: 1320px` | Wide Desktops | `index.css:68`, `main-content` max width |
| **Desktop / Laptop**| `@media (max-width: 992px)` | Small Laptops / Tablets | `App.css:676`, Catalog toolbar stacks search & category pills |
| **Tablet Portrait** | `@media (max-width: 768px)` | iPads / Tablets | `App.css:27`, `App.css:1816`, Navigation collapses to mobile drawer, `.main-content` padding reduces to `1rem 3.5rem`, modal splits collapse to 1 column |
| **Mobile Standard** | `@media (max-width: 600px)` | Phablets / Large Phones| `App.css:2843`, Review grids stack vertically |
| **Mobile Narrow** | `@media (max-width: 480px)` | Compact Phones | `App.css:2223`, `App.css:4036`, Steppers wrap, order cards reduce to `1rem` padding |

---

## Source Files Inspected

- `frontend/src/index.css`
- `frontend/src/App.css`
- `frontend/index.html`
- `frontend/src/components/Navbar.jsx`
- `frontend/src/components/HeroSection.jsx`
- `frontend/src/components/ProductGrid.jsx`
- `frontend/src/components/ProductCard.jsx`
- `frontend/src/components/ProductDetailModal.jsx`
- `frontend/src/components/CartDrawer.jsx`
- `frontend/src/components/CheckoutModal.jsx`
- `frontend/src/components/OrdersModal.jsx`
- `frontend/src/components/AuthModal.jsx`
- `frontend/src/components/ProfileModal.jsx`
- `frontend/src/components/BrandValues.jsx`
- `frontend/src/components/Icons.jsx`
- `frontend/src/components/SkeletonCard.jsx`
