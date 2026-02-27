import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"
import { IconClose, IconMoon } from "@layered-ui/icons"

export default function Buttons() {
  return (
    <>
      <PageHeader
        title="Buttons"
        description="Button styles for primary actions, secondary actions, and destructive operations."
      />

      <h2 className="l-ui-utility--mt-2xl">Button variants</h2>

      <div className="l-ui-container--spread l-ui-utility--mt-lg">
        <button className="l-ui-button--primary">Primary button</button>
        <button className="l-ui-button--outline">Outline button</button>
        <button className="l-ui-button--outline-danger">Danger button</button>
        <button className="l-ui-button--icon" aria-label="Close">
          <IconClose width={20} height={20} className="l-ui-icon--sm" aria-hidden="true" />
        </button>
        <button className="l-ui-button--icon" aria-label="Toggle dark mode">
          <IconMoon width={20} height={20} className="l-ui-icon--sm" aria-hidden="true" />
        </button>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-buttons-variants" heading="Button variants">
          <code className="l-ui-surface">{`<button class="l-ui-button--primary">Primary</button>
<button class="l-ui-button--outline">Outline</button>
<button class="l-ui-button--outline-danger">Danger</button>
<button class="l-ui-button--icon" aria-label="Close">
  <svg class="l-ui-icon--sm">...</svg>
</button>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Full width</h2>

      <div className="l-ui-utility--mt-lg">
        <button className="l-ui-button--primary l-ui-button--full">Full width button</button>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-buttons-full-width" heading="Full width">
          <code className="l-ui-surface">{`<button class="l-ui-button--primary l-ui-button--full">
  Full width button
</button>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">CSS classes</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Button CSS classes</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Class</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-button--primary</code></th>
              <td className="l-ui-table__cell">Primary action button with solid background</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-button--outline</code></th>
              <td className="l-ui-table__cell">Secondary action button with outline style</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-button--outline-danger</code></th>
              <td className="l-ui-table__cell">Destructive action button with red outline</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-button--icon</code></th>
              <td className="l-ui-table__cell">Icon-only button for close, theme toggle, and other actions</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-button--full</code></th>
              <td className="l-ui-table__cell">Modifier for full-width button</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
