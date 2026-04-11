module Layered
  module Ui
    class ManagedResourceController < ::ApplicationController
      helper Rails.application.routes.url_helpers

      before_action :l_ui_managed_authenticate

      def index
        route_key = params[:_managed_route_key]
        model_name = Layered::Ui::Routing.lookup(route_key)
        raise ActionController::RoutingError, "No managed resource registered for route" unless model_name

        @model = model_name.safe_constantize
        unless @model && @model < ActiveRecord::Base && @model.respond_to?(:l_ui_managed_columns)
          raise ActionController::RoutingError, "Model is not a managed resource"
        end

        @columns = @model.l_ui_managed_columns
        @managed_route_key = route_key
        @managed_url_helper = :"managed_#{route_key}_path"

        @q = @model.ransack(params[:q])
        scope = @q.result(distinct: true)
        if @q.sorts.empty?
          ds = @model.l_ui_managed_default_sort
          scope = scope.order(ds[:attribute] => ds[:direction])
        end

        @pagy, @records = pagy(scope, limit: @model.l_ui_managed_per_page)
      end

      private

      def l_ui_managed_authenticate
        method = Layered::Ui.l_ui_managed_before_action
        send(method) if method
      end

      def default_url_options
        main_app.default_url_options
      end
    end
  end
end
