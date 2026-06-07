require "bundler/setup"

APP_RAKEFILE = File.expand_path("test/dummy/Rakefile", __dir__)
load "rails/tasks/engine.rake"

require "bundler/gem_tasks"

require "rake/testtask"

Rake::TestTask.new(:test) do |t|
  t.libs << "test"
  t.pattern = "test/**/*_test.rb"
  t.verbose = false
end

# The engine layout links the compiled Tailwind build (stylesheet_link_tag
# "tailwind"), so the dummy app's CSS must be built before integration tests
# run - otherwise propshaft raises "asset 'tailwind.css' was not found". This
# also generates the engine entry point under app/assets/builds/tailwind/.
task test: "app:tailwindcss:build"

task default: :test
