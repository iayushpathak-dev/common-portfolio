## Introduction

Most of the web screens I build don't run in a normal browser tab. They run inside other companies' iOS and Android apps, in WebViews, on everything from a new iPhone to a five-year-old Android phone. Layouts that look perfect in desktop Chrome's device mode break there: bottom buttons hide behind the keyboard, content slides under the notch, the page bounces, and on some phones the CSS doesn't load at all.

These are the rules we follow in our Next.js 16 + Tailwind CSS 4 app, and why each one exists.

## Problem statement

Mobile WebViews differ from desktop browsers in four ways that affect layout:

1. **Viewport height changes** as browser toolbars show and hide, and when the keyboard opens.
2. **Notches and home indicators** cover parts of the screen.
3. **iOS and Android handle the keyboard differently.**
4. **Old WebViews** don't support modern CSS features your framework may rely on.

## Learning objectives

1. Size full-screen layouts correctly on mobile.
2. Handle safe areas without hardcoding pixel values.
3. Keep inputs and bottom bars visible above the keyboard on iOS and Android.
4. Ship Tailwind CSS 4 to WebViews older than it supports by default.

## Core concepts

- **`100vh` vs `100dvh`**: on mobile, `100vh` is the height with the toolbar hidden, so a `100vh` page is taller than the visible area. `dvh` follows the visible height.
- **`viewport-fit=cover`** lets the page draw under the notch; `env(safe-area-inset-*)` tells you how much to pad.
- **`interactive-widget=resizes-content`** makes Android shrink the layout when the keyboard opens. iOS ignores it and draws the keyboard over the page.
- **`visualViewport`**: a browser API that reports the area actually visible, keyboard excluded.

## Technical explanation

### 1. The viewport export

```js
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};
```

We don't disable zoom: it's an accessibility feature.

### 2. Never `h-screen`

We define our own utilities, `h-app` and `min-h-app`, with fallbacks: `100vh`, then `var(--app-height)`, then `100dvh`. Older browsers use the first value they understand. The root `body` is `min-h-app flex flex-col`.

### 3. Safe area utilities

Tailwind 4's `@utility` lets us write `px-safe-5`: the safe-area inset **plus** spacing 5 (20px). Every screen uses it for side padding, so content never sits under a rounded corner or notch, and phones without a notch get exactly 20px.

One gotcha: the functional utility must use `--value(number)`, not `--value(integer)`. With `integer`, a class like `pb-safe-2.5` silently isn't generated.

### 4. The iOS keyboard

On iOS the keyboard covers the page and `dvh` doesn't change. A small inline script in `<head>` reads `visualViewport` and sets two CSS variables:

- `--app-height`: the visible height.
- `--keyboard-height`: the keyboard's height (0 on Android, which resizes the layout itself).

It also scrolls a focused input into view after 300ms if the keyboard hid it, and ignores updates while the user is pinch-zoomed.

Screens with forms are a fixed-height shell: header, a `flex-1 overflow-auto` scroll area, and the bottom bar as the **last flex child**, not `position: fixed`. When the shell shrinks above the keyboard, nothing is cut off. If a bar really must be fixed, it uses `bottom: var(--keyboard-height)` and the scroll area gets matching bottom padding.

### 5. Small things that matter

- **Inputs at least 16px.** Smaller inputs make iOS zoom in on focus.
- **`overscroll-behavior: none`** on `html` and `body` removes the iOS rubber band (iOS 16+) and Android pull-to-refresh; inner scroll areas use `overscroll-contain`.
- **`text-size-adjust: 100%`**, no tap highlight, `touch-action: manipulation`.
- **`formatDetection`** off, so iOS doesn't turn numbers into phone links.
- **No black flash.** A page with its own theme sets `data-page-theme` on its root, and `:root:has([data-page-theme=dark])` gives `body` the same colour during the screen transition.

### 6. Old WebViews and Tailwind 4

Our target is Chrome/Android WebView 88+ and iOS Safari 14+. Tailwind 4 puts its CSS in cascade `@layer` blocks, which browsers before Chrome 99 and iOS 15.4 **drop entirely**. On those phones the page had no styles at all.

The fix: run Tailwind through PostCSS and add `@csstools/postcss-cascade-layers` after it. It removes `@layer` and keeps the layer order using selector specificity. We also set `browserslist` in `package.json`, which Next.js uses for both JS transpiling and CSS minification.

## Code example

```js
// postcss.config.mjs
export default {
  plugins: ["@tailwindcss/postcss", "@csstools/postcss-cascade-layers"],
};
```

```css
/* globals.css */
@utility h-app {
  height: 100vh;
  height: var(--app-height, 100vh);
}
@utility px-safe-* {
  padding-left: calc(env(safe-area-inset-left, 0px) + --spacing(--value(number)));
  padding-right: calc(env(safe-area-inset-right, 0px) + --spacing(--value(number)));
}
@utility bottom-keyboard {
  bottom: var(--keyboard-height, 0px);
}
```

A form screen:

```jsx
<div className="flex h-app flex-col">
  <Header title="Patient details" />
  <div className="flex-1 overflow-auto overscroll-contain px-safe-5">{/* fields */}</div>
  <div className="px-safe-5 pb-safe-4">
    <button className="btn-primary w-full">Continue</button>
  </div>
</div>
```

## Production considerations

- **Ask the native team for two settings.** Android: `windowSoftInputMode="adjustResize"`. iOS WKWebView: `scrollView.bounces = false` and `contentInsetAdjustmentBehavior = .never`, so the page handles the safe area itself.
- **Test on real old devices.** Desktop device mode doesn't reproduce the keyboard, the toolbar or missing CSS features.
- **Polyfills.** Next.js polyfills some newer JS (`Array.prototype.at`, `Object.hasOwn`); newer APIs like `structuredClone` or `toSorted` need your own polyfill or must be avoided.

## Trade-offs and alternatives

- **Tailwind 3** supports older browsers without the extra PostCSS plugin, but you lose Tailwind 4's CSS-first config and `@utility`.
- **Fixed bottom bars** are simpler to write but need keyboard handling on iOS; a flex shell needs none.
- **Disabling zoom** prevents the iOS focus zoom, but it hurts accessibility. 16px inputs fix the same problem.

## Common mistakes

- Using `h-screen` / `100vh` for full-screen mobile layouts.
- Hardcoding notch padding instead of using `env(safe-area-inset-*)`.
- `position: fixed` bottom buttons on iOS with no keyboard handling.
- Shipping Tailwind 4 to old WebViews without removing `@layer`.

## Key takeaways

- Size with `dvh` and a JavaScript fallback, never `100vh`.
- Safe-area insets plus spacing, as utilities, on every screen.
- On iOS you have to handle the keyboard yourself; a flex shell does most of it.
- Check what your CSS framework needs from the browser before you ship it to old WebViews.
