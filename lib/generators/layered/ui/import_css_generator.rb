module Layered
  module Ui
    module Generators
      class ImportCssGenerator < Rails::Generators::Base
        desc "Add layered-ui CSS import to the host application"

        def add_css_import
          application_css = "app/assets/tailwind/application.css"

          return unless File.exist?(application_css)

          content = File.read(application_css)
          import_line = '@import "./layered_ui";'

          return if content.include?(import_line)

          # Insert after the first @import "tailwindcss" line
          if content.include?('@import "tailwindcss"')
            inject_into_file application_css, "\n#{import_line}", after: '@import "tailwindcss";'
            say "Added import to #{application_css}", :green
          else
            append_to_file application_css, "\n#{import_line}\n"
            say "Appended import to #{application_css}", :green
          end
        end
      end
    end
  end
end
