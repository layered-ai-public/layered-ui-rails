import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

export default function Utilities() {
  return (
    <>
      <PageHeader
        title="Utilities"
        description="Responsive utility classes for consistent spacing."
      />

      <h2 className="l-ui-utility--mt-2xl">Top margin</h2>

      <p className="l-ui-utility--mt-md">Responsive margin utilities that adjust based on screen size:</p>

      <div className="l-ui-utility--mt-lg">
        <div className="l-ui-surface">
          <p className="l-ui-utility--mt-0">l-ui-utility--mt-0 (mt-0 md:mt-0)</p>
        </div>
        <div className="l-ui-surface l-ui-utility--mt-sm">
          <p className="l-ui-utility--mt-sm">l-ui-utility--mt-sm (mt-1 md:mt-2)</p>
        </div>
        <div className="l-ui-surface l-ui-utility--mt-sm">
          <p className="l-ui-utility--mt-md">l-ui-utility--mt-md (mt-2 md:mt-3)</p>
        </div>
        <div className="l-ui-surface l-ui-utility--mt-sm">
          <p className="l-ui-utility--mt-lg">l-ui-utility--mt-lg (mt-3 md:mt-4)</p>
        </div>
        <div className="l-ui-surface l-ui-utility--mt-sm">
          <p className="l-ui-utility--mt-xl">l-ui-utility--mt-xl (mt-4 md:mt-6)</p>
        </div>
        <div className="l-ui-surface l-ui-utility--mt-sm">
          <p className="l-ui-utility--mt-2xl">l-ui-utility--mt-2xl (mt-6 md:mt-8)</p>
        </div>
        <div className="l-ui-surface l-ui-utility--mb-0">
          <p className="l-ui-utility--mb-0">l-ui-utility--mb-0 (mb-0 md:mb-0)</p>
        </div>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-utilities" heading="Utilities">
          <code className="l-ui-surface">{`<div class="l-ui-utility--mt-0">No margin</div>
<div class="l-ui-utility--mt-sm">Small margin</div>
<div class="l-ui-utility--mt-md">Medium margin</div>
<div class="l-ui-utility--mt-lg">Large margin</div>
<div class="l-ui-utility--mt-xl">Extra large margin</div>
<div class="l-ui-utility--mt-2xl">2X large margin</div>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">CSS classes</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Utility CSS classes</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Class</th>
              <th className="l-ui-table__header-cell" scope="col">Mobile</th>
              <th className="l-ui-table__header-cell" scope="col">Desktop (md+)</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-utility--mt-0</code></th>
              <td className="l-ui-table__cell">0 (mt-0)</td>
              <td className="l-ui-table__cell">0 (mt-0)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-utility--mt-sm</code></th>
              <td className="l-ui-table__cell">0.25rem (mt-1)</td>
              <td className="l-ui-table__cell">0.5rem (mt-2)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-utility--mt-md</code></th>
              <td className="l-ui-table__cell">0.5rem (mt-2)</td>
              <td className="l-ui-table__cell">0.75rem (mt-3)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-utility--mt-lg</code></th>
              <td className="l-ui-table__cell">0.75rem (mt-3)</td>
              <td className="l-ui-table__cell">1rem (mt-4)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-utility--mt-xl</code></th>
              <td className="l-ui-table__cell">1rem (mt-4)</td>
              <td className="l-ui-table__cell">1.5rem (mt-6)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-utility--mt-2xl</code></th>
              <td className="l-ui-table__cell">1.5rem (mt-6)</td>
              <td className="l-ui-table__cell">2rem (mt-8)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-utility---mr-2</code></th>
              <td className="l-ui-table__cell" colSpan={2}>-0.5rem (-mr-2)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
