# Changelog

All notable changes to this project will be documented in this file. This project follows [Semantic Versioning](https://semver.org/).

## [0.11.0] - 2026-05-07

### Added

- `l-ui-stream-fade` animation classes for fading in streamed chat output token-by-token
- `:password` form field type support in `l_ui_form` for `password_field` inputs via `as: :password`

### Changed

- Form fields now have an explicit background colour

## [0.10.0] - 2026-05-03

### Added

- Nested navigation: `l_ui_navigation_section` helper for collapsible sidebar sections, backed by an `l-ui--navigation-section` Stimulus controller and `l-ui-navigation__section`/`__toggle`/`__items` styles
- Optional `icon:` / `icon_path:` / `icon_html:` arguments on `l_ui_navigation_item` and `l_ui_navigation_section` to render an icon alongside the label; ships with a default `icon_home.svg` as an example
- `row_id:` option on `l_ui_table` to set a stable DOM id on each row (useful for Turbo Stream targeting)

### Changed

- **Breaking:** Minimum Ruby version raised to 3.3.0 (Ruby 3.2 is EOL). CI matrix now tests against Ruby 3.3, 3.4, and 4.0

## [0.9.0] - 2026-04-26

### Added

- `l_ui_title_bar` helper for page title bars with optional actions
- `l-ui-hr` class for styled horizontal rules
- `color-scheme` CSS property set to match the active theme so native form controls (date pickers, scrollbars, etc.) render with matching light/dark styling

### Changed

- Navigation and panel controllers share an extracted `scroll_lock` utility module
- Checkbox and radio inputs use a pointer cursor
- Scroll-to-bottom button is centred and has a faint shadow
- Form submit label shortened from "Save changes" to "Save"

## [0.8.0] - 2026-04-24

### Changed

- **Breaking:** Theme tokens migrated from HSL channels (`220 80% 55%`) to full `oklch()` values for perceptually uniform mixing. `@theme` now references the vars directly instead of wrapping them in `hsl()`. Existing overrides files need to be updated: replace `hue sat% lightness%` with the equivalent `oklch(L C H)` value (or any valid CSS color - `#hex`, `rgb()`, and keywords all work now).
- `layered:ui:create_overrides` generator and token documentation (`SKILL.md`, `references/CSS.md`, `README.md`, dummy app colour/head pages) updated to reflect the new `oklch()` format.

## [0.7.0] - 2026-04-23

### Added

- `--button-primary-icon` Tier 2 token for filled icon buttons (e.g. `l-ui-panel__button`, `l-ui-scroll-to-bottom`). Defaults to `--button-primary-text`; override to recolor icons independently of button text.
- Inline SVG default for the panel toggle button icon - inherits `currentColor` so it picks up `--button-primary-icon`. Per-request `@l_ui_panel_icon_light_url` / `@l_ui_panel_icon_dark_url` still replace the default image, and each theme falls back to the inline SVG independently when its variable is unset.
- Documentation of the HSL-channel format for theme tokens (space-separated channels such as `220 80% 55%`) in `SKILL.md`, `references/CSS.md`, and the overrides generator, with a pointer to a hex/rgb converter.

### Changed

- `l-ui-scroll-to-bottom` now bakes the chevron-down icon into CSS via `mask-image` (with `-webkit-mask` prefixes and a URL-encoded SVG for Safari compatibility) and colours it with `--button-primary-icon`. Host markup is a plain empty `<button class="l-ui-scroll-to-bottom" aria-label="...">` - no inner `<svg>`/`<img>` required.

### Removed

- Static-file panel icon overrides (`panel_icon_light.svg`, `panel_icon_dark.svg` in `app/assets/images/layered_ui/`). Use `@l_ui_panel_icon_light_url` / `@l_ui_panel_icon_dark_url` instance variables to supply a custom image.

## [0.6.0] - 2026-04-19

### Added

- `rewriteLink` action on `l-ui--search-form` controller to preserve URL params in pagination links across Turbo Frames
- Paginated Ransack demo in the dummy app with scoped `page_key` params
- Thin scrollbars on all scrollable elements within `l-ui-body` (for Windows compatibility)
- `--button-primary-bg` and `--button-primary-text` tokens documented as independently overridable (e.g. pink accent with white button text in dark mode)

### Changed

- Renamed `PaginationHelper` to `PagyHelper` to match the underlying gem
- Renamed `--surface-active` to `--surface-highlighted` (and all related CSS classes: `l-ui-surface--active` to `l-ui-surface--highlighted`, `l-ui-surface--collapsible-active` to `l-ui-surface--collapsible-highlighted`)
- Scoped page params (e.g. `users_page`) are now reset when a Ransack search or sort submits, returning to page 1
- Floating icon buttons (`l-ui-panel__button`, `l-ui-scroll-to-bottom`) now use solid `bg-button-primary-bg` instead of semi-transparent with shadow
- Navigation backdrop uses blur-only effect instead of a color overlay
- Navigation secondary border changed from `border-surface` to `border-border`
- Dummy app uses default Devise routes instead of custom path names
- Agent skill section moved higher in README and dummy app home page
- Documentation clarifies that `content_for` blocks must appear above the layout render call
- Color token documentation reorganised into Tier 1 (accent) and Tier 2 (full palette)

### Removed

- `--backdrop` CSS custom property - backdrops now use blur-only styling

## [0.5.0] - 2026-04-19

### Added

- `l-ui-form__actions` CSS class for right-aligned form action buttons that stack full-width on mobile
- `l_ui_format_datetime` helper for consistent date/time formatting in table cells

### Changed

- Collapsible surface padding moved from container to summary/content elements for better open/closed spacing
- `.l-ui-surface__summary` now prevents text selection with `select-none`
- Markdown `pre` background changed from `bg-surface-active` to `bg-surface`
- `l-ui-button--danger` is now a standalone variant (no longer requires a base button class)
- `l_ui_table` now requires a `render:` proc on every column - the helper no longer auto-extracts values via `public_send`/hash access or auto-formats dates
- `l_ui_table` no longer renders with an implicit top margin - wrap in a utility class if spacing is needed
- `l_ui_form` submit button now uses `l-ui-form__actions` wrapper for right-aligned, mobile-responsive layout
- `l-ui-form` no longer renders with an implicit top margin - wrap in a utility class if spacing is needed
- Disabled button styling is now automatic via the `disabled` HTML attribute on any button variant - no extra class needed

### Removed

- `l-ui-button--disabled` modifier class - use the `disabled` HTML attribute instead

## [0.4.0] - 2026-04-14

### Added

- Agent skill for AI coding agents
- `layered:ui:install_agent_skill` generator for project-scoped skill install
- Global install script (`install-skill.sh`) for cross-project skill availability
- Breadcrumbs helper (`l_ui_breadcrumbs`, `l_ui_breadcrumb_item`) for hierarchical navigation
- Inline dark mode script in layout `<head>` to prevent white flash on page reload
- Breadcrumbs added to all dummy app documentation pages with "Home" as the new root item

### Changed

- Default page link underline uses `decoration-foreground-muted/60` for subtler appearance
- Table action buttons no longer have underlines; danger actions use `decoration-danger/60`

## [0.3.0] - 2026-04-11

### Added

- Optional Ransack search helper (`l_ui_search_form`) with styled search form wrapping Ransack's `search_form_for`
- Sort link helper (`l_ui_sort_link`) with styled header cells wrapping Ransack's `sort_link`
- Stimulus controller (`l-ui--search-form`) for clear button and Turbo Frame targeting
- Support for multiple independent Ransack collections on a single page using Turbo Frames and `search_key`
- Graceful degradation when Ransack is not installed (visible warning in development, silent fallback in production)
- Ransack integration documentation and search helper API reference pages in the dummy app

### Changed

- Updated gem description and summary to clarify that the engine is built on Tailwind CSS and integrates with Devise, Pagy, and Ransack

## [0.2.5] - 2026-04-09

### Changed

- Reduced form field text size from `text-base` (16px) to `text-sm` (14px) on desktop; remains 16px on mobile to prevent iOS auto-zoom
- Increased form hint text size from `text-xs` (12px) to `text-sm` (14px)

## [0.2.4] - 2026-04-06

### Added

- YouTube social icon SVG bundled in the gem

## [0.2.3] - 2026-04-06

### Added

- Social icon SVGs (globe, GitHub, X, LinkedIn, Discord, mail) bundled in the gem for reuse by host apps

### Fixed

- Pagy pagination links still showing underline despite previous fix - broadened page link exclusion to all `l-ui-` classes and added explicit `no-underline` to pagination items

## [0.2.2] - 2026-04-03

### Added

- Collapsible surface variants (`.l-ui-surface--collapsible`, `.l-ui-surface--collapsible-active`) using native `<details>`/`<summary>` for WCAG 2.2 AA accessible disclosure
- `.l-ui-surface--sm` compact surface variant with smaller padding and summary text
- `h4` base style (Manrope bold, `text-sm`)

### Changed

- Form inputs now use 16px (`text-base`) font size by default, preventing Safari auto-zoom on iOS without relying on a `!important` hack

### Fixed

- Pagination links no longer inherit underline from global page link styles
- CSS `@apply` ordering now follows the documented convention (layout, spacing, typography, colours, effects) in `code`, `tabs__tab`, and `l-ui-scroll-to-bottom`

## [0.2.1] - 2026-04-01

### Changed

- `tailwindcss-rails` promoted from development dependency to runtime dependency
- `layered:ui:create_overrides` generator Tier 3 section now includes commented examples for `.l-ui-header__logo` and `.l-ui-header__icon` size overrides
- Documentation for logo and icon styling overrides, pointing to `layered_ui_overrides.css`

## [0.2.0] - 2026-03-31

### Added

- `yield :l_ui_head` in the engine layout `<head>`, allowing host apps to inject content (e.g. dynamic theme token overrides) via `content_for`
- `yield :l_ui_logo_light`, `:l_ui_logo_dark` in the header, allowing host apps to inject custom logos via `content_for`
- `@l_ui_icon_light_url`, `@l_ui_icon_dark_url`, `@l_ui_apple_touch_icon_url`, `@l_ui_panel_icon_light_url`, `@l_ui_panel_icon_dark_url` instance variables for per-request icon overrides
- `pre.l-ui-surface` style for preformatted code blocks

### Changed

- Panel toggle icon override now uses `@l_ui_panel_icon_light_url` and `@l_ui_panel_icon_dark_url` instance variables, replacing `content_for :l_ui_panel_icon_light` and `:l_ui_panel_icon_dark`

### Removed

- `content_for :l_ui_panel_icon_light` and `content_for :l_ui_panel_icon_dark` - use `@l_ui_panel_icon_light_url` and `@l_ui_panel_icon_dark_url` instance variables instead

## [0.1.4] - 2026-03-25

### Added

- `yield :l_ui_body_class` in the engine layout body tag, allowing host apps to pass modifier classes via `content_for`
- `l-ui-body--always-show-navigation` modifier pins the navigation as a persistent sidebar on desktop (suitable for admin layouts)
- `l-ui-body--hide-header` modifier hides the header and collapses its reserved space
- Disabled state styles for all button variants

### Changed

- New default: Navigation is now off-canvas on all screen sizes, toggled via the header button - use `l-ui-body--always-show-navigation` to restore the pinned sidebar behaviour
- Renamed Stimulus controller from `l-ui--mobile-navigation` to `l-ui--navigation` as it now has utility on both desktop and mobile
- Renamed `l-ui-button--mobile-navigation` to `l-ui-button--navigation-toggle`

## [0.1.3] - 2026-03-14

### Added

- `l-ui-utility--mt-4` and `l-ui-utility--mt-8` margin-top utilities

### Changed

- Panel closes when navigating to a new page on mobile
- Panel button is now draggable on mobile
- Better Safari support for panel
- Cleaner link styles
- Updated message bubble avatar background
- Updated conversation rounding
- Removed top padding from panel conversations

### Fixed

- Panel scrolling on mobile no longer scrolls the page behind it
- Panel not working on devise based controllers
- Issue with conversation container height

## [0.1.2] - 2026-02-27

### Added

- Conversation component with markdown support, typing indicators, and token fade-in animation
- Scroll-to-bottom button in conversations
- Movable panel toggle button with drag-and-drop repositioning
- Link utility class
- Form field utility class

### Changed

- Improved message styles and spacing
- Better table header and secondary nav styling
- Improved WCAG 2.2 AA compliance across components
- Switch track unchecked state uses neutral colour instead of danger
- Extracted shared JavaScript into utility modules (announce, layout, storage)
- Extracted inline SVG icons (close, moon, sun, hamburger, chevron right) into engine assets
- Rebuilt CSS from engine source every 5 seconds in development

### Fixed

- Use `main_app` Devise routes in engine views
- Overflow on code blocks, surfaces, and markdown tables
- Margins on small screens when vertically centred
- Select element styling
- Tabs controller issue
- Odd scrolling behaviour

## [0.1.1] - 2026-02-17

### Added

- Accent color tokens (`--accent`, `--accent-foreground`) for easy brand color customisation - primary buttons, active tabs, and active navigation items all inherit from these two variables
- `layered:ui:create_overrides` generator creates a color overrides file that is preserved across upgrades
- Bundled Manrope and Inter fonts as self-hosted woff2 files, removing the dependency on Google Fonts CDN
- CI workflow with GitHub Actions
- Kamal deployment support for the dummy app

### Changed

- Active navigation items and tabs now use the accent color instead of the foreground color
- Install generator now also creates the overrides file and imports it into `application.css`
- Header icon and logo elements include `w-auto` to prevent layout shift

### Removed

- Google Fonts preconnect links from the application layout

## [0.1.0] - 2026-02-16

Initial release.

- Responsive layout system with header, sidebar navigation, main content area, and resizable panel
- Design tokens as CSS custom properties with light and dark theme support
- Stimulus controllers for theme switching, mobile navigation, panel, modal, and tabs
- Component styles for buttons, forms, switches, surfaces, tables, tabs, notices, badges, conversations, and pagination
- Install generator (`layered:ui:install`) to copy CSS and JS imports into the host app
- Optional Devise and Pagy integrations
- WCAG 2.2 Level AA accessibility
