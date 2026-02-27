import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"
import { Tabs as TabsComponent } from "@layered-ui/components/tabs"

export default function Tabs() {
  return (
    <>
      <PageHeader
        title="Tabs"
        description="Tabbed interface for organising content into panels, with full keyboard navigation."
      />

      <h2 className="l-ui-utility--mt-2xl">Example</h2>

      <div className="l-ui-utility--mt-lg">
        <TabsComponent
          items={[
            {
              id: "tab-overview",
              label: "Overview",
              content: (
                <>
                  <h3>Overview</h3>
                  <p className="l-ui-utility--mt-md">
                    Tabs organise content into separate views where only one view is visible at a time.
                    Each tab activates its associated panel while hiding the others.
                  </p>
                  <p className="l-ui-utility--mt-md">
                    This component follows the WAI-ARIA Tabs pattern for full accessibility support.
                  </p>
                </>
              ),
            },
            {
              id: "tab-features",
              label: "Features",
              content: (
                <>
                  <h3>Features</h3>
                  <ul className="l-ui-list l-ui-utility--mt-md">
                    <li>Click or keyboard navigation to switch tabs</li>
                    <li>Arrow keys move between tabs with wrap-around</li>
                    <li>Home and End keys jump to first and last tab</li>
                    <li>Screen reader announcements via live region</li>
                    <li>ARIA attributes for accessible tab/panel relationships</li>
                  </ul>
                </>
              ),
            },
            {
              id: "tab-settings",
              label: "Settings",
              content: (
                <>
                  <h3>Settings</h3>
                  <p className="l-ui-utility--mt-md">
                    Tabs adapt to light and dark themes automatically via design tokens.
                    The active tab indicator uses the accent colour for clear visual distinction.
                  </p>
                </>
              ),
            },
          ]}
        />
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-tabs-example" heading="Tabs example">
          <code className="l-ui-surface">{`<Tabs
  items={[
    {
      id: "tab-1",
      label: "Tab 1",
      content: <p>Content 1</p>,
    },
    {
      id: "tab-2",
      label: "Tab 2",
      content: <p>Content 2</p>,
    },
  ]}
/>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">CSS classes</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Tab CSS classes</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Class</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-tabs__list</code></th>
              <td className="l-ui-table__cell">Container for tab buttons (use with role="tablist")</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-tabs__tab</code></th>
              <td className="l-ui-table__cell">Inactive tab button</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-tabs__tab--active</code></th>
              <td className="l-ui-table__cell">Active tab button with underline indicator</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-tabs__panel</code></th>
              <td className="l-ui-table__cell">Tab panel content area</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
