# Changelog

All notable changes to this project will be documented in this file. This project follows [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.1.2] - 2026-02-20

### Added

- Conversation component with markdown support, typing indicators, and token fade-in animation
- Movable panel toggle button with drag-and-drop repositioning

### Changed

- Improved message styles and spacing
- Better table header styling
- Fixed overflow on code blocks and surfaces
- Fixed margins on small screens when vertically centred
- Fixed select element styling
- Rebuilt CSS from engine source every 5 seconds in development

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
