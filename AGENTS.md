# AGENTS.md

Guidance for AI agents working in this repository.

## Project

**layered-ui-rails** - Rails 8+ engine gem: design tokens, Tailwind CSS, Stimulus controllers (theme, mobile nav, panel, modal, tabs). Pure frontend, no server-side logic.

## Architecture

- **Entry:** `require "layered-ui-rails"` → `lib/layered/ui.rb` → `lib/layered/ui/engine.rb`
- **Engine:** importmap, assets, Pagy helpers when present; helpers: `AuthenticationHelper`, `NavigationHelper`, `PaginationHelper`
- **CSS** `app/assets/tailwind/layered/ui/styles.css`: HSL tokens, `.dark` on `<html>`, `@theme` utilities (`bg-background`, etc.), BEM components (`.l-ui-button--primary`, etc.). Layout: 63px header, 240px sidebar, 320px panel. WCAG 2.2 AA.
- **CSS `@apply`:** Multi-line with grouping (layout → spacing → typography → colors → effects). Single utilities may stay on one line.
- **Generators:** `bin/rails generate layered:ui:install` (copy CSS, import CSS, import JS)
- **JS** `app/javascript/layered_ui/`: Stimulus controllers registered as `l-ui--theme`, `l-ui--mobile-navigation`, `l-ui--panel`, `l-ui--modal`, `l-ui--tabs`
- **Layout yields** (prefixed `l_ui_`): `:l_ui_navigation_items`, `:l_ui_panel_heading`, `:l_ui_panel_body`

## Testing

`test/dummy/` - Rails 8 app with Devise. Run: `bundle exec rake test`

## Conventions

- Document new styles in the dummy app. Use `l-ui` classes only there, no extra Tailwind.
- Titles: capitalise first word only (e.g. "This title")
- WCAG 2.2 AA compliance. Importmap for JS (no bundler).
