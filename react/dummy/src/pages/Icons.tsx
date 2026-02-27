import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )
}

export default function Icons() {
  return (
    <>
      <PageHeader
        title="Icons"
        description="Icon size utilities for consistent scaling across your application."
      />

      <h2 className="l-ui-utility--mt-2xl">Icon sizes</h2>

      <div className="l-ui-container--spread l-ui-utility--mt-lg">
        <div>
          <PlusIcon className="l-ui-icon--sm" />
          <p className="l-ui-utility--mt-sm">sm (20px)</p>
        </div>
        <div>
          <PlusIcon className="l-ui-icon--md" />
          <p className="l-ui-utility--mt-sm">md (24px)</p>
        </div>
        <div>
          <PlusIcon className="l-ui-icon--lg" />
          <p className="l-ui-utility--mt-sm">lg (28px)</p>
        </div>
        <div>
          <PlusIcon className="l-ui-icon--xl" />
          <p className="l-ui-utility--mt-sm">xl (32px)</p>
        </div>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-icons-sizes" heading="Icon sizes">
          <code className="l-ui-surface">{`<svg class="l-ui-icon--sm" ...>...</svg>
<svg class="l-ui-icon--md" ...>...</svg>
<svg class="l-ui-icon--lg" ...>...</svg>
<svg class="l-ui-icon--xl" ...>...</svg>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">CSS classes</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Icon CSS classes</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Class</th>
              <th className="l-ui-table__header-cell" scope="col">Size</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-icon--sm</code></th>
              <td className="l-ui-table__cell">20px x 20px</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-icon--md</code></th>
              <td className="l-ui-table__cell">24px x 24px</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-icon--lg</code></th>
              <td className="l-ui-table__cell">28px x 28px</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-icon--xl</code></th>
              <td className="l-ui-table__cell">32px x 32px</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
