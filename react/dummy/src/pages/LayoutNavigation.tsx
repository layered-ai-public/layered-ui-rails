import { PageHeader } from "../components/PageHeader"

export default function LayoutNavigation() {
  return (
    <>
      <PageHeader
        title="Navigation"
        description="Populate the sidebar navigation using the :l_ui_navigation_items yield and the l_ui_navigation_item helper."
      />

      <p className="l-ui-utility--mt-md">For full control, override the partial by creating <code>app/views/layouts/layered_ui/_navigation.html.erb</code> in your application.</p>

      <code className="l-ui-surface l-ui-utility--mt-lg">{`<% content_for :l_ui_navigation_items do %>
  <%= l_ui_navigation_item "Dashboard", dashboard_path %>
  <%= l_ui_navigation_item "Settings", settings_path %>
  <%= l_ui_navigation_item "Users", users_path %>
<% end %>

<%= render template: "layouts/layered_ui/application" %>`}</code>
    </>
  )
}
