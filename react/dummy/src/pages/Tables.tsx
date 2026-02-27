import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

const users = [
  { name: "Alice Johnson", email: "alice@example.com", joined: "2 months", updated: "3 days" },
  { name: "Bob Smith", email: "bob@example.com", joined: "6 months", updated: "1 week" },
  { name: "Carol Davis", email: "carol@example.com", joined: "1 year", updated: "2 weeks" },
  { name: "David Wilson", email: "david@example.com", joined: "3 months", updated: "5 days" },
  { name: "Eve Martinez", email: "eve@example.com", joined: "8 months", updated: "1 day" },
]

export default function Tables() {
  return (
    <>
      <PageHeader
        title="Tables"
        description="Data table styles with responsive scrolling and consistent cell styling."
      />

      <h2 className="l-ui-utility--mt-2xl">Example table</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Users</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Name</th>
              <th className="l-ui-table__header-cell" scope="col">Email</th>
              <th className="l-ui-table__header-cell" scope="col">Joined</th>
              <th className="l-ui-table__header-cell" scope="col">Updated</th>
              <th className="l-ui-table__header-cell--action" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            {users.map((user) => (
              <tr key={user.email}>
                <th className="l-ui-table__cell--primary" scope="row"><a href="#">{user.name}</a></th>
                <td className="l-ui-table__cell">{user.email}</td>
                <td className="l-ui-table__cell">{user.joined} ago</td>
                <td className="l-ui-table__cell">{user.updated} ago</td>
                <td className="l-ui-table__cell--action">
                  <a href="#">Edit</a>
                  <button className="l-ui-table__action--danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-tables" heading="Table">
          <code className="l-ui-surface">{`<div class="l-ui-container--table">
  <table class="l-ui-table">
    <caption>Users</caption>
    <thead class="l-ui-table__header">
      <tr>
        <th class="l-ui-table__header-cell" scope="col">Name</th>
        <th class="l-ui-table__header-cell" scope="col">Email</th>
        <th class="l-ui-table__header-cell--action" scope="col">Actions</th>
      </tr>
    </thead>
    <tbody class="l-ui-table__body">
      <tr>
        <th class="l-ui-table__cell--primary" scope="row"><a href="#">Alice</a></th>
        <td class="l-ui-table__cell">alice@example.com</td>
        <td class="l-ui-table__cell--action">
          <a href="#">Edit</a>
          <button class="l-ui-table__action--danger">Delete</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">CSS classes</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Table CSS classes</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Class</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-container--table</code></th>
              <td className="l-ui-table__cell">Scrollable container for responsive tables</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-table</code></th>
              <td className="l-ui-table__cell">Base table styling</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-table__header</code></th>
              <td className="l-ui-table__cell">Table header section</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-table__header-cell</code></th>
              <td className="l-ui-table__cell">Header cell styling</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-table__body</code></th>
              <td className="l-ui-table__cell">Table body section</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-table__cell</code></th>
              <td className="l-ui-table__cell">Standard data cell</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-table__cell--primary</code></th>
              <td className="l-ui-table__cell">Primary cell (first column, links)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-table__cell--action</code></th>
              <td className="l-ui-table__cell">Actions cell (right-aligned)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
