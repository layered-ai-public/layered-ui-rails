import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

export default function Links() {
  return (
    <>
      <PageHeader
        title="Links"
        description="Styled anchor tags within content areas."
      />

      <h2 className="l-ui-utility--mt-2xl">Default link style</h2>

      <p className="l-ui-utility--mt-lg">
        This is a paragraph with a <a href="#">link</a> inside it. Links are automatically styled within the main content area.
      </p>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-links" heading="Link">
          <code className="l-ui-surface">{`<p>Text with a <a href="#">link</a>.</p>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Usage notes</h2>

      <div className="l-ui-surface l-ui-utility--mt-lg">
        <p>
          Links within <code>p</code> elements are styled via <code>@layer base</code> (overridable by the host application) with:
        </p>
        <ul className="l-ui-list l-ui-utility--mt-md">
          <li>Accent color for visibility</li>
          <li>Underline on hover</li>
          <li>Focus ring for keyboard navigation</li>
        </ul>
      </div>
    </>
  )
}
