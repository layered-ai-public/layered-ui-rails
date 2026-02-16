module Layered
  module Ui
    module NavigationHelper
      def l_ui_navigation_item(label, path, active: nil, &block)
        if block_given?
          children = capture(&block)
          is_active = active.nil? ? (current_page?(path) || children.include?("l-ui-navigation__item--active")) : active
          css_class = is_active ? "l-ui-navigation__item--active" : "l-ui-navigation__item"
          options = { class: css_class }
          options["aria-current"] = "page" if is_active && current_page?(path)
          content_tag(:li) do
            link_to(label, path, options) +
              content_tag(:ul, children, class: "l-ui-navigation__secondary", role: "list")
          end
        else
          is_active = active.nil? ? current_page?(path) : active
          css_class = is_active ? "l-ui-navigation__item--active" : "l-ui-navigation__item"
          options = { class: css_class }
          options["aria-current"] = "page" if is_active
          content_tag(:li) { link_to label, path, options }
        end
      end
    end
  end
end
