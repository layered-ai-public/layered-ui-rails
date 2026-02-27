import { PageHeader } from "../components/PageHeader"

export default function LayoutMetadata() {
  return (
    <>
      <PageHeader
        title="Metadata"
        description="Set instance variables in your controller or view to populate the page's <title> and <meta> tags."
      />

      <h2 className="l-ui-utility--mt-2xl">Page title</h2>

      <p className="l-ui-utility--mt-md">Set the <code>@page_title</code> instance variable to populate the <code>&lt;title&gt;</code> tag.</p>

      <pre className="l-ui-surface l-ui-utility--mt-xl"><code>{`# In your controller
def show
  @page_title = "Dashboard"
end

# Or in your view
<% @page_title = "Dashboard" %>`}</code></pre>

      <h2 className="l-ui-utility--mt-2xl">Page description</h2>

      <p className="l-ui-utility--mt-md">Set the <code>@page_description</code> instance variable to populate the <code>&lt;meta name="description"&gt;</code> tag.</p>

      <pre className="l-ui-surface l-ui-utility--mt-xl"><code>{`# In your controller
def show
  @page_description = "View project details and activity"
end

# Or in your view
<% @page_description = "View project details and activity" %>`}</code></pre>
    </>
  )
}
