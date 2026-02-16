require "test_helper"
require "rails/generators/test_case"
require "generators/layered/ui/import_css_generator"

class ImportCssGeneratorTest < Rails::Generators::TestCase
  tests Layered::Ui::Generators::ImportCssGenerator
  destination Rails.root.join("tmp/generators")
  setup :prepare_destination

  test "adds import after tailwindcss" do
    FileUtils.mkdir_p File.join(destination_root, "app/assets/tailwind")
    File.write File.join(destination_root, "app/assets/tailwind/application.css"), '@import "tailwindcss";'

    Dir.chdir(destination_root) { run_generator }

    assert_file "app/assets/tailwind/application.css" do |content|
      assert_match '@import "tailwindcss";', content
      assert_match '@import "./layered_ui";', content
    end
  end

  test "does not duplicate existing import" do
    FileUtils.mkdir_p File.join(destination_root, "app/assets/tailwind")
    File.write File.join(destination_root, "app/assets/tailwind/application.css"),
      %(@import "tailwindcss";\n@import "./layered_ui";)

    Dir.chdir(destination_root) { run_generator }

    assert_file "app/assets/tailwind/application.css" do |content|
      assert_equal 1, content.scan('@import "./layered_ui";').count
    end
  end
end
