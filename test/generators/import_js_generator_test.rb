require "test_helper"
require "rails/generators/test_case"
require "generators/layered/ui/import_js_generator"

class ImportJsGeneratorTest < Rails::Generators::TestCase
  tests Layered::Ui::Generators::ImportJsGenerator
  destination Rails.root.join("tmp/generators")
  setup :prepare_destination

  test "adds import after turbo-rails" do
    FileUtils.mkdir_p File.join(destination_root, "app/javascript")
    File.write File.join(destination_root, "app/javascript/application.js"),
      'import "@hotwired/turbo-rails"'

    Dir.chdir(destination_root) { run_generator }

    assert_file "app/javascript/application.js" do |content|
      assert_match 'import "@hotwired/turbo-rails"', content
      assert_match 'import "layered_ui"', content
    end
  end

  test "does not duplicate existing import" do
    FileUtils.mkdir_p File.join(destination_root, "app/javascript")
    File.write File.join(destination_root, "app/javascript/application.js"),
      %(import "@hotwired/turbo-rails"\nimport "layered_ui")

    Dir.chdir(destination_root) { run_generator }

    assert_file "app/javascript/application.js" do |content|
      assert_equal 1, content.scan('import "layered_ui"').count
    end
  end
end
