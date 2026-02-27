import { PageHeader } from "../components/PageHeader"

export default function LayoutPanel() {
  return (
    <>
      <PageHeader
        title="Panel"
        description="The slide-out panel is only rendered when the :l_ui_panel_body content block is present. Click the panel button in the bottom-right corner to see it in action, or use Cmd+I / Ctrl+I to toggle it."
      />

      <h2 className="l-ui-utility--mt-lg">Draggable button</h2>

      <p className="l-ui-utility--mt-md">The panel toggle button can be repositioned by dragging it with a mouse or touch. You can also double-click it to cycle through corners. The position is saved to <code>localStorage</code> and restored across sessions.</p>

      <p className="l-ui-utility--mt-md">You can also snap the button to corners with keyboard shortcuts: <kbd>Ctrl/Cmd + Alt + 1</kbd> (top-left), <kbd>Ctrl/Cmd + Alt + 2</kbd> (top-right), <kbd>Ctrl/Cmd + Alt + 3</kbd> (bottom-left), <kbd>Ctrl/Cmd + Alt + 4</kbd> (bottom-right).</p>

      <p className="l-ui-utility--mt-md">A short tap (under 5px of movement) toggles the panel as normal. The panel itself can always be toggled with <kbd>Cmd+I</kbd> / <kbd>Ctrl+I</kbd>.</p>

      <p className="l-ui-utility--mt-md">For full control, override the partial by creating <code>app/views/layouts/layered_ui/_panel.html.erb</code> in your application.</p>

      <code className="l-ui-surface l-ui-utility--mt-lg">{`<% content_for :l_ui_panel_heading do %>
  <h2>Side Bar</h2>
<% end %>

<% content_for :l_ui_panel_body do %>
  <p>This is the panel body content.</p>
<% end %>`}</code>
    </>
  )
}
