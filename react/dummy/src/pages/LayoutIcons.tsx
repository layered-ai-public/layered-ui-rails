import { PageHeader } from "../components/PageHeader"

export default function LayoutIcons() {
  return (
    <>
      <PageHeader
        title="Icons"
        description="Icons are used for the header, favicon, apple touch icon, and panel toggle button."
      />

      <p className="l-ui-utility--mt-md">Override the defaults by placing files in <code>app/assets/images/layered_ui/</code>.</p>

      <h2 className="l-ui-utility--mt-2xl">Files</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Icon files</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">File</th>
              <th className="l-ui-table__header-cell" scope="col">Used for</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>icon_light.svg</code></th>
              <td className="l-ui-table__cell">Header icon and favicon (light theme)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>icon_dark.svg</code></th>
              <td className="l-ui-table__cell">Header icon and favicon (dark theme)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>apple_touch_icon.png</code></th>
              <td className="l-ui-table__cell">Apple touch icon</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>panel_icon_light.svg</code></th>
              <td className="l-ui-table__cell">Panel toggle button (light theme)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>panel_icon_dark.svg</code></th>
              <td className="l-ui-table__cell">Panel toggle button (dark theme)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
