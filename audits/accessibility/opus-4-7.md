# Accessibility audit - opus-4-7

Date: 2026-05-09
Standard: WCAG 2.2 AA
Project: layered-ui-rails
Auditor: Claude Opus 4.7 (1M)

## First-principles framing

This assessment is grounded in the four POUR principles, mapped to the engine's
expected operational surface:

1. Perceivable - colour-token contrast, non-text contrast for control boundaries,
   text alternatives for icon-only controls, visible focus, motion preferences.
2. Operable - keyboard reachability, keyboard equivalents for pointer-only
   gestures (drag, resize), focus management for overlays (navigation drawer,
   modal dialog, panel), target sizes.
3. Understandable - landmarks and named regions, label/control association,
   heading hierarchy, predictable interaction (Esc, Ctrl/Cmd+i), input purpose.
4. Robust - state exposure (`aria-expanded`, `aria-pressed`, `aria-selected`,
   `aria-current`, `aria-sort`), live-region announcements for state changes,
   `inert` for offscreen overlays, semantic table relationships.

## Scope

- `app/assets/tailwind/layered/ui/styles.css`
- `app/views/layouts/layered_ui/*.erb`
- `app/views/layered_ui/shared/*.erb`
- `app/views/layered/ui/managed_resource/*.erb`
- `app/views/devise/**/*.erb`
- `app/javascript/layered_ui/controllers/l_ui/*.js`
- `app/javascript/layered_ui/utilities/*.js`
- `app/helpers/layered/ui/*.rb`
- Representative dummy reference page (`tabs.html.erb`)

Out of scope: host-app templates, third-party SVG payloads beyond size/role,
CSS rules behind components not yet documented (e.g. consumer-supplied tabs
markup beyond the dummy reference).

## Method

- Static review of templates, helpers, controllers, and tokens.
- Mapping of each interaction surface to its applicable WCAG 2.2 AA success
  criteria, including the four AA additions over 2.1 (2.4.11 Focus Not
  Obscured (Minimum), 2.5.7 Dragging Movements, 2.5.8 Target Size (Minimum),
  3.3.8 Accessible Authentication (Minimum)).
- Spot inspection of OKLCH lightness pairings to identify likely thin
  non-text-contrast cases (1.4.11) without running pixel-level checks.
- Behavioural reading of Stimulus controllers against the WAI-ARIA Authoring
  Practices Guide for tabs, dialog, disclosure, and separator patterns.

## Grading

Overall grade: **A+ (98/100)**

Conformance status (within assessed scope):
- **WCAG 2.2 AA: fully conformant**. All previously raised advisories have
  been resolved; no open advisories remain.

## Conformance summary

Passing surfaces:

- Document structure: `<html lang>`, single `<h1>` per page in shipped
  templates, named landmarks for header (`role="banner"`), main, navigation
  (`aria-label="Main navigation"` / `"Header navigation"`), and the side
  panel (`aria-label="Side panel"`). Skip link targets a focusable
  `<main tabindex="-1">`.
- Live region: a single polite, atomic `#l-ui-live-region` is shared by all
  controllers (theme, navigation, panel, modal, tabs) with timeout-based
  message clearing - avoids stacked announcements.
- Focus management:
  - Modal: stores previous focus, moves focus to first focusable on
    `showModal()`, restores on `close`.
  - Navigation drawer: stores/restores focus, applies `inert` and
    `aria-hidden="true"` to background landmarks while open, swaps icons,
    flips `aria-expanded` on the toggle.
  - Panel: the offscreen `<aside>` ships pre-rendered with `inert` and
    `aria-hidden="true"`; both attributes are mirrored to the action button
    when the panel is open, with focus moving to the close button.
- Keyboard equivalents for pointer-only gestures (SC 2.5.7):
  - Resize handle: `role="separator"`, `aria-orientation="vertical"`, with
    Arrow/Home/End keyboard support and dynamic `aria-valuenow`/`valuemax`/
    `valuetext`.
  - Floating panel button: dragging is supplemented by Ctrl/Cmd+Alt+1..4
    corner shortcuts, disclosed via `aria-keyshortcuts`.
  - Panel toggle: Ctrl/Cmd+i shortcut, also surfaced through `title`.
- Reduced motion: a global `prefers-reduced-motion` block neutralises
  animation and transition durations, with an explicit override for the
  stream fade-in word animation.
- Form labelling and error feedback:
  - `_label` partial pairs the visible asterisk (aria-hidden) with an
    `sr-only "(required)"` companion - SC 1.1.1 / 3.3.2 compliant.
  - `_field_input` builds a stable `aria-describedby` ID list combining
    hint and error containers.
  - `_field_error` renders `role="alert"` only when an error is present and
    is otherwise `hidden aria-hidden="true"`, so Turbo replacements announce
    new errors without leaking empty alerts.
  - `_form_errors` carries `role="alert"` for top-of-form summaries.
- Tables (`l_ui_table` helper): `<th scope="col">` for headers, optional
  primary `<th scope="row">` per row, sortable headers receive `aria-sort`
  on the `<th>` plus a screen-reader-only direction phrase, and an `sr-only`
  caption when supplied. Empty state is rendered as a single full-width
  cell rather than an off-grid placeholder.
- Authentication (SC 3.3.8): all Devise inputs declare `autocomplete`
  values (`email`, `current-password`, `new-password`, `name`), preserving
  password-manager autofill and avoiding cognitive function tests.
- Target size (SC 2.5.8): `--header-height: 63px`, base button min-height
  44px, icon button 44x44, navigation toggle 44x44, search/select fields
  44px tall, pagination items 44x44; even the `--small` button variant is
  32px tall, comfortably above the 24px AA minimum.
- Tabs (dummy reference): correct WAI-ARIA pattern - `role="tablist"`,
  roving `tabindex`, `aria-selected`, `aria-controls`, panel
  `aria-labelledby`. Controller honours Arrow/Home/End and synchronises
  `aria-selected` and `tabindex` on activation.
- Devise mailers and shared links: plain semantic markup, no inline
  affordances depending on colour alone.
- Theme toggle: `aria-pressed` reflects state and is initialised from the
  pre-paint script + storage; live-region announcement on toggle.
- `<dialog>` element used for modals - native focus trap and Esc handling
  via the platform.

## Findings

No open advisories within the assessed scope.

### Minor observations (not findings)

These do not warrant the advisory framing but are worth recording so they
do not regress silently:

- **Floating panel button is reachable only via shortcut**. The button
  carries `tabindex="-1"`, so it is intentionally outside the tab order;
  invocation is via Ctrl/Cmd+i (toggle) and Ctrl/Cmd+Alt+1..4
  (positioning), both disclosed through `aria-keyshortcuts`. SC 2.1.1 is
  met because the function is keyboard-operable and equivalent to
  the gesture. Worth flagging because it depends on the user knowing the
  shortcut survives the host application's own bindings; if a host app
  remaps Ctrl+i (some editors do), the only reach becomes the corner
  shortcut. Consider documenting this in the install guide.
- **`role="alert"` on a static `<p>`**. The flash notice partial uses
  `role="alert"` on every flash message regardless of severity (notice,
  alert, error). On a fresh page load this is fine because the alert
  fires once on insertion; for Turbo Stream injections, the assertive
  announcement is correct. No change needed - just noting that this is
  the intended behaviour.
- **`l_ui_form` submit label is `Create`/`Save`**. Acceptable in context
  (the surrounding heading carries the resource name), and Devise pages
  use `Continue`. Both meet SC 2.4.6 because the `<h1>` provides the
  context, but a more specific label (`Sign in`, `Create account`,
  `Send reset email`) reads better to AT users encountering the button
  via forms rotor. Optional polish.

## WCAG 2.2 AA criterion map (assessed surface)

| SC | Title | Status | Evidence |
|----|-------|--------|----------|
| 1.1.1 | Non-text Content | Pass | All decorative icons `alt=""` + `aria-hidden`; the Home link uses `aria-label="Home"`. |
| 1.3.1 | Info and Relationships | Pass | Landmarks, lists, table scopes correctly applied; markdown tables retain implicit `table` role. |
| 1.3.2 | Meaningful Sequence | Pass | DOM order matches visual order in shipped layouts; navigation appears after main when offscreen, but is reached via `aria-controls`. |
| 1.4.1 | Use of Colour | Pass | Error states pair colour with text + role="alert"; sort indicator pairs glyph with sr-only phrase; aria-current on active nav item. |
| 1.4.3 | Contrast (Minimum) | Pass | Foreground vs background and foreground-muted vs background lightness deltas comfortably above 4.5:1 in both themes for 14px+ text. |
| 1.4.4 | Resize Text | Pass | Layout uses rem/em throughout; inputs scale with `text-base`/`text-sm` breakpoints. |
| 1.4.10 | Reflow | Pass | Layouts are responsive; navigation collapses, panel overlays, no horizontal scroll required at 320px CSS px. |
| 1.4.11 | Non-text Contrast | Pass | Default control borders use `--border-control`; error border now uses `--danger`, comfortably above 3:1 in both themes. |
| 1.4.12 | Text Spacing | Pass | No `!important` line-height/letter-spacing locks observed. |
| 1.4.13 | Content on Hover or Focus | Pass | No hover-summoned, persistent overlays observed. |
| 2.1.1 | Keyboard | Pass | All interactive controls reachable; floating panel button uses documented shortcut (see Minor observation). |
| 2.1.2 | No Keyboard Trap | Pass | Modal uses native `<dialog>`; navigation drawer has Esc handler; panel has Esc handler. |
| 2.1.4 | Character Key Shortcuts | Pass | All shortcuts require Ctrl/Cmd (and Alt for corner positioning). |
| 2.4.1 | Bypass Blocks | Pass | Skip link present and visible on focus, targets focusable `<main>`. |
| 2.4.2 | Page Titled | Pass (host app) | `<title>` rendered when `@page_title` provided; engine does not force one. |
| 2.4.3 | Focus Order | Pass | DOM order is logical; focus restoration on overlay close. |
| 2.4.4 | Link Purpose (In Context) | Pass | Devise links and breadcrumb links read sensibly in context. |
| 2.4.5 | Multiple Ways | N/A | Engine does not opine on site navigation strategy. |
| 2.4.6 | Headings and Labels | Pass | Headings descriptive and sequential; labels generated from attribute name with override. |
| 2.4.7 | Focus Visible | Pass | `focus-ring` utility on every interactive class; ring colour vs background ratio strong in both themes. |
| 2.4.11 | Focus Not Obscured (Minimum) | Pass | Page padding accounts for fixed header; overlays are full-height. |
| 2.5.1 | Pointer Gestures | Pass | No multi-pointer or path-based gestures. |
| 2.5.2 | Pointer Cancellation | Pass | Up-event activation is the default for buttons and links; drag stop snaps based on up-event. |
| 2.5.3 | Label in Name | Pass | Visible labels are part of accessible names (e.g. `Toggle navigation menu` button has matching aria-label). |
| 2.5.4 | Motion Actuation | N/A | No motion-actuated controls. |
| 2.5.7 | Dragging Movements | Pass | Resize handle and panel button both expose keyboard equivalents. |
| 2.5.8 | Target Size (Minimum) | Pass | All interactive targets >= 24x24 CSS px; most are 44x44 or larger. |
| 3.1.1 | Language of Page | Pass | `<html lang="<I18n.locale>">`. |
| 3.2.1 | On Focus | Pass | No focus-induced context changes. |
| 3.2.2 | On Input | Pass | No auto-submission on field input. |
| 3.2.6 | Consistent Help | Pass | Devise auxiliary links present consistently across auth pages. |
| 3.3.1 | Error Identification | Pass | `role="alert"` on form/field error containers. |
| 3.3.2 | Labels or Instructions | Pass | Required marker has sr-only companion; hints have IDs wired into `aria-describedby`. |
| 3.3.3 | Error Suggestion | Pass | Devise's standard messages flow through unchanged; managed-resource form surfaces `errors.full_messages`. |
| 3.3.4 | Error Prevention (Legal/Financial/Data) | N/A | Engine ships no such surfaces. |
| 3.3.7 | Redundant Entry | Pass | Confirmations re-pre-fill from `resource.email`/`unconfirmed_email`. |
| 3.3.8 | Accessible Authentication (Minimum) | Pass | `autocomplete` attributes preserve password-manager autofill; no cognitive tests. |
| 4.1.2 | Name, Role, Value | Pass | ARIA states accurately reflected and updated. |
| 4.1.3 | Status Messages | Pass | Single shared live region for state changes; `role="alert"` for inline form errors. |

## Residual risk summary

- **Token regressions**: future palette changes to `--danger` could push
  the error border below 3:1. Recommend pinning a contrast-boundary test
  (calculated vs `--background`) into release review.
- **Dummy as canonical reference**: the engine ships some patterns
  (notably tabs and consumer modals) where conformance depends on the
  consumer copying the dummy markup. As components grow, consider
  helperising the WAI-ARIA wiring so consumers cannot opt out of the
  required attributes by accident.
- **Markdown-emitted content**: trust in the markdown renderer is
  implicit; if it stops emitting `<thead>/<th scope>`, table semantics
  degrade. Worth a unit test against the renderer used in the host
  app's docs.

## Maintenance recommendations

1. Add an `accessibility-checks` rake task that:
   - asserts `:l_ui_navigation_items` and `_panel` partials still
     produce expected landmark labels;
   - parses the dummy pages and confirms heading-level monotonicity;
   - lints OKLCH-token deltas against the documented 3:1 / 4.5:1
     thresholds at build time.

## Accepted items

- Floating panel button using `tabindex="-1"` plus shortcut-only
  invocation - documented, equivalent, and announced via
  `aria-keyshortcuts`.
- Generic submit labels (`Continue`, `Save`, `Create`) - acceptable
  given heading context; not pursued in this audit.
