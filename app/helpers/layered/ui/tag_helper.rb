module Layered
  module Ui
    module TagHelper
      # Renders an interactive tag - e.g. an email recipient or an active
      # filter. Visually related to +l-ui-badge+, but a distinct control: a
      # badge is a static styled span, while a tag is a container whose
      # segments (label, remove) are separately interactive.
      #
      #   <%= l_ui_tag do |t| %>
      #     <% t.text "alice@example.com" %>
      #     <% t.remove aria: { label: "Remove alice@example.com" } %>
      #   <% end %>
      #
      # A tag may carry a popover. The whole tag becomes the placement target
      # (so the popover aligns with the tag rather than the segment inside
      # it), and button segments open it via +popovertarget+:
      #
      #   <%= l_ui_tag do |t| %>
      #     <% t.button(aria: { label: "Edit status filter" }) do %>
      #       Status: Active
      #     <% end %>
      #     <% t.remove remove_filter_path, aria: { label: "Remove status filter" } %>
      #     <% t.popover do %>
      #       <p>Filter controls.</p>
      #     <% end %>
      #   <% end %>
      #
      # Note: use +<% t.button %>+ (without the equals sign) so segment content
      # is captured by the builder rather than written to the body buffer.
      #
      # Segments render in the order they are declared; the popover element is
      # always appended last. Give icon-only segments (such as +t.remove+) an
      # +aria-label+ so they have an accessible name.
      #
      # Options:
      #   rounded:   (Boolean) Pill shape (matching +l-ui-badge--rounded+); defaults to false for the subtle badge shape.
      #   container: (Hash)    Extra HTML attributes for the wrapping <div>.
      #
      # Builder methods:
      #   t.text(content = nil, **options, &block)  Static label segment (<span>).
      #   t.button(**options, &block)               Button segment; opens the tag's popover when one is declared.
      #   t.link(url, **options, &block)            Link segment, styled like a button segment.
      #   t.remove(url = nil, **options, &block)    Trailing remove segment: a link when +url+ is given, otherwise a
      #                                             button. Renders a ✕ icon unless the block supplies custom content.
      #   t.popover(id: nil, placement: :bottom, align: :start, &block)
      #                                             Attaches a popover to the tag; the block is the popover body.
      #                                             Options match +l_ui_popover+.
      def l_ui_tag(rounded: false, container: {}, &block)
        builder = TagBuilder.new(self)
        capture { block.call(builder) }

        container_attrs = container.deep_dup
        container_attrs[:class] = class_names("l-ui-tag", ("l-ui-tag--rounded" if rounded), container_attrs[:class])

        if builder.popover?
          container_data = container_attrs[:data] || {}
          existing_controller = container_data.delete(:controller) || container_data.delete("controller")
          container_data[:controller] = [existing_controller, "l-ui--popover"].compact.reject(&:empty?).join(" ")
          container_data[:"l-ui--popover-target"] = "trigger"
          container_data[:"l-ui--popover-placement-value"] = builder.popover_placement
          container_data[:"l-ui--popover-align-value"] = builder.popover_align
          container_attrs[:data] = container_data
        end

        tag.div(**container_attrs) do
          parts = builder.segments.map { |segment| l_ui_tag_segment(builder, segment) }
          parts << l_ui_tag_popover(builder) if builder.popover?
          safe_join(parts)
        end
      end

      class TagBuilder
        attr_reader :segments, :popover_id, :popover_placement, :popover_align, :popover_body

        def initialize(view)
          @view = view
          @segments = []
        end

        def text(content = nil, **options, &block)
          content = @view.capture(&block) if block
          @segments << { kind: :text, content: content, options: options }
          nil
        end

        def button(**options, &block)
          @segments << { kind: :button, content: @view.capture(&block), options: options }
          nil
        end

        def link(url, **options, &block)
          @segments << { kind: :link, url: url, content: @view.capture(&block), options: options }
          nil
        end

        def remove(url = nil, **options, &block)
          content = block ? @view.capture(&block) : nil
          @segments << { kind: :remove, url: url, content: content, options: options }
          nil
        end

        def popover(id: nil, placement: :bottom, align: :start, &block)
          @popover_id = id || "l-ui-tag-popover-#{SecureRandom.hex(4)}"
          @popover_placement = placement
          @popover_align = align
          @popover_body = @view.capture(&block)
          nil
        end

        def popover?
          !@popover_id.nil?
        end
      end

      private

      def l_ui_tag_segment(builder, segment)
        options = segment[:options].deep_dup

        case segment[:kind]
        when :text
          options[:class] = class_names("l-ui-tag__text", options[:class])
          tag.span(segment[:content], **options)
        when :button
          options[:class] = class_names("l-ui-tag__button", options[:class])
          options[:type] ||= "button"
          options[:popovertarget] ||= builder.popover_id if builder.popover?
          tag.button(segment[:content], **options)
        when :link
          options[:class] = class_names("l-ui-tag__button", options[:class])
          link_to(segment[:content], segment[:url], options)
        when :remove
          options[:class] = class_names("l-ui-tag__remove", options[:class])
          content = segment[:content] || l_ui_tag_remove_icon
          if segment[:url]
            link_to(content, segment[:url], options)
          else
            options[:type] ||= "button"
            tag.button(content, **options)
          end
        end
      end

      def l_ui_tag_remove_icon
        tag.svg(
          tag.path("stroke-linecap" => "round", "stroke-linejoin" => "round", "d" => "M6 18L18 6M6 6l12 12"),
          class: "l-ui-icon--xs",
          fill: "none",
          stroke: "currentColor",
          "stroke-width" => "2",
          "viewBox" => "0 0 24 24",
          "aria-hidden" => "true"
        )
      end

      def l_ui_tag_popover(builder)
        tag.div(
          builder.popover_body,
          id: builder.popover_id,
          popover: "auto",
          class: "l-ui-popover",
          data: { "l-ui--popover-target" => "popover" }
        )
      end
    end
  end
end
