module Layered
  module Ui
    class ManagedResourceController < ::ApplicationController
      helper Rails.application.routes.url_helpers

      def index
        route_key = params[:_managed_route_key]
        model_name = Layered::Ui::Routing.lookup(route_key)
        raise ActionController::RoutingError, "No managed resource registered for route" unless model_name

        @model = model_name.constantize
        unless @model.respond_to?(:l_ui_managed_columns)
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
          @records = scope.limit(@model.l_ui_managed_per_page)
          @pagy = nil
        end
      end

      private

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
