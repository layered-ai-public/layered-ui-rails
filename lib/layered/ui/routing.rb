require "concurrent/map"

module Layered
  module Ui
    module Routing
      # Registry lives here (in lib/, not autoloaded) so it survives code
      # reloads in development.
      @registry = Concurrent::Map.new

      class << self
        def register(route_key, model_class_name)
          @registry[route_key.to_s] = model_class_name.to_s
        end

        def lookup(route_key)
          @registry[route_key.to_s]
        end
      end

      def l_ui_managed_resources(resource_name, model: nil, **options)
        model_class_name = model || resource_name.to_s.classify
        route_key = resource_name.to_s

        Layered::Ui::Routing.register(route_key, model_class_name)

        route_name = :"managed_#{route_key}"

        route_defaults = (options[:defaults] || {}).merge(_managed_route_key: route_key)
        options = options.except(:defaults)

        get route_key, to: "layered/ui/managed_resource#index",
                        as: route_name,
                        defaults: route_defaults,
                        **options
      end
    end
  end
end
