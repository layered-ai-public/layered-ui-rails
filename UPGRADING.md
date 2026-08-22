# Upgrading

## 0.24.0

### Logout has moved into the sidebar account menu

The signed-in user's name and email in the sidebar are now a menu button. Logout lives inside that menu alongside Settings, so the standalone `l-ui-button--outline-danger` logout button is gone. Nothing to do unless you targeted that button in your own CSS or in a system test - look inside `l-ui-navigation__user-popover` instead.

### Permit `name` for account updates

If your user model has a `name` attribute and you want the new Settings screen to save it, permit it for `:account_update` as well as `:sign_up`:

```ruby
def configure_permitted_parameters
  devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
  devise_parameter_sanitizer.permit(:account_update, keys: [:name])
end
```

### Views generated into your application now win over the engine's

Application views resolve before engine views again, which is what lets you eject any engine view by copying it to the matching path. If you previously ran `bin/rails generate devise:views` and were still seeing the engine's styled views, your generated copies now take over - Devise generates *every* view, so delete the ones you did not mean to change and keep only the individual views you are customising.

## 0.19.0

### Headings no longer carry a divider by default

Headings (`h1`-`h4`) now set type scale and weight only. Previously `h2` rendered a bottom border (`border-b`); that divider is now opt-in via the new `l-ui-heading--section` modifier, so a heading level can be chosen for document structure alone (e.g. an `h2` inside a panel header or hero) without an unwanted rule.

To keep the previous look, add `l-ui-heading--section` to any heading that should show a section divider:

```html
<!-- Before: bare h2 drew a divider -->
<h2>Section title</h2>

<!-- After: opt in to the divider -->
<h2 class="l-ui-heading--section">Section title</h2>
```

### Regenerating the overrides file (optional)

0.19.0 adds commented-out `--l-ui-hero-image` and decorative tint (`--l-ui-tint-*`) token blocks to the overrides scaffold. The defaults ship in the engine, so existing apps need no change. If you want the new commented examples in your own `layered_ui_overrides.css`, regenerate it with the new `--force` flag (this overwrites the file, so copy any customisations out first):

```sh
bin/rails generate layered:ui:create_overrides --force
```

## 0.18.0

### Renamed classes

| Old class                       | New class            | Notes                                                                       |
| ------------------------------- | -------------------- | --------------------------------------------------------------------------- |
| `l-ui-page__width-constrained`  | `l-ui-page__narrow`  | A narrow ~384px column for any compact, centred content, not a page container. |

Search-and-replace `l-ui-page__width-constrained` with `l-ui-page__narrow` in your views.

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
| `l-ui-page--with-navigation`           | `l-ui-page l-ui-page--with-navigation`                        |

### Renamed classes

A few classes that read as modifiers were not deltas of their named base; they have been renamed to reflect their actual role:

| Old class                          | New class                          | Notes                                                                  |
| ---------------------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| `l-ui-page--vertically-centered`   | `l-ui-page__vertically-centered`   | Used as a child of `l-ui-page` (the layout already provides the page). |
| `l-ui-page--width-constrained`     | `l-ui-page__width-constrained`     | Same - it's an inner wrapper, not a page modifier.                     |
| `l-ui-label--checkbox`             | `l-ui-checkbox-container__label`   | Belongs to `l-ui-checkbox-container`, not the standalone `l-ui-label`. |
| `l-ui-stream-fade-word`            | `l-ui-stream-fade__word`           | A child of `l-ui-stream-fade`, written BEM-correct as an element.      |
| `l-ui-select-wrapper`              | `l-ui-select-container`            | Renamed for consistency with other `*-container` wrapper classes.      |
| `l-ui-button--panel-close`         | `l-ui-panel__close-button`         | Panel-specific positioning belongs to the panel block, not the button. |

### Table action element

`l-ui-table__action` is now a real element and is required on every action link/button inside an `l-ui-table__cell--action`. The previous descendant selector that styled bare `<a>`/`<button>` has been removed, so unmarked elements will render unstyled. Combine with `--danger` for destructive actions:

```html
<td class="l-ui-table__cell l-ui-table__cell--action">
  <a class="l-ui-table__action" href="/edit">Edit</a>
  <button class="l-ui-table__action l-ui-table__action--danger">Delete</button>
</td>
```

### Checkbox input class

`l-ui-checkbox` is now a real class. Previously, checkbox inputs inside `.l-ui-checkbox-container` were styled by a descendant selector; that selector has been replaced with an explicit class so the input has a documented hook. Add `l-ui-checkbox` to bare `<input type="checkbox">` elements (or pass `class: "l-ui-checkbox"` to `f.check_box`):

```html
<div class="l-ui-checkbox-container">
  <input class="l-ui-checkbox" type="checkbox" id="opt" value="1">
  <label class="l-ui-checkbox-container__label" for="opt">Option</label>
</div>
```

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

`l-ui-page--with-navigation` no longer re-applies `l-ui-page`. The engine layout already pairs the two classes (`class="l-ui-page l-ui-page--with-navigation"`), so most apps need no change; only standalone usages need the base class added.

If you call `l_ui_table` (or `l_ui_sort_link` indirectly), the helper handles its own classes - no changes needed in your view.

### Quick grep to find offenders in a host app

```bash
grep -rEn 'class[:=][^>]*l-ui-(button|surface|tabs__tab|navigation__item|table__cell|table__header-cell|page|form__group|message)--[a-z-]+' \
  app/ --include='*.erb' --include='*.html' --include='*.rb' \
  | grep -vE 'l-ui-(button|surface|tabs__tab|navigation__item|table__cell|table__header-cell|page|form__group|message)\b[^"'\'']*l-ui-\1--'
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
