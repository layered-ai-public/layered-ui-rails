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

        @columns = normalise_columns(@model.l_ui_managed_columns)
        @managed_route_key = route_key
        @managed_url_helper = :"managed_#{route_key}_path"

        if defined?(Ransack) && @model.l_ui_managed_search_fields.any?
          @q = @model.ransack(params[:q])
          scope = @q.result(distinct: true)
          if @q.sorts.empty?
            ds = @model.l_ui_managed_default_sort
            scope = scope.order(ds[:attribute] => ds[:direction])
          end
        else
          @q = nil
          ds = @model.l_ui_managed_default_sort
          scope = @model.order(ds[:attribute] => ds[:direction])
        end

        if defined?(Pagy)
          @pagy, @records = pagy(scope, limit: @model.l_ui_managed_per_page)
        else
          @records = scope.limit(@model.l_ui_managed_per_page).to_a
          @pagy = nil
          @l_ui_managed_truncated = (@records.size == @model.l_ui_managed_per_page)
        end
      end

      private

      def l_ui_managed_authenticate
        method = Layered::Ui.l_ui_managed_before_action
        send(method) if method
      end

      def default_url_options
        main_app.default_url_options
      end

      def normalise_columns(columns)
        has_primary = columns.any? { |c| c[:primary] }
        columns.each_with_index.map do |col, i|
          {
            attribute: col[:attribute],
            label: col[:label] || col[:attribute].to_s.gsub("_", " ").sub(/\A\w/, &:upcase),
            sortable: col.fetch(:sortable, true),
            primary: has_primary ? col.fetch(:primary, false) : i == 0
          }
        end
      end
    end
  end
end
