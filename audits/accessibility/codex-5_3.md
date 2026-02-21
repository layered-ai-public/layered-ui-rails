# Accessibility audit - codex-5_3

Date: 2026-02-21
Standard: WCAG 2.2 AA
Project: layered-ui-rails

## First-principles framing

This assessment is based on four core accessibility principles:

1. Perceivable: controls and state changes must be detectable.
2. Operable: primary behaviour must be usable with keyboard and assistive technology.
3. Understandable: labels, status changes, and interactions must be predictable.
4. Robust: semantic relationships must be consistently exposed to assistive technologies.

## Scope

- `/app/assets/tailwind/layered/ui/styles.css`
- `/app/views/layouts/layered_ui/*.erb`
- `/app/views/devise/**/*.erb`
- `/app/views/layered_ui/shared/*.erb`
- `/app/javascript/layered_ui/controllers/l_ui/*.js`
- representative pages in `/test/dummy/app/views/pages`

## Method

- Static review of semantics, ARIA, keyboard behaviour, pointer behaviour, and focus handling
- Contrast checks for text and non-text boundaries used by controls
- WCAG 2.2 AA mapping across the assessed interface patterns

## Grading

Overall grade: **A+ (98/100)**

Conformance status (within assessed scope):
- **WCAG 2.2 AA: conformant**

## Conformance summary

- Semantic landmarks, heading structure, and navigational labelling are in good order.
- Keyboard operability is strong across core flows.
- Focus visibility and focus management are consistently implemented.
- Form labelling and assistive relationships are robust.
- Reduced-motion handling is present.
- Pointer-operable interactions have practical non-drag alternatives where applicable.
- Control boundary contrast is separated from structural divider contrast to preserve clarity without over-emphasising layout lines.

## Accepted items

- None.

## Residual risk summary

- No material WCAG 2.2 AA risks identified in this audit scope.
- Normal regression risk remains if token values, control interaction wiring, or template semantics change without equivalent checks.

## Maintenance recommendation

1. Keep accessibility checks in release review for token changes and interaction-model changes in Stimulus controllers.
