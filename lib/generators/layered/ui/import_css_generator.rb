module Layered
  module Ui
    module Generators
      class ImportCssGenerator < Rails::Generators::Base
        desc "Add layered-ui-rails CSS import to the host application"

        def add_css_import
          application_css = "app/assets/tailwind/application.css"

          return unless File.exist?(application_css)

          content = File.read(application_css)
          import_line = '@import "../builds/tailwind/layered_ui";'
          overrides_line = '@import "./layered_ui_overrides";'

          unless content.include?(import_line)
            if content.include?('@import "tailwindcss"')
              inject_into_file application_css, "\n#{import_line}", after: '@import "tailwindcss";'
              say "Added import to #{application_css}", :green
            else
              append_to_file application_css, "\n#{import_line}\n"
              say "Appended import to #{application_css}", :green
            end
          end

          # Re-read in case we just modified it
          content = File.read(application_css)

          unless content.include?(overrides_line)
            inject_into_file application_css, "\n#{overrides_line}", after: import_line
            say "Added overrides import to #{application_css}", :green
          end
        end
      end
    end
  end
end
