import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

export default function Notices() {
  return (
    <>
      <PageHeader
        title="Notices"
        description="Flash message styles for success, warning, and error states."
      />

      <h2 className="l-ui-utility--mt-2xl">Notice variants</h2>

      <div className="l-ui-utility--mt-lg">
        <div className="l-ui-notice--success" role="alert">
          This is a success notice. Everything worked as expected!
        </div>

        <div className="l-ui-notice--warning l-ui-utility--mt-lg" role="alert">
          This is a warning notice. Please review this information carefully.
        </div>

        <div className="l-ui-notice--error l-ui-utility--mt-lg" role="alert">
          This is an error notice. Something went wrong and needs attention.
        </div>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-notices-variants" heading="Notice variants">
          <code className="l-ui-surface">{`<div class="l-ui-notice--success">Success message</div>
<div class="l-ui-notice--warning">Warning message</div>
<div class="l-ui-notice--error">Error message</div>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">CSS classes</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Notice CSS classes</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Class</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-notice--success</code></th>
              <td className="l-ui-table__cell">Green success message</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-notice--warning</code></th>
              <td className="l-ui-table__cell">Yellow warning message</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-notice--error</code></th>
              <td className="l-ui-table__cell">Red error message</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
