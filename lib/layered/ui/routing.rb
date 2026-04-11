module Layered
  module Ui
    module Routing
      def l_ui_managed_resources(resource_name, model: nil, **options)
        model_class_name = model || resource_name.to_s.classify
        route_key = resource_name.to_s

        Layered::Ui::Managed.register(route_key, model_class_name)

        route_name = :"managed_#{route_key}"

        get route_key, to: "layered/ui/managed#index",
                        as: route_name,
                        defaults: { _managed_route_key: route_key },
                        **options
      end
    end
  end
end
