require "securerandom"

module Layered
  module Ui
    module NavigationHelper
      def l_ui_navigation_item(label, path, active: nil, match: :exact, icon: nil, icon_path: nil, icon_html: nil)
        is_active = active.nil? ? l_ui_navigation_item_self_active?(path, match) : active

        css_class = is_active ? "l-ui-navigation__item l-ui-navigation__item--active" : "l-ui-navigation__item"
        options = { class: css_class }
        options["aria-current"] = "page" if current_page?(path)

        l_ui_navigation_register_active if is_active

        link_content = l_ui_navigation_item_inner(label, icon, icon_path, icon_html)

        content_tag(:li) { link_to(link_content, path, options) }
      end

      def l_ui_navigation_section(heading = nil, icon: nil, icon_path: nil, icon_html: nil, collapsible: false, expanded: true, storage_key: nil, separated: false, &block)
        stack = (Thread.current[:l_ui_navigation_section_stack] ||= [])
        frame = { active: false }
        stack.push(frame)
        begin
          children = block_given? ? capture(&block) : "".html_safe
        ensure
          stack.pop
        end

        has_active_descendant = frame[:active]

        if (parent = stack.last) && has_active_descendant
          parent[:active] = true
        end

        is_open = has_active_descendant || expanded
        is_collapsible = collapsible && heading.present?
        panel_id = is_collapsible ? "l-ui-navigation-section-#{SecureRandom.hex(4)}" : nil

        section_classes = ["l-ui-navigation__section"]
        section_classes << "l-ui-navigation__section--has-heading" if heading.present?
        section_classes << "l-ui-navigation__section--collapsible" if is_collapsible
        section_classes << "l-ui-navigation__section--separated" if separated

        data = {}
        if is_collapsible
          data["controller"] = "l-ui--navigation-section"
          data["l-ui--navigation-section-storage-key-value"] = storage_key.to_s if storage_key.present?
          data["l-ui--navigation-section-force-open-value"] = "true" if has_active_descendant
        end

        content_tag(:li, class: section_classes.join(" "), data: data) do
          parts = []

          if heading.present?
            heading_inner = l_ui_navigation_item_inner(heading, icon, icon_path, icon_html)

            if is_collapsible
              chevron = content_tag(:span, "", class: "l-ui-navigation__section-chevron", "aria-hidden": "true")
              parts << content_tag(:button,
                heading_inner + chevron,
                type: "button",
                class: "l-ui-navigation__section-toggle",
                "aria-expanded": is_open.to_s,
                "aria-controls": panel_id,
                data: { "l-ui--navigation-section-target": "toggle", action: "click->l-ui--navigation-section#toggle" }
              )
            else
              parts << content_tag(:div, heading_inner, class: "l-ui-navigation__section-heading")
            end
          end

          panel_attrs = { class: "l-ui-navigation__section-items", role: "list" }
          if is_collapsible
            panel_attrs[:id] = panel_id
            panel_attrs[:data] = { "l-ui--navigation-section-target": "panel" }
            panel_attrs[:hidden] = true unless is_open
          end
          parts << content_tag(:ul, children, **panel_attrs)

          safe_join(parts)
        end
      end

      private

      def l_ui_navigation_register_active
        stack = Thread.current[:l_ui_navigation_section_stack]
        return unless stack
        stack.each { |frame| frame[:active] = true }
      end

      def l_ui_navigation_item_self_active?(path, match)
        case match
        when :starts_with
          normalized = path.to_s.chomp("/")
          return current_page?(path) if normalized.empty?
          request.path == path || request.path.start_with?("#{normalized}/")
        else
          current_page?(path)
        end
      end

      def l_ui_navigation_item_inner(label, icon, icon_path, icon_html)
        parts = []

        if icon_html.present?
          parts << content_tag(:span, icon_html, class: "l-ui-navigation__item-icon-slot", aria: { hidden: true })
        else
          resolved_icon_path =
            if icon_path.present?
              icon_path
            elsif icon.present?
              "layered_ui/icon_#{icon}.svg"
            end

          if resolved_icon_path
            parts << image_tag(resolved_icon_path, alt: "", class: "l-ui-navigation__item-icon", aria: { hidden: true })
          end
        end

        parts << content_tag(:span, label, class: "l-ui-navigation__item-label")

        safe_join(parts)
      end
    end
  end
end
