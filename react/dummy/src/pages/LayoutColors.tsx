import { PageHeader } from "../components/PageHeader"

export default function LayoutColors() {
  return (
    <>
      <PageHeader
        title="Colors"
        description="layered-ui-rails supports a two-tier color customisation system."
      />

      <p className="l-ui-utility--mt-md">Set a single accent color for quick branding, or override any of the individual color tokens for full control.</p>

      <h2 className="l-ui-utility--mt-2xl">Getting started</h2>

      <p className="l-ui-utility--mt-md">Run the install generator to create the overrides file:</p>

      <code className="l-ui-surface l-ui-utility--mt-lg">bin/rails generate layered:ui:install</code>

      <p className="l-ui-utility--mt-lg">This creates <code>app/assets/tailwind/layered_ui_overrides.css</code> with all variables commented out. The file is not overwritten on subsequent runs, so your changes are preserved.</p>

      <h2 className="l-ui-utility--mt-2xl">Tier 1 - Accent color</h2>

      <p className="l-ui-utility--mt-md">Set <code>--accent</code> and <code>--accent-foreground</code> in your overrides file. Primary buttons, active tabs, and active navigation items all inherit from these two variables.</p>

      <code className="l-ui-surface l-ui-utility--mt-lg">{`/* layered_ui_overrides.css */

:root {
  --accent: 220 80% 55%;
  --accent-foreground: 0 0% 100%;
}

.dark {
  --accent: 220 80% 65%;
  --accent-foreground: 0 0% 9%;
}`}</code>

      <h3 className="l-ui-utility--mt-xl">Affected elements</h3>

      <p className="l-ui-utility--mt-md">The following elements respond to the accent color:</p>

      <ul className="l-ui-list l-ui-utility--mt-md">
        <li>Primary buttons (<code>l-ui-button--primary</code>)</li>
        <li>Active tab indicators (<code>l-ui-tabs__tab--active</code>)</li>
        <li>Active navigation items (<code>l-ui-navigation__item--active</code>)</li>
        <li>Panel toggle button (<code>l-ui-panel__button</code>)</li>
        <li>Sent message bubbles (<code>l-ui-message--sent</code>)</li>
      </ul>

      <h2 className="l-ui-utility--mt-2xl">Tier 2 - Full color overrides</h2>

      <p className="l-ui-utility--mt-md">Override any individual design token for complete control. Uncomment only the variables you need in your overrides file. Values use HSL channels in the format <code>hue saturation% lightness%</code>.</p>
      <p className="l-ui-utility--mt-md">When setting custom colours, check that text, controls, and states still meet WCAG 2.2 AA.</p>

      <code className="l-ui-surface l-ui-utility--mt-lg">{`/* layered_ui_overrides.css */

:root {
  --accent: 220 80% 55%;
  --accent-foreground: 0 0% 100%;
  --background: 220 20% 98%;
  --surface: 220 15% 94%;
}

.dark {
  --accent: 220 80% 65%;
  --accent-foreground: 0 0% 9%;
  --background: 220 15% 5%;
  --surface: 220 15% 10%;
}`}</code>

      <h2 className="l-ui-utility--mt-2xl">Design tokens</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Design tokens</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Token</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--accent</code></th>
              <td className="l-ui-table__cell">Brand / accent color (HSL channels)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--accent-foreground</code></th>
              <td className="l-ui-table__cell">Text color on accent backgrounds</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--background</code></th>
              <td className="l-ui-table__cell">Page background</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--foreground</code></th>
              <td className="l-ui-table__cell">Primary text color</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--foreground-muted</code></th>
              <td className="l-ui-table__cell">Secondary / muted text color</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--border</code></th>
              <td className="l-ui-table__cell">Borders for layout separators and surfaces</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--border-control</code></th>
              <td className="l-ui-table__cell">Higher-contrast borders for interactive controls</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--ring</code></th>
              <td className="l-ui-table__cell">Focus ring color</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--surface</code></th>
              <td className="l-ui-table__cell">Raised surface background</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--surface-active</code></th>
              <td className="l-ui-table__cell">Active / highlighted surface background</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--button-primary-bg</code></th>
              <td className="l-ui-table__cell">Primary button background (defaults to <code>--accent</code>)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--button-primary-text</code></th>
              <td className="l-ui-table__cell">Primary button text (defaults to <code>--accent-foreground</code>)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--danger</code></th>
              <td className="l-ui-table__cell">Danger / destructive action color</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--danger-light</code></th>
              <td className="l-ui-table__cell">Light danger background</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--danger-text</code></th>
              <td className="l-ui-table__cell">Text on danger backgrounds</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--success-bg</code></th>
              <td className="l-ui-table__cell">Success state background</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--success-text</code></th>
              <td className="l-ui-table__cell">Text on success backgrounds</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--warning-bg</code></th>
              <td className="l-ui-table__cell">Warning state background</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--warning-text</code></th>
              <td className="l-ui-table__cell">Text on warning backgrounds</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--error-bg</code></th>
              <td className="l-ui-table__cell">Error state background</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--error-text</code></th>
              <td className="l-ui-table__cell">Text on error backgrounds</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>--backdrop</code></th>
              <td className="l-ui-table__cell">Modal / overlay backdrop color</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
