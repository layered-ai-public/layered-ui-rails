# Upgrading

## 0.14.0 - Strict BEM across all components

This release tightens BEM project-wide: every component modifier is now a true modifier and no longer carries its base styles. Update host app markup so the base class is always present alongside the modifier.

### Search-and-replace in your views/helpers

Wherever a modifier appears without its base, prepend the base class:

| Modifier (used alone)                  | Replace with                                                  |
| -------------------------------------- | ------------------------------------------------------------- |
| `l-ui-button--primary`                 | `l-ui-button l-ui-button--primary`                            |
| `l-ui-button--outline`                 | `l-ui-button l-ui-button--outline`                            |
| `l-ui-button--danger`                  | `l-ui-button l-ui-button--danger`                             |
| `l-ui-button--outline-danger`          | `l-ui-button l-ui-button--outline-danger`                     |
| `l-ui-button--small` (with any colour) | `l-ui-button l-ui-button--<colour> l-ui-button--small`        |
| `l-ui-button--full` (with any colour)  | `l-ui-button l-ui-button--<colour> l-ui-button--full`         |
| `l-ui-button--icon`                    | `l-ui-button l-ui-button--icon`                               |
| `l-ui-button--navigation-toggle`       | `l-ui-button l-ui-button--navigation-toggle`                  |
| `l-ui-button--panel-close`             | `l-ui-button l-ui-button--icon l-ui-button--panel-close`      |
| `l-ui-surface--highlighted`            | `l-ui-surface l-ui-surface--highlighted`                      |
| `l-ui-surface--collapsible`            | `l-ui-surface l-ui-surface--collapsible`                      |
| `l-ui-surface--collapsible-highlighted`| `l-ui-surface l-ui-surface--collapsible-highlighted`          |
| `l-ui-tabs__tab--active`               | `l-ui-tabs__tab l-ui-tabs__tab--active`                       |
| `l-ui-navigation__item--active`        | `l-ui-navigation__item l-ui-navigation__item--active`         |
| `l-ui-table__cell--primary`            | `l-ui-table__cell l-ui-table__cell--primary`                  |
| `l-ui-table__cell--action`             | `l-ui-table__cell l-ui-table__cell--action`                   |
| `l-ui-table__header-cell--action`      | `l-ui-table__header-cell l-ui-table__header-cell--action`     |
| `l-ui-form__group--large-gap`          | `l-ui-form__group l-ui-form__group--large-gap`                |
| `l-ui-message--sent`                   | `l-ui-message l-ui-message--sent`                             |

### Renamed classes

A few classes that read as modifiers were not deltas of their named base; they have been renamed to reflect their actual role:

| Old class                          | New class                          | Notes                                                                  |
| ---------------------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| `l-ui-page--vertically-centered`   | `l-ui-page__vertically-centered`   | Used as a child of `l-ui-page` (the layout already provides the page). |
| `l-ui-page--width-constrained`     | `l-ui-page__width-constrained`     | Same - it's an inner wrapper, not a page modifier.                     |
| `l-ui-label--checkbox`             | `l-ui-checkbox-container__label`   | Belongs to `l-ui-checkbox-container`, not the standalone `l-ui-label`. |
| `l-ui-stream-fade-word`            | `l-ui-stream-fade__word`           | A child of `l-ui-stream-fade`, written BEM-correct as an element.      |
| `l-ui-select-wrapper`              | `l-ui-select-container`            | Renamed for consistency with other `*-container` wrapper classes.      |

### Table action element

`l-ui-table__action` is now a real element. Apply it explicitly to action links/buttons inside an `l-ui-table__cell--action`, and combine with `--danger` for destructive actions:

```html
<td class="l-ui-table__cell l-ui-table__cell--action">
  <a class="l-ui-table__action" href="/edit">Edit</a>
  <button class="l-ui-table__action l-ui-table__action--danger">Delete</button>
</td>
```

The descendant selector that styled bare `<a>`/`<button>` elements inside `l-ui-table__cell--action` is retained for backwards compatibility, but new markup should use the explicit class so `--danger` has a real base.

### Tabs wrapper class

`l-ui-tabs` is now a defined block. Add it to the tabs container so the BEM children (`__list`, `__tab`, `__panel`) have a parent block:

```html
<div class="l-ui-tabs" data-controller="l-ui--tabs">
  <div class="l-ui-tabs__list" role="tablist">...</div>
</div>
```

### State classes pulled into the namespace

Runtime state classes that were toggled as unprefixed `.open` / `.hidden` are now BEM modifiers, so they no longer collide with host-app or Tailwind utility classes of the same name. Stimulus controllers in the engine have been updated; only host apps that observe these classes via custom JS or CSS need to update:

| Old selector                       | New selector                       |
| ---------------------------------- | ---------------------------------- |
| `.l-ui-navigation-container.open`  | `.l-ui-navigation-container--open` |
| `.l-ui-backdrop.open`              | `.l-ui-backdrop--open`             |
| `.l-ui-panel-container.open`       | `.l-ui-panel-container--open`      |
| `.l-ui-panel__button.hidden`       | `.l-ui-panel__button--hidden`      |

`l-ui-page--with-navigation` no longer re-applies `l-ui-page`; existing `class="l-ui-page l-ui-page--with-navigation"` markup is already correct and needs no change. If you used `l-ui-page--with-navigation` alone, add the `l-ui-page` base class.

If you call `l_ui_table` (or `l_ui_sort_link` indirectly), the helper handles its own classes - no changes needed in your view.

### Quick grep to find offenders in a host app

```bash
grep -rEn 'class[:=][^>]*l-ui-(button|surface|tabs__tab|navigation__item|table__cell|table__header-cell|page)--[a-z-]+' \
  app/ --include='*.erb' --include='*.html' --include='*.rb' \
  | grep -vE 'l-ui-(button|surface|tabs__tab|navigation__item|table__cell|table__header-cell|page)\b[^"'\'']*l-ui-\1--'
```

### Visual check after upgrading

If anything looks unstyled, you missed a base class:

- Buttons with only a colour or icon modifier will lose their padding, height, focus ring, and click affordance
- Surfaces will lose padding and rounding
- The active tab will lose its tab styling
- The active nav item will lose its layout
- Primary/action table cells will lose padding and typography
- Action header cells will lose padding and bold heading styles

### Why the change

Modifiers previously re-applied the base utility via `@apply`, so they worked standalone - that drifts from BEM and made the rule for "what's required" inconsistent across components. This release aligns every component with the badge fix from 0.13.x: one base class, modifiers add deltas only.
