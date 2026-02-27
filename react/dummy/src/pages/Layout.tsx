import { PageHeader } from "../components/PageHeader"

export default function Layout() {
  return (
    <>
      <PageHeader
        title="Layout"
        description="layered-ui-rails provides a layout system with a header, sidebar navigation, and slide-out panel."
      />

      <h2 className="l-ui-utility--mt-2xl">Application layout</h2>

      <p className="l-ui-utility--mt-md">
        The AppShell component provides the full layout with header, navigation, and optional panel.
      </p>

      <code className="l-ui-surface l-ui-utility--mt-lg">{`import { AppShell } from "@layered-ui/components/layout"

const navigation = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about" },
]

function App() {
  return (
    <AppShell navigation={navigation}>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </AppShell>
  )
}`}</code>

      <h2 className="l-ui-utility--mt-2xl">Features</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Layout features</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Feature</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row">Header</th>
              <td className="l-ui-table__cell">Fixed top bar with logo, theme toggle, and mobile nav button</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row">Navigation</th>
              <td className="l-ui-table__cell">240px sidebar on desktop, slide-in drawer on mobile</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row">Theme toggle</th>
              <td className="l-ui-table__cell">Dark/light mode with system preference detection</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row">Skip link</th>
              <td className="l-ui-table__cell">Keyboard-accessible skip to main content</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row">Live region</th>
              <td className="l-ui-table__cell">Screen reader announcements for dynamic changes</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
