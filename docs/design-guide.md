# NomadFlow: Design System & Style Guide

## 1. Project Overview

**NomadFlow** is a high-utility travel companion application built with shadcn/ui. The application focuses on providing real-time vehicle waiting times, route navigation, and discovery of nearby points of interest (POIs).

## 2. Design Philosophy: "Contextual Clarity"

The design prioritizes **glanceable information**. Travelers are often in motion, requiring high-contrast typography, intuitive color-coding for data states, and large touch targets.

---

## 3. Color Palette

Designed for WCAG AA accessibility compliance and visual hierarchy.

### Primary & Secondary

-   **Primary (Action Indigo):** `#4F46E5` — Used for main CTAs, active states, and branding.
-   **Secondary (Deep Slate):** `#0F172A` — Used for primary headings and high-contrast text.
-   **Muted (Soft Slate):** `#64748B` — Used for supporting text, borders, and inactive icons.

### Status Accents (Real-time Data)

-   **Low Wait / On Time:** `#10B981` (Emerald Green)
-   **Moderate Wait / Slow:** `#F59E0B` (Amber)
-   **High Wait / Delayed:** `#EF4444` (Rose Red)
-   **Discovery / POI:** `#8B5CF6` (Vibrant Violet)

### Backgrounds

-   **App Background:** `#F8FAFC` (Cool Gray)
-   **Surface/Card:** `#FFFFFF` (Pure White)

---

## 4. Typography

The system uses **Plus Jakarta Sans** for its modern, geometric feel and high legibility.

-   **Font Family:** `Plus Jakarta Sans`, sans-serif (Fallback: `Inter`)
-   **Headings:**
    -   `H1 - H2`: Bold (700), Tracking -0.02em.
    -   `H3 - H4`: Semi-bold (600).
-   **Body:**
    -   Standard: Regular (400) or Medium (500).
-   **Data Points:**
    -   Specific focus on semi-bold (600) for time/distance numbers to ensure they stand out.

---

## 5. Component Styling (shadcn/ui Customization)

### Button Styling

-   **Border Radius:** `0.75rem` (xl) for a modern, tactile feel.
-   **Primary:** Solid Action Indigo with a subtle `shadow-md`.
-   **Ghost:** Used for map overlays to minimize visual clutter.

### Card Styling

-   **Elevation:** `shadow-sm` for standard info cards; `shadow-lg` for active route/navigation cards.
-   **Border:** `1px` solid `#E2E8F0` (slate-200).
-   **Contextual Indicator:** Cards featuring "Wait Times" include a `4px` left-border accent colored according to the status (Green/Amber/Red).

### Input Styling

-   **Search Bar:** `rounded-full` (pill shape) with `8px` backdrop-blur when positioned over a map.
-   **Focus State:** `2px ring-indigo-500` with `ring-offset-2`.

---

## 6. Icons & Imagery

-   **Icon Set:** `Lucide-react`
-   **Stroke Width:** `2px` for clarity.
-   **Categories:**
    -   _Transit:_ `Bus`, `Train`, `Tram`, `Car`
    -   _Navigation:_ `Navigation-2`, `Map-pin`, `Route`
    -   _POI:_ `Coffee`, `Sparkles`, `Utensils`, `Landmark`

---

## 7. App Spacing & Layout

-   **Grid System:** 8px base grid.
-   **App Margins:** 16px (Mobile), 24px (Desktop).
-   **Component Gaps:** \* `gap-2` (8px) for related label/icon groups.
    -   `gap-4` (16px) for list items and card stacks.

---

## 8. Motion and Animation

-   **Transitions:** `200ms ease-in-out` for hover and toggle states.
-   **Loading:** Skeleton pulse for data-heavy sections (waiting times/routes).
-   **Map Feedback:** \* "Live" transit markers feature a soft, low-opacity pulse animation.
    -   Navigation drawers use a `slide-up` transition from the bottom of the viewport.
