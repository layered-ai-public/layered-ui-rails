import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

export default function Typography() {
  return (
    <>
      <PageHeader
        title="Typography"
        description="layered-ui-rails applies base typography styles to standard HTML elements via @layer base, so they can be overridden by the host application. Headings use the Manrope font and body text uses Inter."
      />

      <h2 className="l-ui-utility--mt-2xl">Headings</h2>

      <div className="l-ui-surface l-ui-utility--mt-lg">
        <h1>Heading 1</h1>
        <h2 className="l-ui-utility--mt-lg">Heading 2</h2>
        <h3 className="l-ui-utility--mt-lg">Heading 3</h3>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-typography-headings" heading="Headings">
          <code className="l-ui-surface">{`<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Paragraphs</h2>

      <div className="l-ui-surface l-ui-utility--mt-lg">
        <p>This is a standard paragraph. Body text uses the Inter font at a small size with relaxed line height and muted foreground colour.</p>
        <p className="l-ui-utility--mt-md">Paragraphs can contain <a href="#">inline links</a> which are styled with an underline and use the foreground colour.</p>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-typography-paragraphs" heading="Paragraphs">
          <code className="l-ui-surface">{`<p>This is a standard paragraph.</p>
<p>Paragraphs can contain <a href="#">inline links</a>.</p>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Lists</h2>

      <div className="l-ui-surface l-ui-utility--mt-lg">
        <ul>
          <li>Unordered list item one</li>
          <li>Unordered list item two</li>
          <li>Unordered list item three</li>
        </ul>
        <ol className="l-ui-utility--mt-lg">
          <li>Ordered list item one</li>
          <li>Ordered list item two</li>
          <li>Ordered list item three</li>
        </ol>
        <h3 className="l-ui-utility--mt-xl">With l-ui-list</h3>
        <ul className="l-ui-list l-ui-utility--mt-md">
          <li>Spaced list item one</li>
          <li>Spaced list item two</li>
          <li>Spaced list item three</li>
        </ul>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-typography-lists" heading="Lists">
          <code className="l-ui-surface">{`<ul>
  <li>Unordered list item</li>
</ul>

<ol>
  <li>Ordered list item</li>
</ol>

<ul class="l-ui-list">
  <li>Spaced list item with bullet</li>
</ul>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Fonts</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Font family tokens</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Token</th>
              <th className="l-ui-table__header-cell" scope="col">Font stack</th>
              <th className="l-ui-table__header-cell" scope="col">Usage</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>font-manrope</code></th>
              <td className="l-ui-table__cell">Manrope, ui-sans-serif, system-ui, sans-serif</td>
              <td className="l-ui-table__cell">Headings and labels</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>font-inter</code></th>
              <td className="l-ui-table__cell">Inter, ui-sans-serif, system-ui, sans-serif</td>
              <td className="l-ui-table__cell">Body text and form fields</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
