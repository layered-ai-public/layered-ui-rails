module Layered
  module Ui
    module PagyHelper
      def l_ui_pagy(pagy)
        unless defined?(Pagy)
          return tag.p("Pagination requires the pagy gem. Add `gem \"pagy\"` to your Gemfile.", class: "l-ui-notice--warning") if Rails.env.development?

          return
        end

        return unless pagy.pages > 1

        tag.div(pagy.series_nav.html_safe, class: "l-ui-container--pagy l-ui-utility--mt-lg")
      end
    end
  end
end
