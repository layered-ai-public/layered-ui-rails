import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

export default function Badges() {
  return (
    <>
      <PageHeader
        title="Badges"
        description="Status indicators and labels for categorisation."
      />

      <h2 className="l-ui-utility--mt-2xl">Badge variants</h2>

      <div className="l-ui-container--spread l-ui-utility--mt-lg">
        <span className="l-ui-badge--default">Default</span>
        <span className="l-ui-badge--success">Success</span>
        <span className="l-ui-badge--warning">Warning</span>
        <span className="l-ui-badge--danger">Danger</span>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-badges-variants" heading="Badge variants">
          <code className="l-ui-surface">{`<span class="l-ui-badge--default">Default</span>
<span class="l-ui-badge--success">Success</span>
<span class="l-ui-badge--warning">Warning</span>
<span class="l-ui-badge--danger">Danger</span>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Rounded badges</h2>

      <div className="l-ui-container--spread l-ui-utility--mt-lg">
        <span className="l-ui-badge--default l-ui-badge--rounded">Default</span>
        <span className="l-ui-badge--success l-ui-badge--rounded">Success</span>
        <span className="l-ui-badge--warning l-ui-badge--rounded">Warning</span>
        <span className="l-ui-badge--danger l-ui-badge--rounded">Danger</span>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-badges-rounded" heading="Rounded badges">
          <code className="l-ui-surface">{`<span class="l-ui-badge--default l-ui-badge--rounded">Rounded</span>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">CSS classes</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Badge CSS classes</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Class</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-badge--default</code></th>
              <td className="l-ui-table__cell">Neutral grey badge</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-badge--success</code></th>
              <td className="l-ui-table__cell">Green success badge</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-badge--warning</code></th>
              <td className="l-ui-table__cell">Yellow warning badge</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-badge--danger</code></th>
              <td className="l-ui-table__cell">Red danger badge</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-badge--rounded</code></th>
              <td className="l-ui-table__cell">Modifier for pill-shaped badges</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
