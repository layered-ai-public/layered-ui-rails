module Layered
  module Ui
    module ManagedResource
      extend ActiveSupport::Concern

      class << self
        def lookup(route_key)
          Layered::Ui::Routing.lookup(route_key)
        end
      end

      class_methods do
        def l_ui_managed_columns
          [{ attribute: :id }]
        end

        def l_ui_managed_search_fields
          []
        end

        def l_ui_managed_default_sort
          { attribute: :id, direction: :desc }
        end

        def l_ui_managed_per_page
          20
        end

        def ransackable_attributes(_auth_object = nil)
          attrs = l_ui_managed_columns.map { |c| c[:attribute].to_s }
          attrs |= l_ui_managed_search_fields.map(&:to_s)
          attrs
        end

        def ransackable_associations(_auth_object = nil)
          []
        end
      end
    end
  end
end
