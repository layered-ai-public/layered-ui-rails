module Layered
  module Ui
    module TitleBarHelper
      include Layered::Ui::BreadcrumbsHelper

      def l_ui_title_bar(title:, breadcrumbs: [], actions: nil, &block)
        action_content = block_given? ? capture(&block) : actions

        content_tag(:header, class: "l-ui-title-bar l-ui-container--spread") do
          safe_join([
            content_tag(:div, class: "l-ui-title-bar__content") do
              safe_join([
                l_ui_title_bar_breadcrumbs(breadcrumbs),
                content_tag(:h1, title, class: "l-ui-title-bar__title")
              ].compact)
            end,
            l_ui_title_bar_actions(action_content)
          ].compact)
        end
      end

      private

      def l_ui_title_bar_breadcrumbs(breadcrumbs)
        return if breadcrumbs.blank?

        l_ui_breadcrumbs do
          safe_join(breadcrumbs.map { |breadcrumb| l_ui_title_bar_breadcrumb_item(breadcrumb) })
        end
      end

      def l_ui_title_bar_breadcrumb_item(breadcrumb)
        case breadcrumb
        when Hash
          l_ui_breadcrumb_item(breadcrumb.fetch(:label), breadcrumb[:path])
        when Array
          l_ui_breadcrumb_item(breadcrumb[0], breadcrumb[1])
        else
          l_ui_breadcrumb_item(breadcrumb)
        end
      end

      def l_ui_title_bar_actions(action_content)
        return if action_content.blank?

        content = action_content.is_a?(Array) ? safe_join(action_content) : action_content

        content_tag(:div, content, class: "l-ui-title-bar__actions")
      end
    end
  end
end
