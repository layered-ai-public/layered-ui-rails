# layered-ui-rails

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![CI](https://github.com/layered-ai-public/layered-ui-rails/actions/workflows/ci.yml/badge.svg)](https://github.com/layered-ai-public/layered-ui-rails/actions/workflows/ci.yml)
[![WCAG 2.2 AA](https://img.shields.io/badge/WCAG_2.2-AA-green)](https://www.w3.org/WAI/WCAG22/quickref/)
[![Website](https://img.shields.io/badge/Website-layered.ai-purple)](https://www.layered.ai/)
[![GitHub](https://img.shields.io/badge/GitHub-layered--ui--rails-black)](https://github.com/layered-ai-public/layered-ui-rails)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2)](https://discord.gg/aCGqz9Bx)
[![YouTube](https://img.shields.io/badge/YouTube-subscribe-FF0000)](https://www.youtube.com/@UseLayeredAi)
[![X](https://img.shields.io/badge/X-follow-000000)](https://x.com/UseLayeredAi)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-follow-0A66C2)](https://www.linkedin.com/company/uselayeredai/)

An open source, Rails 8+ engine that provides WCAG 2.2 AA compliant design tokens, Tailwind CSS utilities, and Stimulus controllers for theme switching, mobile navigation, slide-out panels, modals, and tabs. See the [live demo](https://layered-ui-rails.layered.ai).

<table align="center">
  <tr>
    <td align="center">
      <img src="https://github.com/layered-ai-public/layered-ui-rails/raw/refs/heads/main/test/dummy/app/assets/images/light_desktop.webp" alt="Light theme (desktop)" height="300">
      <img src="https://github.com/layered-ai-public/layered-ui-rails/raw/refs/heads/main/test/dummy/app/assets/images/light_mobile.webp" alt="Light theme (mobile)" height="300">
    </td>
    <td width="20"></td>
    <td align="center">
      <img src="https://github.com/layered-ai-public/layered-ui-rails/raw/refs/heads/main/test/dummy/app/assets/images/dark_desktop.webp" alt="Dark theme (desktop)" height="300">
      <img src="https://github.com/layered-ai-public/layered-ui-rails/raw/refs/heads/main/test/dummy/app/assets/images/dark_mobile.webp" alt="Dark theme (mobile)" height="300">
    </td>
  </tr>
  <tr>
    <td align="center"><em>Light theme (desktop and mobile)</em></td>
    <td></td>
    <td align="center"><em>Dark theme (desktop and mobile)</em></td>
  </tr>
</table>

## Features

- **Dark/light theme** - system preference detection with localStorage persistence and manual toggle
- **Responsive layout** - header, sidebar navigation, main content area, and optional resizable panel
- **WCAG 2.2 AA compliant** - skip links, focus indicators, ARIA attributes, and 4.5:1 contrast ratios
- **Components** - buttons, forms, surfaces, tables, tabs, notices, badges, conversations, modals, and pagination
- **Optional integrations** - Devise authentication and Pagy pagination with styled views
- **Customisable branding** - Override the default logos and icons and colors
- **Google Lighthouse** - `layered-ui-rails` scores a [perfect 100](https://github.com/layered-ai-public/layered-ui-rails/raw/refs/heads/main/test/dummy/app/assets/images/lighthouse.webp) across all four Google Lighthouse categories - performance, accessibility, best practices, and SEO

## Requirements

- Ruby on Rails >= 8.0
- Tailwind CSS Rails >= 4.0
- Importmap Rails >= 2.0
- Stimulus Rails >= 1.0

## Agent skill

An [agent skill](https://agentskills.io) is included so AI coding agents can work with `layered-ui-rails` in your project. Once installed, the agent can handle the full setup - just ask it to add `layered-ui-rails` to your app and it will install the gem, run the generator, and configure your layout.

**Project install** - scoped to a single repo, available to all contributors:

```bash
bin/rails generate layered:ui:install_agent_skill
```

**Global install** - available across all your projects:

```bash
./install-skill.sh
# or install remotely without cloning the repo:
curl -fsSL https://raw.githubusercontent.com/layered-ai-public/layered-ui-rails/main/install-skill.sh | sh
```

## Installation

Add to your Gemfile and install:

```bash
bundle add layered-ui-rails
bin/rails generate layered:ui:install
```

The install generator will:
- Copy `layered_ui.css` to `app/assets/tailwind/`
- Add `@import "./layered_ui";` to your `application.css`
- Add `import "layered_ui"` to your `application.js`

Then update your application layout to render the engine layout. Place any `content_for` blocks **above** the render call - the engine layout reads them when it renders, so they must be defined first:

```erb
<% content_for :l_ui_body_class, "l-ui-body--always-show-navigation" %>

<% content_for :l_ui_navigation_items do %>
  <%= l_ui_navigation_item "Home", root_path %>
<% end %>

<%= render template: "layouts/layered_ui/application" %>
```

## Customising theme tokens

All colors are CSS custom properties on `:root` using a two-tier system:

- **Tier 1 - Accent:** Set `--accent` and `--accent-foreground` for quick branding.
- **Tier 2 - Full palette:** Override any individual token. Includes `--button-primary-bg` and `--button-primary-text` which default to the accent pair but can be overridden independently (e.g. a pink accent that needs white button text in dark mode).

```css
/* app/assets/tailwind/application.css */
@import "./layered_ui";

:root {
  --accent: oklch(0.58 0.19 255);
  --accent-foreground: oklch(1 0 0);
}

.dark {
  --accent: oklch(0.72 0.14 255);
  --accent-foreground: oklch(0.2044 0 0);
  --button-primary-text: oklch(1 0 0); /* white icons/text on colored buttons */
}
```

For dynamic theming (e.g. per-tenant branding), use `content_for :l_ui_head` to inject content into the layout `<head>`:

```erb
<% content_for :l_ui_head do %>
  <style>
    :root { --accent: <%= @tenant.accent_color %>; --accent-foreground: oklch(1 0 0); }
  </style>
<% end %>
```

> **Security:** never interpolate user-supplied strings directly into a `<style>` tag - this allows CSS injection (Important: Validate or sanitise any user-derived values before interpolation).

> **CSP compatibility:** inline `<style>` blocks are blocked by a strict `Content-Security-Policy: style-src 'self'` header. If your app enforces a strict CSP, add a nonce to the style tag using Rails' `content_security_policy_nonce` helper - Rails automatically includes the matching nonce in the CSP header:
>
> ```erb
> <% content_for :l_ui_head do %>
>   <style nonce="<%= content_security_policy_nonce %>">
>     :root { --accent: <%= @tenant.accent_color %>; --accent-foreground: oklch(1 0 0); }
>   </style>
> <% end %>
> ```

See the [Colors documentation](https://layered-ui-rails.layered.ai/layout_colors) for the full list of tokens.

## Customising logos and icons

Replace the defaults by placing files with the same names in `app/assets/images/layered_ui/` in your host app:

| File | Used for |
|---|---|
| `logo_light.svg` | Header logo (light theme) |
| `logo_dark.svg` | Header logo (dark theme) |
| `icon_light.svg` | Favicon and header icon (light theme) |
| `icon_dark.svg` | Favicon and header icon (dark theme) |
| `apple_touch_icon.png` | Apple touch icon |

layered-ui-rails uses two patterns for per-request overrides:

- **Instance variables** (`@l_ui_*`) - used for small changes like URLs. The engine renders the surrounding markup and just swaps the src/href.
- **`content_for`** - used when the full markup needs to change. You supply the complete tag, so you can set classes, attributes, or wrap elements as needed.

For per-request logos (e.g. per-tenant branding), use `content_for` because the `<img>` tag itself carries classes that control layout and theme switching:

```erb
<% content_for :l_ui_logo_light do %>
  <%= image_tag @tenant.logo_light_url, alt: "", class: "l-ui-header__logo l-ui-header__logo--light" %>
<% end %>

<% content_for :l_ui_logo_dark do %>
  <%= image_tag @tenant.logo_dark_url, alt: "", class: "l-ui-header__logo l-ui-header__logo--dark" %>
<% end %>
```

To adjust the size of the logo or header icon, override `.l-ui-header__logo` or `.l-ui-header__icon` in `layered_ui_overrides.css` (created by `bin/rails generate layered:ui:create_overrides`). Commented examples are included in the Tier 3 section of that file.

For per-request icons, set instance variables - the engine renders `<link>` and `<img>` tags that only need a URL to vary:

```ruby
@l_ui_icon_light_url = @tenant.icon_light_url
@l_ui_icon_dark_url = @tenant.icon_dark_url
@l_ui_apple_touch_icon_url = @tenant.apple_touch_icon_url
@l_ui_panel_icon_light_url = @tenant.panel_icon_light_url
@l_ui_panel_icon_dark_url = @tenant.panel_icon_dark_url
```

> **Security:** Rails HTML-escapes URL values, so XSS via attribute injection is mitigated. However, if values are tenant-controlled, validate that they are legitimate URLs - reject `javascript:` schemes and ensure values point to expected origins.

## Documentation

An online version of the documentation is available at **[layered-ui-rails.layered.ai](https://layered-ui-rails.layered.ai)**.

The latest accessibility audit is available at **[audits/accessibility/codex-5_3.md](https://github.com/layered-ai-public/layered-ui-rails/blob/main/audits/accessibility/codex-5_3.md)**.

You can also run the included dummy app locally for development and testing:

```bash
git clone https://github.com/layered-ai-public/layered-ui-rails.git
cd layered-ui-rails
bundle install
cd test/dummy && bin/rails db:setup && bin/dev
```

The dummy app serves as both a living style guide and a test harness, with interactive examples and code snippets for every component.

### Deploying the dummy app

The dummy app can be deployed with [Kamal](https://kamal-deploy.org). Set the required environment variables and deploy from `test/dummy`:

```bash
cd test/dummy
export KAMAL_DEPLOY_IP=<server-ip>
export KAMAL_DEPLOY_DOMAIN=<domain>
export KAMAL_SSH_KEY=<path-to-ssh-key>
kamal deploy
```

## Contributing

This project is still in its early days. We welcome issues, feedback, and ideas - they genuinely help shape the direction of the project. That said, we're holding off on accepting pull requests for now to stay focused on getting the foundations right. Thank you for your patience and interest. See [CLA.md](CLA.md) for the full policy.

## License

Released under the [Apache 2.0 License](LICENSE).

Copyright 2026 LAYERED AI LIMITED (UK company number: 17056830). See [NOTICE](NOTICE) for attribution details.

## Trademarks

The source code is fully open, but the layered.ai name, logo, and brand assets are trademarks of LAYERED AI LIMITED. The Apache 2.0 license does not grant rights to use the layered.ai branding. Forks and redistributions must use a distinct name. See [TRADEMARK.md](TRADEMARK.md) for the full policy.
