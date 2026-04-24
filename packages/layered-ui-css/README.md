# @layered-ui/css

Framework-agnostic CSS source for layered-ui component classes and design tokens.

This package is the canonical shared CSS source used by `layered-ui-rails` and the future layered UI React package. The Rails gem vendors a release snapshot plus Rails-only integration styles, so Rails applications can keep using the existing no-Node generator workflow.

## Usage

Import the compiled CSS from JavaScript or a bundler CSS entry:

```js
import "@layered-ui/css";
```

Or import the Tailwind CSS v4 source file from a build that already imports Tailwind and processes Tailwind directives:

```css
@import "@layered-ui/css/source.css";
```

The source uses Tailwind v4 directives including `@theme`, `@utility`, `@variant`, and `@apply`.

## Assets

Fonts are exported from:

```text
@layered-ui/css/fonts/inter.woff2
@layered-ui/css/fonts/manrope.woff2
```

## Rails vendoring

From the repository root, run:

```bash
bundle exec rake layered_ui:sync_css
```

This copies the package CSS and fonts into the Rails gem asset paths, rewriting font URLs for the Rails asset pipeline.
