# Accessibility audit - codex-5_5

Date: 2026-05-09
Standard: WCAG 2.2 AA
Project: layered-ui-rails
Auditor: Codex 5.5

## First-principles framing

This assessment uses the POUR model as the organising frame:

1. Perceivable - text, icons, state, focus, motion, and control boundaries must be detectable.
2. Operable - primary behaviour must work with keyboard, pointer, and assistive technology.
3. Understandable - labels, instructions, errors, and state changes must be predictable.
4. Robust - semantic relationships and ARIA state must survive common assistive technology paths.

## Scope

- `app/assets/tailwind/layered/ui/styles.css`
- `app/views/layouts/layered_ui/*.erb`
- `app/views/layered_ui/shared/*.erb`
- `app/views/layered/ui/managed_resource/*.erb`
- `app/views/devise/**/*.erb`
- `app/javascript/layered_ui/controllers/l_ui/*.js`
- `app/javascript/layered_ui/utilities/*.js`
- `app/helpers/layered/ui/*.rb`
- Representative dummy app pages in `test/dummy/app/views/pages`

Out of scope: host application templates, host-supplied token overrides, third-party SVG internals, and browser or screen-reader runtime verification. This is a static audit of the current repository state.

## Method

- Static review of ERB templates, helpers, Stimulus controllers, and Tailwind source.
- WCAG 2.2 AA mapping for component semantics, focus order, keyboard operation, target size, labels, errors, contrast tokens, motion preferences, and status messages.
- Regression check against the prior audit advisories for heading levels, error boundary contrast, markdown table display, and panel resize ARIA.
- Spot review of dummy app examples where component conformance depends on consumer markup, especially tabs, modals, tables, and forms.

## Grading

Overall grade: **A (97/100)**

Conformance status within assessed scope:

- **WCAG 2.2 AA: substantially conformant**
- No material AA failures found in the engine surface.
- One advisory remains around programmatic association of Devise password hints.

The grade reflects strong core accessibility coverage, with a small reduction for the remaining advisory and for the limits of a static audit.

## Conformance summary

Passing surfaces:

- Document structure: `<html lang="<%= I18n.locale %>">`, skip link to `#main-content`, focusable `<main tabindex="-1">`, banner/header, named header navigation, named main navigation, and named side panel.
- Navigation drawer: toggle exposes `aria-expanded` and `aria-controls`; controller stores and restores focus, applies `inert` / `aria-hidden` while closed, applies background `inert` while open, supports Escape, and announces open/close state through the shared live region.
- Panel: offscreen panel starts with `aria-hidden="true"` and `inert`; open/close state is mirrored by the controller; Escape and Ctrl/Cmd+i are supported; focus moves to the close control on open and returns on close.
- Panel resize: resize handle uses `role="separator"`, `aria-orientation="vertical"`, `aria-valuemin`, `aria-valuenow`, `aria-valuemax`, `aria-valuetext`, keyboard Arrow/Home/End support, and mouse drag support.
- Dragging movements: floating panel button drag is supplemented by Ctrl/Cmd+Alt+1..4 corner shortcuts, satisfying WCAG 2.2 SC 2.5.7 within the assessed implementation.
- Modals: dummy examples use native `<dialog>`, `aria-labelledby`, labelled close buttons, backdrop click close, platform Escape handling, focus restoration, and scroll locking.
- Tabs: dummy reference follows the WAI-ARIA tabs pattern with `role="tablist"`, `role="tab"`, `role="tabpanel"`, roving `tabindex`, `aria-selected`, `aria-controls`, `aria-labelledby`, Arrow/Home/End keyboard support, and live-region announcements.
- Forms: labels are explicit, required indicators include an `sr-only` companion, managed-resource hints and field errors are wired through `aria-describedby`, field errors only use `role="alert"` when populated, and form summaries use `role="alert"`.
- Devise authentication: inputs use password-manager-friendly `autocomplete` values (`email`, `current-password`, `new-password`, `name`), avoiding cognitive-function authentication barriers under SC 3.3.8.
- Tables: `l_ui_table` emits `<caption>` when supplied, column headers use `scope="col"`, the primary cell uses `scope="row"`, sortable headers expose `aria-sort`, and visual sort glyphs are paired with screen-reader-only text.
- Contrast and tokens: default foreground, muted foreground, primary button text, control boundaries, danger borders, focus rings, and status notice token pairs are designed to meet AA contrast expectations in both light and dark modes.
- Focus visibility: reusable `focus-ring` is applied across links, buttons, tabs, inputs, panel handles, pagination, and table actions.
- Motion: global `prefers-reduced-motion: reduce` neutralises animations and transitions, with an explicit stream animation override.
- Target size: core controls are at least 44px tall where practical; smaller variants still clear the WCAG 2.2 AA 24px target minimum.

## Fixed since the prior audit

- Form error summaries now use `<h2>` rather than skipping from the page `<h1>` to `<h3>`.
- Devise assistance links now use `<h2>`, resolving the previous heading hierarchy advisory.
- Error fields now use `border-danger` rather than the lighter `error-bg` token for the 2px error boundary.
- Markdown tables keep table display semantics; horizontal overflow is applied to `.l-ui-markdown:has(table)` instead of changing the table itself to `display: block`.
- Panel resize markup now includes static `aria-valuemax` and `aria-valuetext`, so the control is better described before Stimulus hydration.

## Findings

### Advisory 1 - Devise password hints are visible but not programmatically associated

Locations:

- `app/views/devise/registrations/new.html.erb:24` and `app/views/devise/registrations/new.html.erb:27`
- `app/views/devise/registrations/new.html.erb:35` and `app/views/devise/registrations/new.html.erb:38`
- `app/views/devise/passwords/edit.html.erb:11` and `app/views/devise/passwords/edit.html.erb:14`
- `app/views/devise/passwords/edit.html.erb:22` and `app/views/devise/passwords/edit.html.erb:25`

The password minimum and confirmation instructions are rendered as visible `.l-ui-form__hint` elements, but the password inputs' `aria-describedby` values only reference the error containers. Managed-resource fields already do this better by composing hint and error IDs in `_field_input.html.erb`.

WCAG mapping: SC 3.3.2 Labels or Instructions and SC 1.3.1 Info and Relationships.

Severity: **Advisory**. The instructions are present in DOM order and visible next to the controls, so this is not scored as an AA failure. Programmatic association would improve screen-reader focus announcements and align Devise forms with the managed-resource helper.

Recommended remediation:

- Give each Devise hint a stable ID, for example `user_password_hint`.
- Include that ID before the error ID in `aria-describedby`, for example `aria-describedby: "#{resource_name}_password_hint #{resource_name}_password_error"`.
- Apply the same pattern to password confirmation hints.

## Accepted items

- Floating panel button remains outside the normal tab order with `tabindex="-1"`. This is accepted because the panel is operable by Ctrl/Cmd+i, and positioning has keyboard equivalents through Ctrl/Cmd+Alt+1..4. The trade-off should stay documented because discoverability depends on shortcut documentation.
- Generic Devise submit labels use `Continue`. This is acceptable in context because the surrounding page heading names the task.
- Flash messages use `role="alert"` for notice, alert, and error. This is acceptable for page-load and Turbo-injected status feedback, but avoid adding duplicate live announcements for the same message.
- Pagy output is accepted through the existing `pagy.series_nav` helper path. Re-check if the Pagy markup or local Pagy templates are customised.

## WCAG 2.2 AA criterion map

| SC | Title | Status | Evidence |
|----|-------|--------|----------|
| 1.1.1 | Non-text Content | Pass | Decorative icons use empty alt text and/or `aria-hidden`; icon-only controls have accessible names. |
| 1.3.1 | Info and Relationships | Pass with advisory | Landmarks, lists, tables, tabs, dialogs, and controls expose relationships; Devise hints should be associated with fields. |
| 1.3.2 | Meaningful Sequence | Pass | DOM order is logical; offscreen overlays are controlled through explicit triggers and focus management. |
| 1.4.1 | Use of Colour | Pass | Error, active, and sort states pair colour with text, ARIA, or structural cues. |
| 1.4.3 | Contrast (Minimum) | Pass | Token pairs reviewed for light and dark foreground/background text contrast. |
| 1.4.4 | Resize Text | Pass | Components use scalable text and responsive layout primitives. |
| 1.4.10 | Reflow | Pass | Navigation collapses, panel overlays, tables scroll horizontally where needed. |
| 1.4.11 | Non-text Contrast | Pass | Control borders use `--border-control`; error boundaries use `--danger`; focus rings use high-contrast `--ring`. |
| 1.4.12 | Text Spacing | Pass | No blocking text-spacing rules found. |
| 1.4.13 | Content on Hover or Focus | Pass | No hover-only persistent content patterns found. |
| 2.1.1 | Keyboard | Pass | Links, buttons, forms, tabs, navigation, panel, modal, resize, and drag alternatives are keyboard-operable. |
| 2.1.2 | No Keyboard Trap | Pass | Dialog is native; overlays provide Escape handling and focus restoration. |
| 2.1.4 | Character Key Shortcuts | Pass | Keyboard shortcuts require modifiers. |
| 2.4.1 | Bypass Blocks | Pass | Skip link targets focusable main content. |
| 2.4.2 | Page Titled | Pass with host dependency | Engine renders `<title>` when `@page_title` is present. Host apps must provide page titles. |
| 2.4.3 | Focus Order | Pass | Focus order and restoration are coherent for overlays and controls. |
| 2.4.4 | Link Purpose (In Context) | Pass | Navigation, breadcrumbs, Devise links, and docs links are understandable in context. |
| 2.4.5 | Multiple Ways | N/A | Site-level navigation strategy is outside the engine scope. |
| 2.4.6 | Headings and Labels | Pass | Heading hierarchy advisories from the prior audit are resolved; labels are descriptive. |
| 2.4.7 | Focus Visible | Pass | Shared focus ring is applied consistently. |
| 2.4.11 | Focus Not Obscured (Minimum) | Pass | Fixed header is accounted for; overlays manage focus within visible surfaces. |
| 2.5.1 | Pointer Gestures | Pass | No multipoint or path-only gestures required. |
| 2.5.2 | Pointer Cancellation | Pass | Native controls activate on release; drag operations can be abandoned without triggering click through the suppression guard. |
| 2.5.3 | Label in Name | Pass | Visible labels match accessible names for labelled controls; icon-only labels are descriptive. |
| 2.5.4 | Motion Actuation | N/A | No motion-actuated controls found. |
| 2.5.7 | Dragging Movements | Pass | Resize and floating panel drag have keyboard alternatives. |
| 2.5.8 | Target Size (Minimum) | Pass | Interactive targets clear the 24px minimum; most use 44px sizing. |
| 3.1.1 | Language of Page | Pass | Layout sets `<html lang>` from `I18n.locale`. |
| 3.2.1 | On Focus | Pass | No focus-triggered context changes found. |
| 3.2.2 | On Input | Pass | No automatic context changes on field input found. |
| 3.2.6 | Consistent Help | Pass | Devise help links are consistently grouped. |
| 3.3.1 | Error Identification | Pass | Field errors and summaries are rendered as text and announced when present. |
| 3.3.2 | Labels or Instructions | Pass with advisory | Labels are present; Devise password hints should be linked through `aria-describedby`. |
| 3.3.3 | Error Suggestion | Pass | Devise and managed-resource error messages surface model validation messages. |
| 3.3.4 | Error Prevention (Legal, Financial, Data) | N/A | No covered transaction flows in engine scope. |
| 3.3.7 | Redundant Entry | Pass | Authentication forms preserve available values where Devise provides them. |
| 3.3.8 | Accessible Authentication (Minimum) | Pass | Autocomplete support preserves password-manager flows; no cognitive tests. |
| 4.1.2 | Name, Role, Value | Pass | ARIA state updates are implemented for toggles, tabs, sort headers, navigation, panel, and resize controls. |
| 4.1.3 | Status Messages | Pass | Shared live region and alert containers expose state and error updates without moving focus. |

## Residual risk summary

- **Host token overrides**: custom accent, foreground, status, or border tokens can break contrast even when defaults pass. Review token changes before release.
- **Consumer-authored component markup**: tabs and modals are accessible in the dummy examples, but consumers can omit required roles or relationships if copying only CSS classes.
- **Shortcut discoverability**: the floating panel remains keyboard-operable, but because the launcher is not tabbable, documentation must continue to mention Ctrl/Cmd+i.
- **Third-party helper output**: Pagy and Ransack helper output should be rechecked if local templates or versions are changed.
- **Static audit limits**: this pass did not run axe, Playwright, Lighthouse, or screen-reader smoke tests.

## Maintenance recommendations

1. Link Devise password hints to their inputs with stable IDs and `aria-describedby`.
2. Add a small helper for Devise hint/error ID composition so auth forms match managed-resource form behaviour.
3. Add a lightweight accessibility regression task that checks headings, form hint associations, table captions/scopes, and required ARIA attributes in generated dummy pages.
4. Add token contrast checks for default and documented override palettes, especially foreground, muted foreground, border-control, danger, success, warning, and error pairs.
5. Keep the dummy app examples as canonical reference markup whenever adding or changing component classes.
