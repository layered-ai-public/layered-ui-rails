# BEM audit - 2026-05-10

## Scope

Audited the current working tree for `l-ui` class naming and usage consistency across:

- `app/assets/tailwind/layered/ui/styles.css`
- engine views and helpers under `app/`
- Stimulus controllers under `app/javascript/layered_ui/`
- dummy app documentation views under `test/dummy/app/views/`
- `.claude/skills/layered-ui-rails/references/`
- `README.md`

Ignored generated logs. The worktree already had local modifications before this audit, so findings describe the current uncommitted state.

## Summary

The stylesheet defines 184 `l-ui` CSS classes. The component catalogue is broadly BEM-shaped and consistently uses the `l-ui-` namespace for public CSS. The main naming drift is concentrated in four areas:

- unprefixed runtime state classes (`open`, `hidden`)
- modifier classes used without their base block or element
- classes emitted by helpers or docs that have no matching stylesheet selector
- a few standalone utility-like classes whose BEM role is ambiguous

Recommended order: fix unprefixed state classes first, then normalise standalone modifiers, then resolve undefined classes and documentation drift.

## Findings

### P1 - Unprefixed runtime state classes break the namespace

`styles.css` uses global state classes on `l-ui` components:

- `app/assets/tailwind/layered/ui/styles.css:610` - `.l-ui-navigation-container.open`
- `app/assets/tailwind/layered/ui/styles.css:625` - `.l-ui-backdrop.open`
- `app/assets/tailwind/layered/ui/styles.css:1466` - `.l-ui-panel__button.hidden`
- `app/assets/tailwind/layered/ui/styles.css:1503` - `.l-ui-panel-container.open`

The corresponding JavaScript toggles those global classes:

- `app/javascript/layered_ui/controllers/l_ui/navigation_controller.js` toggles `open`
- `app/javascript/layered_ui/controllers/l_ui/panel_controller.js` toggles `open` and `hidden`

Why it matters: `open` and `hidden` are unscoped classes. They can collide with host app CSS, do not follow the repository's `l-ui-` namespace rule, and make state harder to audit.

Recommendation:

- `.l-ui-navigation-container.open` -> `.l-ui-navigation-container--open`
- `.l-ui-backdrop.open` -> `.l-ui-backdrop--open`
- `.l-ui-panel-container.open` -> `.l-ui-panel-container--open`
- `.l-ui-panel__button.hidden` -> `.l-ui-panel__button--hidden`

An alternative is to replace these with data-state selectors, for example `[data-l-ui-state="open"]`, but BEM modifiers are the cleaner fit for the current CSS.

### P1 - Several modifiers are used without their base class

These are BEM modifiers in name, but current markup uses them as standalone classes:

- `app/views/devise/*` uses `l-ui-page--vertically-centered` and `l-ui-page--width-constrained` without `l-ui-page`
- `app/views/devise/*` and dummy docs use `l-ui-form__group--large-gap` without `l-ui-form__group`
- `app/views/devise/sessions/new.html.erb`, `app/views/layered/ui/managed_resource/_field_input.html.erb`, and `test/dummy/app/views/pages/forms.html.erb` use `l-ui-label--checkbox` without `l-ui-label`
- `test/dummy/app/views/pages/conversations.html.erb` uses `l-ui-message--sent` without `l-ui-message`
- `.claude/skills/layered-ui-rails/references/CONTROLLERS.md:59` documents `l-ui-button--icon` without `l-ui-button`

Why it matters: a BEM modifier should modify a base block or element. Standalone modifiers obscure the component contract and make it easy for consumers to copy incomplete class combinations.

Recommendation:

- Use `l-ui-page l-ui-page--vertically-centered` and `l-ui-page l-ui-page--width-constrained`, or rename these to standalone block classes if they are intentionally layout primitives.
- Use `l-ui-form__group l-ui-form__group--large-gap`.
- Use `l-ui-label l-ui-label--checkbox`, unless checkbox labels are intentionally a separate block.
- Use `l-ui-message l-ui-message--sent`.
- Update docs examples to include `l-ui-button l-ui-button--icon`.

### P2 - Classes are emitted or documented without matching CSS selectors

The scan found current class usage that has no matching selector in `styles.css`:

- `l-ui-checkbox`
  - emitted at `app/views/layered/ui/managed_resource/_field_input.html.erb:34`
  - CSS currently styles `.l-ui-checkbox-container input[type="checkbox"]`, not `.l-ui-checkbox`
- `l-ui-navigation__section--collapsible`
  - emitted at `app/helpers/layered/ui/navigation_helper.rb:42`
  - documented at `.claude/skills/layered-ui-rails/references/CSS.md:218`
- `l-ui-table__header-cell--sortable`
  - emitted at `app/helpers/layered/ui/ransack_helper.rb:108`
  - used in `test/dummy/app/views/pages/tables.html.erb`
- `l-ui-text--subtle`
  - used at `test/dummy/app/views/posts/_title_cell.html.erb:2`
  - shown in `test/dummy/app/views/pages/tables_helper.html.erb:105`

Why it matters: undefined public-looking classes confuse host app consumers. They also make the dummy app documentation look authoritative for classes that do not exist in the engine stylesheet.

Recommendation:

- Either add the missing CSS selectors and document them, or remove/rename the unused classes.
- For `l-ui-checkbox`, prefer styling the actual class if it is public API: `.l-ui-checkbox`.
- For `l-ui-table__header-cell--sortable`, add a selector if sortable headers need a stable hook.
- For `l-ui-text--subtle`, either add a text utility or replace it with an existing documented class.

### P2 - `l-ui-table__action--danger` is an element modifier without an element base

`l-ui-table__action--danger` is styled in `styles.css:1304` and used in the tables documentation. There is no `l-ui-table__action` base selector, and usage does not include `l-ui-table__action`.

Why it matters: this reads as a modifier of `l-ui-table__action`, but the base element does not exist. It is currently a one-off descendant hook inside `l-ui-table__cell--action`.

Recommendation:

- Add and use `l-ui-table__action l-ui-table__action--danger`, or
- rename to a standalone block/modifier pair if table actions are meant to be generic, for example `l-ui-button l-ui-button--danger` where semantically appropriate.

### P3 - A few class names are BEM-valid but semantically ambiguous

These classes are syntactically acceptable as hyphenated blocks, but their role is less clear than the rest of the system:

- `l-ui-header-container`
- `l-ui-navigation-container`
- `l-ui-panel-container`
- `l-ui-table-container`
- `l-ui-pagy-container`
- `l-ui-checkbox-container`
- `l-ui-select-wrapper`
- `l-ui-search-inline`

Why it matters: they are not wrong, but the project mixes "container" and "wrapper" as block names beside clearer component blocks. That can make future additions inconsistent.

Recommendation: leave them in place unless doing a planned naming pass. For new classes, prefer clear component blocks or elements of an existing block.

## Non-issues

- Stimulus identifiers such as `l-ui--modal`, `l-ui--tabs`, and `data-l-ui--tabs-target` are not CSS BEM classes and should not be treated as stylesheet drift.
- `l-ui-live-region` is an id, not a CSS class.
- `data-l-ui-preserved` is a data attribute, not a CSS class.
- Layout modifiers such as `l-ui-body--always-show-navigation` are acceptable when paired with `l-ui-body`, as in the engine layout.

## Suggested migration checklist

1. Replace `.open` and `.hidden` state classes with namespaced BEM modifiers in CSS and JavaScript.
2. Update engine and dummy markup so modifier classes include their base class.
3. Decide whether each undefined class is public API. Add CSS and docs for public classes; remove private or accidental classes.
4. Update `.claude/skills/layered-ui-rails/references/CSS.md` and dummy documentation examples after each public naming change.
5. Run `bundle exec rake test`.

