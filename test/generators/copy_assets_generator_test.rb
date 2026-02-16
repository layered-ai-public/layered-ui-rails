require "test_helper"
require "rails/generators/test_case"
require "generators/layered/ui/copy_assets_generator"

class CopyAssetsGeneratorTest < Rails::Generators::TestCase
  tests Layered::Ui::Generators::CopyAssetsGenerator
  destination Rails.root.join("tmp/generators")
  setup :prepare_destination

  test "creates CSS file with version header" do
    run_generator
    assert_file "app/assets/tailwind/layered_ui.css" do |content|
      assert_match "layered-ui-rails v#{Layered::Ui::VERSION}", content
      assert_match "automatically generated", content
    end
  end

  test "CSS file includes design tokens" do
    run_generator
    assert_file "app/assets/tailwind/layered_ui.css" do |content|
      assert_match "--background", content
      assert_match "--foreground", content
    end
  end
end
