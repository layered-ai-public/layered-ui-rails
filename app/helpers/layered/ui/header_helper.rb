module Layered
  module Ui
    module HeaderHelper
      def l_ui_theme_toggle
        render "layouts/layered_ui/theme_toggle"
      end

      def l_ui_authentication
        render "layouts/layered_ui/authentication"
      end

      def l_ui_navigation_toggle
        render "layouts/layered_ui/navigation_toggle"
      end
    end
  end
end
