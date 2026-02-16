module Layered
  module Ui
    module AuthenticationHelper
      def l_ui_devise_installed?
        defined?(Devise)
      end

      def l_ui_current_user
        method = Layered::Ui.current_user_method
        send(method) if respond_to?(method, true)
      end

      def l_ui_user_signed_in?
        l_ui_current_user.present?
      end
    end
  end
end
