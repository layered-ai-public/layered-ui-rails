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
      #   t.popover(id: nil, placement: :bottom, align: :start, open: false, &block)
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
          container_data[:"l-ui--popover-open-value"] = true if builder.popover_open
          container_attrs[:data] = container_data
        end

        tag.div(**container_attrs) do
          parts = builder.segments.map { |segment| l_ui_tag_segment(builder, segment) }
          parts << l_ui_tag_popover(builder) if builder.popover?
          safe_join(parts)
        end
      end

      class TagBuilder
        attr_reader :segments, :popover_id, :popover_placement, :popover_align, :popover_open, :popover_body

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
          content = block ? @view.capture(&block) : nil
          @segments << { kind: :button, content: content, options: options }
          nil
        end

        def link(url, **options, &block)
          content = block ? @view.capture(&block) : nil
          @segments << { kind: :link, url: url, content: content, options: options }
          nil
        end

        def remove(url = nil, **options, &block)
          content = block ? @view.capture(&block) : nil
          @segments << { kind: :remove, url: url, content: content, options: options }
          nil
        end

        def popover(id: nil, placement: :bottom, align: :start, open: false, &block)
          @popover_id = id || "l-ui-tag-popover-#{SecureRandom.hex(4)}"
          @popover_placement = placement
          @popover_align = align
          @popover_open = open
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
          tag.span(l_ui_tag_label(segment[:content]), **options)
        when :button
          options[:class] = class_names("l-ui-tag__button", options[:class])
          options[:type] ||= "button"
          options[:popovertarget] ||= builder.popover_id if builder.popover?
          tag.button(l_ui_tag_label(segment[:content]), **options)
        when :link
          options[:class] = class_names("l-ui-tag__button", options[:class])
          link_to(l_ui_tag_label(segment[:content]), segment[:url], options)
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

      # Wraps a label segment's content so long labels can truncate with an
      # ellipsis - ellipsis has no effect on text sitting directly inside a
      # flex container like the segment.
      def l_ui_tag_label(content)
        tag.span(content, class: "l-ui-tag__label")
      end

      # Filled x-circle, matching the bundled +icon_close_circle.svg+ asset.
      # Rendered inline (rather than via image_tag) so it inherits the tag's
      # muted +currentColor+; an <img>-loaded SVG cannot.
      def l_ui_tag_remove_icon
        tag.svg(
          tag.path("fill-rule" => "evenodd", "clip-rule" => "evenodd",
            "d" => "M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 0 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"),
          class: "l-ui-icon--sm",
          fill: "currentColor",
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
