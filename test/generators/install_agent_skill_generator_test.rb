require "test_helper"
require "rails/generators/test_case"
require "generators/layered/ui/install_agent_skill_generator"

class InstallAgentSkillGeneratorTest < Rails::Generators::TestCase
  tests Layered::Ui::Generators::InstallAgentSkillGenerator
  destination Rails.root.join("tmp/generators")
  setup :prepare_destination

  test "copies SKILL.md" do
    run_generator
    assert_file ".claude/skills/layered-ui-rails/SKILL.md" do |content|
      assert_match "name: layered-ui-rails", content
      assert_match "description:", content
    end
  end

  test "copies reference files" do
    run_generator
    assert_file ".claude/skills/layered-ui-rails/references/HELPERS.md"
    assert_file ".claude/skills/layered-ui-rails/references/CSS.md"
    assert_file ".claude/skills/layered-ui-rails/references/CONTROLLERS.md"
  end
end
