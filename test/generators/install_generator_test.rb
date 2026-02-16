require "test_helper"
require "rails/generators/test_case"
require "generators/layered/ui/install_generator"

class InstallGeneratorTest < Rails::Generators::TestCase
  tests Layered::Ui::Generators::InstallGenerator
  destination Rails.root.join("tmp/generators")
  setup :prepare_destination

  test "runs all sub-generators" do
    FileUtils.mkdir_p File.join(destination_root, "app/assets/tailwind")
    FileUtils.mkdir_p File.join(destination_root, "app/javascript")
    File.write File.join(destination_root, "app/assets/tailwind/application.css"), '@import "tailwindcss";'
    File.write File.join(destination_root, "app/javascript/application.js"), 'import "@hotwired/turbo-rails"'

    Dir.chdir(destination_root) { run_generator }

    assert_file "app/assets/tailwind/layered_ui.css"
    assert_file "app/assets/tailwind/application.css", /@import "\.\/layered_ui"/
    assert_file "app/javascript/application.js", /import "layered_ui"/
  end
end
