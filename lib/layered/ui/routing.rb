module Layered
  module Ui
    module Routing
      def l_ui_managed_resources(resource_name, model: nil, **options)
        model_class_name = model || resource_name.to_s.classify
        route_key = resource_name.to_s

        # Resolve the full path including any parent scope (e.g. "/admin/posts").
        prefix = @scope[:path] ? @scope[:path].to_s.delete_prefix("/") : ""
        full_path = [prefix, route_key].reject(&:empty?).join("/")

        Layered::Ui::Managed.register(route_key, model_class_name, path: full_path)

        get route_key, to: "layered/ui/managed#index",
                        as: :"managed_#{route_key}",
                        **options
      end
    end
  end
end
