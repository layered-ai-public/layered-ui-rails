module Layered
  module Ui
    module Generators
      class ImportJsGenerator < Rails::Generators::Base
        desc "Add layered-ui JavaScript import to the host application"

        def add_js_import
          application_js = "app/javascript/application.js"

          return unless File.exist?(application_js)

          content = File.read(application_js)
          import_line = 'import "layered_ui"'

          return if content.include?(import_line)

          if content.include?('import "@hotwired/turbo-rails"')
            inject_into_file application_js, "\n#{import_line}", after: 'import "@hotwired/turbo-rails"'
            say "Added import to #{application_js}", :green
          else
            append_to_file application_js, "\n#{import_line}\n"
            say "Appended import to #{application_js}", :green
          end
        end
      end
    end
  end
end
