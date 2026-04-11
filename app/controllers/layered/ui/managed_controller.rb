module Layered
  module Ui
    class ManagedController < ::ApplicationController
      helper Rails.application.routes.url_helpers

      def index
        route_key = params.delete(:_managed_route_key)
        model_name = Layered::Ui::Managed.lookup(route_key)
        raise "No managed model registered for '#{route_key}'" unless model_name

        @model = model_name.constantize
        unless @model.respond_to?(:l_ui_managed_columns)
          raise "#{@model.name} must `include Layered::Ui::Managed`"
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

      # Routes are defined in the host app, not the engine, so route helpers
      # and url_for must resolve against the main app's route set.
      def url_for(options = nil)
        main_app.url_for(options)
      end
      helper_method :url_for

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
