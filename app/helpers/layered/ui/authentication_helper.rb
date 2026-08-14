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

      def l_ui_new_registration_path
        l_ui_devise_path(:new, :registration)
      end

      def l_ui_new_session_path
        l_ui_devise_path(:new, :session)
      end

      def l_ui_destroy_session_path
        l_ui_devise_path(:destroy, :session)
      end

      private

      def l_ui_devise_path(prefix, resource)
        method = :"#{prefix}_#{Layered::Ui.devise_scope}_#{resource}_path"
        main_app.public_send(method) if main_app.respond_to?(method)
      end
    end
  end
end
