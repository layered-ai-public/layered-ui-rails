import { Link } from "react-router-dom"
import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

export default function Containers() {
  return (
    <>
      <PageHeader
        title="Containers"
        description="Layout containers for common page patterns."
      />

      <h2 className="l-ui-utility--mt-2xl">Spread container</h2>

      <p className="l-ui-utility--mt-md">Flexbox container with title on the left and actions on the right:</p>

      <div className="l-ui-container--spread l-ui-utility--mt-lg">
        <h2>Example title</h2>
        <button className="l-ui-button--primary">New</button>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-containers-spread" heading="Spread container">
          <code className="l-ui-surface">{`<div class="l-ui-container--spread">
  <h1>Page title</h1>
  <button class="l-ui-button--primary">New</button>
</div>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Grid container</h2>

      <p className="l-ui-utility--mt-md">Responsive grid that stacks on mobile and switches to two columns on medium screens:</p>

      <div className="l-ui-container--grid l-ui-utility--mt-lg">
        <div className="l-ui-surface">
          <h3>First item</h3>
          <p className="l-ui-utility--mt-sm">Grid items stack vertically on mobile.</p>
        </div>
        <div className="l-ui-surface">
          <h3>Second item</h3>
          <p className="l-ui-utility--mt-sm">On medium screens they sit side by side.</p>
        </div>
        <div className="l-ui-surface">
          <h3>Third item</h3>
          <p className="l-ui-utility--mt-sm">Additional items wrap to the next row.</p>
        </div>
        <div className="l-ui-surface">
          <h3>Fourth item</h3>
          <p className="l-ui-utility--mt-sm">The grid fills evenly with consistent gaps.</p>
        </div>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-containers-grid" heading="Grid container">
          <code className="l-ui-surface">{`<div class="l-ui-container--grid">
  <div class="l-ui-surface">First</div>
  <div class="l-ui-surface">Second</div>
  <div class="l-ui-surface">Third</div>
  <div class="l-ui-surface">Fourth</div>
</div>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">CSS classes</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Container CSS classes</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Class</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-container--spread</code></th>
              <td className="l-ui-table__cell">Flexbox with space-between alignment</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-container--grid</code></th>
              <td className="l-ui-table__cell">Responsive grid, stacked on mobile, two columns on md</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-container--table</code></th>
              <td className="l-ui-table__cell">Scrollable container for <Link to="/tables">tables</Link></td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-container--checkbox</code></th>
              <td className="l-ui-table__cell">Flexbox container for <Link to="/forms">checkboxes</Link> and their labels</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-container--pagy</code></th>
              <td className="l-ui-table__cell">Container for <Link to="/integrations/pagy">Pagy</Link> pagination</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
