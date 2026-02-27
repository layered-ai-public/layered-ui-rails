import { Link } from "react-router-dom"
import { PageHeader } from "../components/PageHeader"

export default function Integrations() {
  return (
    <>
      <PageHeader
        title="Integrations"
        description="layered-ui-rails works with popular Rails gems out of the box."
      />

      <h2 className="l-ui-utility--mt-2xl">Supported integrations</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Supported integrations</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Gem</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><Link to="/integrations/devise">Devise</Link></th>
              <td className="l-ui-table__cell">Authentication with styled sign in, registration, and password reset forms</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><Link to="/integrations/pagy">Pagy</Link></th>
              <td className="l-ui-table__cell">Fast pagination with styled navigation controls</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
