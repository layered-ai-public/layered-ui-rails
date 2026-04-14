module Layered
  module Ui
    module Generators
      class InstallAgentSkillGenerator < Rails::Generators::Base
        desc "Copy the layered-ui-rails agent skill into the host application"

        def self.source_root
          Layered::Ui::Engine.root
        end

        def copy_skill
          skill_source = File.join(self.class.source_root, ".claude/skills/layered-ui-rails")
          skill_dest = ".claude/skills/layered-ui-rails"

          directory skill_source, skill_dest
        end

        def show_instructions
          say ""
          say "Agent skill installed to .claude/skills/layered-ui-rails/", :green
          say ""
        end
      end
    end
  end
end
