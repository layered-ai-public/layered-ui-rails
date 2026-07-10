module Layered
  module Ui
    module PopoverHelper
      # Renders a floating panel anchored to a trigger button, built on the
      # native HTML +popover+ attribute. Showing, hiding, light-dismiss, and
      # Escape-to-close are all handled by the browser; the +l-ui--popover+
      # Stimulus controller only computes placement (with auto-flip near
      # viewport edges).
      #
      #   <%= l_ui_popover(placement: :bottom) do |p| %>
      #     <% p.trigger(class: "l-ui-button l-ui-button--outline") do %>
      #       Options
      #     <% end %>
      #     <p>Popover content.</p>
      #   <% end %>
      #
      # Note: use +<% p.trigger %>+ (without the equals sign) so its content is
      # captured by the builder rather than written to the body buffer.
      #
      # Options:
      #   id:         (String)  DOM id for the popover element; defaults to an auto-generated id.
      #   placement:  (Symbol)  :top, :bottom (default), :left, or :right. Flips automatically if it would overflow the viewport.
      #   align:      (Symbol)  :start (default) flushes the popover's leading edge with the trigger's; :end flushes its trailing edge instead
      #                         (e.g. placement: :bottom, align: :end hangs the popover down and to the left of a trigger at the right end of a row).
      #   open:       (Boolean) When true, the popover opens as soon as its Stimulus controller connects - shown and positioned in the same
      #                         task, so it never paints unpositioned. Useful for re-opening a popover after a form submission re-renders
      #                         the page. Defaults to false.
      #   container:  (Hash)    Extra HTML attributes for the wrapping <div>.
      def l_ui_popover(id: nil, placement: :bottom, align: :start, open: false, container: {}, &block)
        id ||= "l-ui-popover-#{SecureRandom.hex(4)}"
        builder = PopoverBuilder.new(self, id: id)
        body_content = capture { block.call(builder) }

        container_attrs = container.deep_dup
        container_data = container_attrs[:data] || {}
        existing_controller = container_data.delete(:controller) || container_data.delete("controller")
        container_data[:controller] = [existing_controller, "l-ui--popover"].compact.reject(&:empty?).join(" ")
        container_data[:"l-ui--popover-placement-value"] = placement
        container_data[:"l-ui--popover-align-value"] = align
        container_data[:"l-ui--popover-open-value"] = true if open
        container_attrs[:data] = container_data

        tag.div(**container_attrs) do
          safe_join([
            builder.trigger_html || ActiveSupport::SafeBuffer.new,
            render_popover(builder, body_content)
          ])
        end
      end

      class PopoverBuilder
        attr_reader :id, :trigger_html

        def initialize(view, id:)
          @view = view
          @id = id
        end

        def trigger(**options, &block)
          options = options.deep_dup
          options[:type] ||= "button"
          options[:popovertarget] = id
          data = options[:data] || {}
          data[:"l-ui--popover-target"] = "trigger"
          options[:data] = data
          content = @view.capture(&block)
          @trigger_html = @view.tag.button(content, **options)
          nil
        end
      end

      private

      def render_popover(builder, body_content)
        tag.div(
          body_content,
          id: builder.id,
          popover: "auto",
          class: "l-ui-popover",
          data: { "l-ui--popover-target" => "popover" }
        )
      end
    end
  end
end
