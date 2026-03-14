# Changelog

All notable changes to this project will be documented in this file. This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

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
