import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

export default function Surfaces() {
  return (
    <>
      <PageHeader
        title="Surfaces"
        description="Container styles for grouping related content with visual hierarchy."
      />

      <h2 className="l-ui-utility--mt-2xl">Default surface</h2>

      <div className="l-ui-surface l-ui-utility--mt-lg">
        <h3>Surface</h3>
        <p className="l-ui-utility--mt-sm">
          Default surface component with a subtle background and padding.
        </p>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-surfaces-default" heading="Default surface">
          <code className="l-ui-surface">{`<div class="l-ui-surface">
  <h3>Title</h3>
  <p>Content goes here</p>
</div>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Active surface</h2>

      <div className="l-ui-surface--active l-ui-utility--mt-lg">
        <h3>Surface active</h3>
        <p className="l-ui-utility--mt-sm">
          An active variant for highlighted or interactive content sections.
        </p>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-surfaces-active" heading="Active surface">
          <code className="l-ui-surface">{`<div class="l-ui-surface--active">
  <h3>Title</h3>
  <p>Content goes here</p>
</div>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">CSS classes</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Surface CSS classes</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Class</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-surface</code></th>
              <td className="l-ui-table__cell">Default surface with background</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-surface--active</code></th>
              <td className="l-ui-table__cell">Active/selected state</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
