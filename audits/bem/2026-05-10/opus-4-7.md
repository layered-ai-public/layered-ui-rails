# BEM audit - opus-4-7

Date: 2026-05-10
Standard: Strict BEM (block / `__element` / `--modifier`)
Project: layered-ui-rails
Auditor: Claude Opus 4.7 (1M)

## Framing

The project's strict-BEM rule (set in 0.13.x for `l-ui-badge` and extended in
0.14.0): a block class carries the shared styles; an element appends `__name`;
a modifier appends `--name` and contributes *only* the delta from its base.
Markup must always include the block (and any element) class alongside its
modifier - modifiers are not standalone.

This audit checks the entire engine CSS and ERB surface against that rule and
flags secondary BEM hygiene issues (state classes outside the namespace,
orphan elements, multi-word "blocks" that read as elements).

## Scope

- `app/assets/tailwind/layered/ui/styles.css` (sole stylesheet)
- `app/views/layouts/layered_ui/*.erb`
- `app/helpers/layered/ui/*.rb`
- `test/dummy/app/views/pages/*.erb` (markup conformance)

Out of scope: host-app templates, Rails-emitted classes
(`field_with_errors`), Pagy-emitted classes (`.pagy.series-nav`), the `.dark`
theme root (intentional cascade hook).

## Method

- Read the stylesheet end-to-end. For every `--modifier`, compare its rule body
  against the base block/element to confirm it contains *only* a delta.
- Grep ERB and helpers for every modifier class to confirm it is paired with
  its base in markup.
- Catalogue any class that is not `l-ui-{block}[__element][--modifier]`,
  including state classes, orphan modifiers, and compound-word blocks.
- Cross-reference findings against `UPGRADING.md` 0.14.0 to confirm the
  documented migration matches the code.

## Summary

| Severity      | Count | Note                                                      |
| ------------- | ----- | --------------------------------------------------------- |
| Strict-BEM    | 0     | All modifier-vs-base offenders fixed in 0.14.0            |
| State classes | 4     | `.open`, `.hidden` used outside the `l-ui-` namespace     |
| Orphan        | 2     | Modifier or element references with no defined parent     |
| Naming        | 2     | Multi-word "block" reads as element; one cross-block mod  |
| Advisory      | 2     | Markdown content selectors, container-vs-element pattern  |

No regressions from the 0.14.0 sweep. The remaining items are smaller
hygiene calls that can be tackled independently.

## 1. Strict modifier compliance - clean

After 0.14.0, every `--modifier` in `styles.css` is a pure delta:

- `l-ui-badge--{rounded,default,success,warning,danger}` (0.13.x)
- `l-ui-button--{full,primary,outline,danger,outline-danger,small,icon,navigation-toggle,panel-close}` (0.14.0)
- `l-ui-surface--{highlighted,collapsible,collapsible-highlighted,sm}` (0.14.0)
- `l-ui-tabs__tab--active` (0.14.0)
- `l-ui-navigation__item--active`, `l-ui-navigation__section--{separated,has-heading}` (0.14.0)
- `l-ui-table__cell--{primary,action}`, `l-ui-table__header-cell--{action,sortable}` (0.14.0)
- `l-ui-page--{vertically-centered,width-constrained}`; `--with-navigation` rule removed (0.14.0)
- `l-ui-icon--{xs,sm,md,lg,xl}`, `l-ui-header__icon--{light,dark}`,
  `l-ui-header__logo--{light,dark}`, `l-ui-theme-toggle__icon--{light,dark}`,
  `l-ui-panel__icon--{light,dark}`, `l-ui-panel__button--{dragging,snapping}`,
  `l-ui-notice--{success,warning,error}`,
  `l-ui-pagination__item--{active,disabled}`, `l-ui-message--sent`,
  `l-ui-form__group--large-gap`, `l-ui-label--checkbox`,
  `l-ui-body--{always-show-navigation,hide-header}` - all clean.

Helpers (`table_helper.rb`, `ransack_helper.rb`, `navigation_helper.rb`)
emit the base class alongside every modifier; verified by grep.

No outstanding offenders in this category.

## 2. State classes outside the BEM namespace - high

Four selectors use unprefixed, generic state classes. These collide with any
host-app or third-party class of the same name and are the most visible
deviation from BEM.

| File:line                  | Selector                              | Suggested form                              |
| -------------------------- | ------------------------------------- | ------------------------------------------- |
| `styles.css:610`           | `.l-ui-navigation-container.open`     | `.l-ui-navigation-container--open`          |
| `styles.css:625`           | `.l-ui-backdrop.open`                 | `.l-ui-backdrop--open`                      |
| `styles.css:1503`          | `.l-ui-panel-container.open`          | `.l-ui-panel-container--open`               |
| `styles.css:1466`          | `.l-ui-panel__button.hidden`          | `.l-ui-panel__button--hidden`               |

Impact: today, any host-app rule on `.open` or `.hidden` cascades into engine
overlays. The `.hidden` case is particularly fragile: Tailwind ships a
`.hidden { display: none }` utility, and the current rule depends on the
engine selector (`.l-ui-panel__button.hidden`) winning by specificity.

These are toggled by Stimulus controllers
(`l_ui/navigation_controller.js`, `l_ui/panel_controller.js`,
`l_ui/modal_controller.js`); migrating requires updating the controllers to
toggle `--open`/`--hidden` modifier classes in lockstep with the CSS rename.

Recommendation: rename in one PR (CSS + Stimulus); document under the next
release in `UPGRADING.md` since host apps that observe these classes via
custom JS or CSS would break.

## 3. Orphan element / modifier references - medium

**`l-ui-table__action--danger`** (`styles.css:1321`). The selector is nested
inside `.l-ui-table__cell--action`, but no `.l-ui-table__action` element is
defined as a standalone class. A reader following the modifier name expects
a base element of the same name. Two clean options:

1. Promote it to a real element class - define `.l-ui-table__action` for the
   action wrappers and apply the `--danger` modifier to genuine destructive
   actions.
2. Rename to `.l-ui-table__cell-action--danger` (or scope it as a descendant
   selector under `.l-ui-table__cell--action` without the `__action` token).

Option 2 is the smaller change and reflects the existing usage (`<a>` /
`<button>` inside an action cell flagged as destructive).

**Headless `l-ui-tabs` block** (`styles.css:1216-1243`). `__list`, `__tab`,
`__panel` exist with no `.l-ui-tabs` parent block. By BEM convention the
elements imply a block; absence is harmless but inconsistent with every
other component (every other `__element` here has a sibling block).
Optional: declare an empty `.l-ui-tabs` for the implicit wrapper, or leave
documented as "no wrapper class required" and keep the elements headless.

## 4. Naming inconsistencies - medium

**`l-ui-stream-fade-word`** (`styles.css:1800`). This is functionally a
sub-element of `l-ui-stream-fade` but is written as a separate hyphenated
block. Strict BEM form: `l-ui-stream-fade__word`. The two rules are
structurally a parent/child pair (the `-word` rule re-declares the same
animation as the parent and adds per-word delay), so the element model fits.

**`l-ui-button--panel-close`** (`styles.css:1576`). A button modifier whose
purpose is panel-specific positioning (`-mr-4`). It couples the button block
to the panel context. Two cleaner options:

1. Move to a panel element: `.l-ui-panel__close-button` (style as `.l-ui-button
   .l-ui-button--icon` plus the panel offset). Markup becomes
   `class="l-ui-button l-ui-button--icon l-ui-panel__close-button"`.
2. Generalise the modifier (`--flush-right` or similar) so it does not name
   another block.

Low priority - the current form is consistent with how 0.14.0 shipped, and
the name at least signals the coupling. Worth revisiting if a second
panel-only button modifier appears.

## 5. Container-vs-element pattern - advisory

Six classes follow a `*-container` / `*-wrapper` convention rather than
the BEM `__container` element:

```
l-ui-header-container       wraps  l-ui-header
l-ui-navigation-container   wraps  l-ui-navigation
l-ui-panel-container        wraps  l-ui-panel
l-ui-table-container        wraps  l-ui-table
l-ui-pagy-container         wraps  pagy markup
l-ui-checkbox-container     wraps  a checkbox + label
l-ui-select-wrapper         wraps  l-ui-select
```

By strict BEM these would be `l-ui-header__container` etc. - the wrapper is
an element of the block it contains. Counter-argument: each container has
distinct, fixed-position responsibilities (overlay positioning, scroll
boundaries) and is often used independently of the inner block in tests and
docs; some BEM communities deliberately treat a positioning shell as its own
block.

Recommendation: leave as-is, but pick one suffix. `*-wrapper` only appears
once (`l-ui-select-wrapper`); rename to `l-ui-select-container` for
consistency, then document the `*-container` convention as deliberate in
`CSS.md`.

## 6. Markdown content selectors - advisory

`.l-ui-markdown` styles raw HTML elements (`p`, `h1`-`h6`, `ul`, `pre`,
`table`, etc.) by descendant selector rather than declaring elements
(`.l-ui-markdown__paragraph`, `.l-ui-markdown__heading`). This is
intentional - the block styles untrusted, server-rendered Markdown output
that cannot be class-decorated. No change recommended; flagged here only so
future contributors do not "fix" it into BEM form and break Markdown
rendering.

## Recommendations and priority

| Priority | Item                                              | Effort |
| -------- | ------------------------------------------------- | ------ |
| High     | Rename `.open` / `.hidden` to BEM modifiers       | M      |
| Medium   | Resolve `l-ui-table__action--danger` orphan       | S      |
| Medium   | Rename `l-ui-stream-fade-word` to `__word`        | S      |
| Low      | Decide on `l-ui-tabs` block presence              | XS     |
| Low      | Unify `*-wrapper` to `*-container`                | XS     |
| Low      | Reconsider `l-ui-button--panel-close` coupling    | S      |

The high-priority change (state classes) is the only finding with a real
risk surface (host-app or Tailwind utility collision). Everything else is
hygiene and can be batched into a 0.15.0 cleanup release with a short
`UPGRADING.md` note for the renames that touch host markup.

## Verification

- `bundle exec rake test`: 173 runs, 553 assertions, 0 failures (post-0.14.0).
- `grep -rEn 'class[:=][^>]*l-ui-[a-z-]+--[a-z-]+' app/ test/dummy/app/`
  filtered through the offender pattern returns no results.
- Manual inspection of every `--modifier` rule in `styles.css` against its
  base confirms each is a pure delta.
