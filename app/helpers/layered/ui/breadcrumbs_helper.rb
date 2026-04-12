module Layered
  module Ui
    module BreadcrumbsHelper
      def l_ui_breadcrumbs(&block)
        items = capture(&block)
        content_tag(:nav, aria: { label: "Breadcrumb" }, class: "l-ui-breadcrumbs") do
          content_tag(:ol, items, class: "l-ui-breadcrumbs__list", role: "list")
        end
      end

      def l_ui_breadcrumb_item(label, path)
        content_tag(:li, class: "l-ui-breadcrumbs__item") do
          link_to(label, path, class: "l-ui-breadcrumbs__link")
        end
      end
    end
  end
end
