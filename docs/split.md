The clean model would be:

```text
@layered-ui/css/foundation.css
@layered-ui/css/table.css
@layered-ui/css/forms.css
@layered-ui/css/buttons.css
@layered-ui/css/modal.css
@layered-ui/css/tabs.css
@layered-ui/css/all.css
```

Where:

- `foundation.css` contains tokens, fonts, dark variant, base typography, focus ring, shared utilities, spacing helpers, icons, surfaces if they are treated as primitives.
- `table.css` contains only table/container/sort/table pagination styling needed for tables.
- `all.css` imports everything for the Rails gem and for users who want the full system.

The important caveat: CSS does not tree-shake reliably just because it is in an NPM package. The lightweight path only works if consumers import the specific module:

```css
@import "@layered-ui/css/foundation.css";
@import "@layered-ui/css/table.css";
```

or in JS:

```js
import "@layered-ui/css/foundation.css"
import "@layered-ui/css/table.css"
```

There are a few engineering details to handle:

- Modules need a dependency map. For example, table sort links may need shared `focus-ring`, colour tokens, typography, and spacing utilities from foundation.
- Avoid duplicated foundation CSS when someone imports multiple components.
- Keep compiled exports and Tailwind-source exports separate, e.g. `table.css` and `source/table.css`.
- Keep Rails-only integrations, like Pagy table/pagination glue, outside the shared module package or under a Rails-specific export.
- Maintain cascade order. Foundation must load before components.

So yes, theoretically and practically possible. I would not split it immediately into tiny pieces, though. I’d first split into:

1. `foundation`
2. `components`
3. `rails-integrations`
4. `all`

Then, once React starts consuming individual pieces, split high-value modules like `tables`, `forms`, `buttons`, and `pagination`. That avoids over-designing the package before we know the actual import patterns.
