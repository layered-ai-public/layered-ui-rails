require_relative "lib/layered/ui/version"

Gem::Specification.new do |spec|
  spec.name        = "layered-ui-rails"
  spec.version     = Layered::Ui::VERSION
  spec.authors     = [ "layered.ai" ]
  spec.email       = [ "support@layered.ai" ]
  spec.homepage    = "https://www.layered.ai"
  spec.description = "An open source Rails 8+ engine built on Tailwind CSS, providing customisable WCAG 2.2 AA compliant design tokens, utility classes, and Stimulus controllers for theme switching, mobile navigation, slide-out panels, modals, and tabs. Integrates with the gems you already use (Devise, Pagy, Ransack)."
  spec.summary     = "Open source, minimalist Tailwind-based UI system for Rails with responsive, accessible components and light/dark themes."
  spec.license     = "Apache-2.0"

  spec.required_ruby_version = ">= 3.3.0"

  # Metadata
  spec.metadata["homepage_uri"] = spec.homepage
  spec.metadata["source_code_uri"] = "https://github.com/layered-ai-public/layered-ui-rails"
  spec.metadata["bug_tracker_uri"] = "https://github.com/layered-ai-public/layered-ui-rails/issues"
  spec.metadata["changelog_uri"] = "https://github.com/layered-ai-public/layered-ui-rails/blob/main/CHANGELOG.md"
  spec.metadata["documentation_uri"] = "https://layered-ui-rails.layered.ai/"
  spec.metadata["discord_uri"] = "https://discord.gg/aCGqz9Bx"
  spec.metadata["rubygems_mfa_required"] = "true"

  # Files
  spec.files = Dir.chdir(File.expand_path(__dir__)) do
    Dir["{app,config,lib,.claude/skills}/**/*", "NOTICE", "LICENSE", "TRADEMARK.md", "CLA.md", "CHANGELOG.md", "README.md", "AGENTS.md", "Rakefile"]
      .reject { |f| File.basename(f) == ".DS_Store" }
  end
  spec.require_paths = ["lib"]

  # Dependencies
  spec.add_dependency "rails", "~> 8.0"
  spec.add_dependency "tailwindcss-rails", "~> 4.0"
  spec.add_development_dependency "devise", "~> 5.0"
  spec.add_development_dependency "importmap-rails", "~> 2.0"
  spec.add_development_dependency "pagy", "~> 43.2"
  spec.add_development_dependency "propshaft", "~> 1.0"
  spec.add_development_dependency "puma", "~> 7.0"
  spec.add_development_dependency "ransack", "~> 4.0"
  spec.add_development_dependency "sqlite3", "~> 2.0"
  spec.add_development_dependency "stimulus-rails", "~> 1.0"
  spec.add_development_dependency "turbo-rails", "~> 2.0"

  # Post-install message
  spec.post_install_message = <<~MSG
    To complete installation, run:

      bin/rails generate layered:ui:install

    This command will:
      • Add `@import "../builds/tailwind/layered_ui";` to your app/assets/tailwind/application.css
        • The engine's CSS is served directly from the gem via tailwindcss-rails' engine
          support, so it is compiled with your host app's Tailwind configuration and stays
          in sync automatically when you upgrade
      • Create app/assets/tailwind/layered_ui_overrides.css for your theme customisations
      • Add `import "layered_ui"` to your app/javascript/application.js (just after `import "@hotwired/turbo-rails"`, if present)

    If these imports already exist, they will not be duplicated.

    To let AI coding agents work with layered-ui-rails in your project, install
    the included agent skill:

      bin/rails generate layered:ui:install_agent_skill
  MSG
end
