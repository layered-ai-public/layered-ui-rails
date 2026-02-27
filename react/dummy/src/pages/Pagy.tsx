import { Link } from "react-router-dom"
import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

export default function Pagy() {
  return (
    <>
      <PageHeader
        title="Pagy"
        description="Pagy is fully supported but entirely optional. The engine works without any pagination system."
      />

      <h2 className="l-ui-utility--mt-2xl">When Pagy is installed</h2>

      <p className="l-ui-utility--mt-md">The engine automatically detects Pagy and provides:</p>

      <ul className="l-ui-list l-ui-utility--mt-lg">
        <li><code>Pagy::Method</code> included in controllers automatically</li>
        <li>A <code>PaginationHelper</code> for rendering styled page navigation</li>
        <li>Styled pagination controls that match the theme</li>
      </ul>

      <h2 className="l-ui-utility--mt-2xl">Installation</h2>

      <p className="l-ui-utility--mt-md">Add Pagy to your application:</p>
      <code className="l-ui-surface l-ui-utility--mt-md">bundle add pagy</code>

      <p className="l-ui-utility--mt-lg">If you want to modify the number of items per page (default is 20), create an initializer at <code>config/initializers/pagy.rb</code>:</p>
      <code className="l-ui-surface l-ui-utility--mt-md">Pagy::DEFAULT[:limit] = 20</code>

      <h2 className="l-ui-utility--mt-2xl">Helper methods</h2>

      <p className="l-ui-utility--mt-md">The pagination helper provides:</p>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Pagy helpers</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Helper</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l_ui_pagy</code></th>
              <td className="l-ui-table__cell">Renders styled pagination links from a Pagy instance</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Example</h2>

      <p className="l-ui-utility--mt-md">See the <Link to="/pagination">pagination page</Link> for a live example.</p>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-pagy-usage" heading="Pagy helper">
          <code className="l-ui-surface">{`# Controller
@pagy, @records = pagy(Model.all, limit: 10)

# View
<%= l_ui_pagy(@pagy) %>`}</code>
        </CodeModal>
      </div>
    </>
  )
}
