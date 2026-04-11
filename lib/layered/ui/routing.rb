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

      MANAGED_ACTIONS = %i[index new create edit update destroy].freeze

      def l_ui_managed_resources(resource_name, model: nil, only: MANAGED_ACTIONS, **options)
        model_class_name = model || resource_name.to_s.classify
        route_key = resource_name.to_s
        singular_key = resource_name.to_s.singularize

        # Build a scoped registry key so the same resource name under different
        # scopes (e.g. /admin/posts vs /posts) gets its own registry entry.
        prefix = @scope[:path].to_s.delete_prefix("/").tr("/", "_").presence
        scoped_key = [prefix, route_key].compact.join("_")
        scoped_singular = [prefix, singular_key].compact.join("_")

        Layered::Ui::Routing.register(scoped_key, model_class_name)

        controller = "layered/ui/managed_resource"
        options = options.except(:defaults, :only)
        actions = Array(only).map(&:to_sym)

        route_defaults = (options[:defaults] || {}).merge(
          _managed_route_key: scoped_key,
          _managed_actions: actions.join(",")
        )

        # Collection routes (plural)
        if actions.include?(:index)
          get route_key, to: "#{controller}#index",
                         as: :"managed_#{scoped_key}",
                         defaults: route_defaults, **options
        end

        if actions.include?(:new)
          get "#{route_key}/new", to: "#{controller}#new",
                                 as: :"new_managed_#{scoped_singular}",
                                 defaults: route_defaults, **options
        end

        if actions.include?(:create)
          post route_key, to: "#{controller}#create",
                          as: nil,
                          defaults: route_defaults, **options
        end

        # Member routes (singular, with :id)
        if actions.include?(:edit)
          get "#{route_key}/:id/edit", to: "#{controller}#edit",
                                       as: :"edit_managed_#{scoped_singular}",
                                       defaults: route_defaults, **options
        end

        # PATCH and DELETE share the same member path; only the first gets
        # the named route helper to avoid duplicate route name errors.
        member_named = false
        if actions.include?(:update)
          patch "#{route_key}/:id", to: "#{controller}#update",
                                    as: :"managed_#{scoped_singular}",
                                    defaults: route_defaults, **options
          member_named = true
        end

        if actions.include?(:destroy)
          destroy_opts = { to: "#{controller}#destroy", defaults: route_defaults, **options }
          destroy_opts[:as] = :"managed_#{scoped_singular}" unless member_named
          delete "#{route_key}/:id", **destroy_opts
        end
      end
    end
  end
end
