module Layered
  module Ui
    module Managed
      extend ActiveSupport::Concern

      @registry = {}
      @path_index = {}

      class << self
        def register(route_key, model_class_name, path:)
          entry = { model: model_class_name.to_s, path: path.to_s, route_key: route_key.to_s }
          @registry[route_key.to_s] = entry
          @path_index[path.to_s] = entry
        end

        def lookup(route_key)
          @registry[route_key.to_s]
        end

        def lookup_by_path(path)
          normalised = path.to_s.delete_prefix("/").chomp("/")
          @path_index[normalised]
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
          25
        end
      end
    end
  end
end
