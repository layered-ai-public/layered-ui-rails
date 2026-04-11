module Layered
  module Ui
    class ManagedResourceController < ::ApplicationController
      helper Rails.application.routes.url_helpers

      before_action :l_ui_managed_authenticate
      before_action :resolve_managed_resource
      before_action :require_managed_fields, only: %i[new create edit update]

      def index
        @q = @model.l_ui_managed_scope(self).ransack(params[:q])
        scope = @q.result(distinct: true)
        if @q.sorts.empty?
          ds = @model.l_ui_managed_default_sort
          scope = scope.order(ds[:attribute] => ds[:direction])
        end

        @pagy, @records = pagy(scope, limit: @model.l_ui_managed_per_page)
      end

      def new
        @record = @model.l_ui_managed_build_record(self)
        @form_url = managed_collection_path
      end

      def create
        @record = @model.l_ui_managed_build_record(self)
        @record.assign_attributes(managed_resource_params)

        if @record.save
          redirect_to @model.l_ui_managed_after_save_path(self, @record),
                      notice: "#{@model.model_name.human} created"
        else
          @form_url = managed_collection_path
          render :new, status: :unprocessable_entity
        end
      end

      def edit
        @record = @model.l_ui_managed_scope(self).find(params[:id])
        @form_url = managed_member_path(@record)
      end

      def update
        @record = @model.l_ui_managed_scope(self).find(params[:id])
        if @record.update(managed_resource_params)
          redirect_to @model.l_ui_managed_after_save_path(self, @record),
                      notice: "#{@model.model_name.human} updated"
        else
          @form_url = managed_member_path(@record)
          render :edit, status: :unprocessable_entity
        end
      end

      def destroy
        @record = @model.l_ui_managed_scope(self).find(params[:id])
        if @record.destroy
          redirect_to managed_collection_path,
                      notice: "#{@model.model_name.human} deleted"
        else
          redirect_to managed_collection_path,
                      alert: "#{@model.model_name.human} could not be deleted"
        end
      end

      attr_reader :managed_route_key

      private

      def resolve_managed_resource
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
        @fields = @model.l_ui_managed_fields
        @crud_enabled = @fields.any?

        managed_actions = Layered::Ui::Routing.lookup_actions(@managed_route_key)
        @can_create = @crud_enabled && managed_actions.include?(:new)
        @can_update = @crud_enabled && managed_actions.include?(:edit)
        @can_destroy = @crud_enabled && managed_actions.include?(:destroy)
      end

      def require_managed_fields
        return if @crud_enabled

        raise ActionController::RoutingError,
              "Define l_ui_managed_fields on #{@model.name} to enable CRUD actions"
      end

      def managed_resource_params
        params.require(@model.model_name.param_key)
              .permit(*@model.l_ui_managed_permitted_params)
      end

      def managed_collection_path
        unless respond_to?(@managed_url_helper, true)
          raise ActionController::RoutingError,
                "No collection route registered for #{@managed_route_key}. " \
                "Include :index in the only: list, or override l_ui_managed_after_save_path."
        end
        send(@managed_url_helper)
      end

      def managed_member_path(record)
        singular = @managed_route_key.singularize
        helper = :"managed_#{singular}_path"
        unless respond_to?(helper, true)
          raise ActionController::RoutingError,
                "No member route registered for #{@managed_route_key}. " \
                "Include :update or :destroy in the only: list."
        end
        send(helper, record)
      end

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
