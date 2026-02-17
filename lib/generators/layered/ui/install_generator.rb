module Layered
  module Ui
    module Generators
      class InstallGenerator < Rails::Generators::Base
        desc "Install layered-ui-rails into the host application"

        def check_dependencies
          unless Gem.loaded_specs.key?("tailwindcss-rails")
            say ""
            say "layered-ui-rails", :green
            say "The `tailwindcss-rails` gem is required but not installed.", :red
            say "Please add it to your Gemfile and run `bundle install` before running this generator."
            say ""
            raise SystemExit
          end
        end

        def copy_assets
          invoke "layered:ui:copy_assets"
        end

        def create_overrides
          invoke "layered:ui:create_overrides"
        end

        def import_css
          invoke "layered:ui:import_css"
        end

        def import_js
          invoke "layered:ui:import_js"
        end

        def show_instructions
          say ""
          say "layered-ui-rails installed successfully", :green
          say ""
        end
      end
    end
  end
end
