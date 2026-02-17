require "test_helper"
require "rails/generators/test_case"
require "generators/layered/ui/create_overrides_generator"

class CreateOverridesGeneratorTest < Rails::Generators::TestCase
  tests Layered::Ui::Generators::CreateOverridesGenerator
  destination Rails.root.join("tmp/generators")
  setup :prepare_destination

  test "creates overrides file" do
    run_generator
    assert_file "app/assets/tailwind/layered_ui_overrides.css" do |content|
      assert_match "--accent", content
      assert_match "Tier 1", content
      assert_match "Tier 2", content
    end
  end

  test "skips if overrides file already exists" do
    FileUtils.mkdir_p File.join(destination_root, "app/assets/tailwind")
    File.write File.join(destination_root, "app/assets/tailwind/layered_ui_overrides.css"), "/* existing */"

    output = Dir.chdir(destination_root) { run_generator }
    assert_match(/already exists/, output)
    assert_file "app/assets/tailwind/layered_ui_overrides.css", /existing/
  end
end
