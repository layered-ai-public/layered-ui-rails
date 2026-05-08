# BEM cleanup migration prompt

Paste the prompt below into Claude Code (or another agent) running inside your host app to migrate it after upgrading `layered-ui-rails` past 0.12.0.

The upgrade renamed CSS classes that were not following BEM properly (orphan modifiers, pseudo-namespaces like `utility-*` and `container-*`, a typo, and orphan elements). Multi-word BEM elements such as `.l-ui-navigation__section-heading` were **not** renamed — they are valid flat BEM.

---

## Prompt

> I have just upgraded `layered-ui-rails`. The gem renamed several CSS classes and now requires the BEM base block to be present alongside its modifier in a few cases. Please migrate this codebase to the new class names. Only edit application code (views, helpers, partials, components, JS, tests, stylesheet overrides). Do not touch the gem itself.
>
> **1. Apply these exact renames everywhere they appear (HTML class attributes, ERB/Slim/HAML templates, Ruby helpers, JS selectors, stylesheet overrides, tests, fixtures, and code samples in docs):**
>
> ```
> l-ui-utility--mt-0      → l-ui-mt-0
> l-ui-utility--mt-4      → l-ui-mt-4
> l-ui-utility--mt-8      → l-ui-mt-8
> l-ui-utility--mt-sm     → l-ui-mt-sm
> l-ui-utility--mt-md     → l-ui-mt-md
> l-ui-utility--mt-lg     → l-ui-mt-lg
> l-ui-utility--mt-xl     → l-ui-mt-xl
> l-ui-utility--mt-2xl    → l-ui-mt-2xl
> l-ui-utility--mb-0      → l-ui-mb-0
> l-ui-utility---mr-2     → l-ui--mr-2          # was a typo (triple dash); negative margin retained
>
> l-ui-container--header      → l-ui-header-container
> l-ui-container--navigation  → l-ui-navigation-container
> l-ui-container--panel       → l-ui-panel-container
> l-ui-container--checkbox    → l-ui-checkbox-container
> l-ui-container--table       → l-ui-table-container
> l-ui-container--pagy        → l-ui-pagy-container
> l-ui-container--grid        → l-ui-grid
> l-ui-container--spread      → l-ui-spread
>
> l-ui-radio__group           → l-ui-radio          # __item / __input / __label keep their names
> l-ui-search__inline         → l-ui-search-inline
> ```
>
> **2. Add the base block alongside these modifier classes wherever they appear in markup. Strict BEM now requires both classes:**
>
> ```
> l-ui-notice--success           → l-ui-notice l-ui-notice--success
> l-ui-notice--warning           → l-ui-notice l-ui-notice--warning
> l-ui-notice--error             → l-ui-notice l-ui-notice--error
>
> l-ui-icon--xs                  → l-ui-icon l-ui-icon--xs
> l-ui-icon--sm                  → l-ui-icon l-ui-icon--sm
> l-ui-icon--md                  → l-ui-icon l-ui-icon--md
> l-ui-icon--lg                  → l-ui-icon l-ui-icon--lg
> l-ui-icon--xl                  → l-ui-icon l-ui-icon--xl
>
> l-ui-backdrop--navigation      → l-ui-backdrop l-ui-backdrop--navigation
>
> l-ui-theme-toggle__icon--light → l-ui-theme-toggle__icon l-ui-theme-toggle__icon--light
> l-ui-theme-toggle__icon--dark  → l-ui-theme-toggle__icon l-ui-theme-toggle__icon--dark
> ```
>
> Do **not** prepend the base if it is already present (avoid creating `l-ui-icon l-ui-icon l-ui-icon--sm`).
>
> **3. Do not rename anything else.** In particular, leave these valid flat-BEM classes alone:
>
> - Multi-word elements: `.l-ui-navigation__section-heading`, `.l-ui-navigation__section-toggle`, `.l-ui-navigation__section-chevron`, `.l-ui-navigation__section-items`, `.l-ui-navigation__item-icon`, `.l-ui-navigation__item-icon-slot`, `.l-ui-navigation__item-label`, `.l-ui-navigation__user-name`, `.l-ui-navigation__user-email`, `.l-ui-navigation__user-name-and-email`, `.l-ui-panel__header-content`, `.l-ui-panel__header-buttons`, `.l-ui-panel__header-heading`, `.l-ui-panel__header-actions`, `.l-ui-panel__resize-handle`, `.l-ui-table__header-cell`, `.l-ui-table__sort-link`, `.l-ui-table__sort-indicator`, `.l-ui-form__field-error`, `.l-ui-form__errors-list`, `.l-ui-conversation__composer-input`, `.l-ui-stream-fade-word`, `.l-ui-scroll-to-bottom`, `.l-ui-typing-indicator__dot`, `.l-ui-select-wrapper`.
> - Multi-word block-level modifiers: `.l-ui-button--outline-danger`, `.l-ui-button--navigation-toggle`, `.l-ui-button--panel-close`, `.l-ui-page--with-navigation`, `.l-ui-surface--collapsible-highlighted`.
>
> **4. Verify when finished:**
>
> - `grep -RnE 'l-ui-utility|l-ui-container--|l-ui-radio__group|l-ui-search__inline'` returns nothing in app code.
> - `grep -RnE 'class="[^"]*l-ui-(notice|icon|backdrop|theme-toggle__icon)--'` returns no markup where the base class is missing alongside the modifier.
> - The test suite passes.
> - Boot the app and visually check any pages that render notices, icons, the navigation backdrop, the theme toggle, the side panel, tables, pagination, search forms, radio groups, and checkboxes.

---

## Notes for reviewers

- The renames affect **markup only**. The CSS rules in the engine were renamed in lockstep, so nothing in your host app's CSS overrides should be affected unless you were targeting one of the old class names directly.
- If you wrote custom CSS that targeted, say, `.l-ui-container--table` for a host-app override, update that selector to `.l-ui-table-container`.
- If you generated and customised a copy of the engine CSS via `bin/rails generate layered:ui:install`, regenerate it (or apply the rename map to your local copy) so it matches the new gem version.
