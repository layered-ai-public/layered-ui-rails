import { Link } from "react-router-dom"

export default function Welcome() {
  return (
    <>
      <h1>layered-ui-rails (React)</h1>

      <p className="l-ui-utility--mt-md">
        React component library consuming the layered-ui-rails design system. Single CSS source of truth, React components with hooks for interactivity.
      </p>

      <h2 className="l-ui-utility--mt-xl">Features</h2>
      <div className="l-ui-container--grid l-ui-utility--mt-lg">
        <div className="l-ui-surface">
          <h3>Dark/light theme</h3>
          <p className="l-ui-utility--mt-sm">
            System preference detection with localStorage persistence and manual toggle.
          </p>
        </div>
        <div className="l-ui-surface">
          <h3>Responsive layout</h3>
          <p className="l-ui-utility--mt-sm">
            Header, sidebar navigation, main content area, and optional resizable panel.
          </p>
        </div>
        <div className="l-ui-surface">
          <h3>WCAG 2.2 AA compliant</h3>
          <p className="l-ui-utility--mt-sm">
            Skip links, focus indicators, ARIA attributes, and 4.5:1 contrast ratios.
          </p>
        </div>
        <div className="l-ui-surface">
          <h3>Shared CSS</h3>
          <p className="l-ui-utility--mt-sm">
            Imports the same master styles.css as the Rails engine - single source of truth for design tokens.
          </p>
        </div>
      </div>

      <h2 className="l-ui-utility--mt-xl">Pages</h2>
      <ul className="l-ui-list l-ui-utility--mt-md">
        <li><Link to="/buttons">Buttons</Link></li>
        <li><Link to="/badges">Badges</Link></li>
        <li><Link to="/notices">Notices</Link></li>
        <li><Link to="/surfaces">Surfaces</Link></li>
        <li><Link to="/forms">Forms</Link></li>
        <li><Link to="/tables">Tables</Link></li>
        <li><Link to="/tabs">Tabs</Link></li>
        <li><Link to="/typography">Typography</Link></li>
        <li><Link to="/layout">Layout</Link></li>
      </ul>
    </>
  )
}
