import { PageHeader } from "../components/PageHeader"

export default function LayoutLogos() {
  return (
    <>
      <PageHeader
        title="Logos"
        description="The header displays a logo on wider screens and an icon on mobile."
      />

      <p className="l-ui-utility--mt-md">Override the defaults by placing files in <code>app/assets/images/layered_ui/</code>.</p>

      <h2 className="l-ui-utility--mt-2xl">Files</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Logo files</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">File</th>
              <th className="l-ui-table__header-cell" scope="col">Used for</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>logo_light.svg</code></th>
              <td className="l-ui-table__cell">Header logo (light theme)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>logo_dark.svg</code></th>
              <td className="l-ui-table__cell">Header logo (dark theme)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
