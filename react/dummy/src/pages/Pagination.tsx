import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

export default function Pagination() {
  return (
    <>
      <PageHeader
        title="Pagination"
        description="Navigation controls for paginated content with accessible markup."
      />

      <h2 className="l-ui-utility--mt-2xl">Basic pagination</h2>

      <nav className="l-ui-pagination l-ui-utility--mt-lg" aria-label="Pagination">
        <span className="l-ui-pagination__item l-ui-pagination__item--disabled" aria-disabled="true" aria-label="Previous">&lt;</span>
        <span className="l-ui-pagination__item l-ui-pagination__item--active" aria-current="page">1</span>
        <a href="#" className="l-ui-pagination__item">2</a>
        <a href="#" className="l-ui-pagination__item">3</a>
        <span className="l-ui-pagination__gap">&hellip;</span>
        <a href="#" className="l-ui-pagination__item">10</a>
        <a href="#" className="l-ui-pagination__item" aria-label="Next">&gt;</a>
      </nav>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-pagination" heading="Pagination">
          <code className="l-ui-surface">{`<nav class="l-ui-pagination" aria-label="Pagination">
  <span class="l-ui-pagination__item l-ui-pagination__item--disabled"
     aria-disabled="true" aria-label="Previous">&lt;</span>
  <span class="l-ui-pagination__item l-ui-pagination__item--active"
     aria-current="page">1</span>
  <a href="#" class="l-ui-pagination__item">2</a>
  <span class="l-ui-pagination__gap">&hellip;</span>
  <a href="#" class="l-ui-pagination__item">10</a>
  <a href="#" class="l-ui-pagination__item" aria-label="Next">&gt;</a>
</nav>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">CSS classes</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Pagination CSS classes</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Class</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-pagination</code></th>
              <td className="l-ui-table__cell">Pagination container</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-pagination__item</code></th>
              <td className="l-ui-table__cell">Pagination link/button</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-pagination__item--active</code></th>
              <td className="l-ui-table__cell">Current page indicator</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-pagination__item--disabled</code></th>
              <td className="l-ui-table__cell">Disabled state (prev/next at boundaries)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-pagination__gap</code></th>
              <td className="l-ui-table__cell">Ellipsis for skipped pages</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-container--pagy</code></th>
              <td className="l-ui-table__cell">Container for Pagy-generated markup</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
