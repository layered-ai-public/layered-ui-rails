require "fileutils"
require "pathname"

namespace :layered_ui do
  desc "Vendor @layered-ui/css source assets into layered-ui-rails"
  task :sync_css do
    root = Pathname.new(File.expand_path("..", __dir__))
    package_root = root.join("packages/layered-ui-css")
    css_source = package_root.join("src/layered-ui.css")
    rails_css_source = root.join("app/assets/tailwind/layered/ui/rails.css")
    css_destination = root.join("app/assets/tailwind/layered/ui/styles.css")
    fonts_source = package_root.join("fonts")
    fonts_destination = root.join("app/assets/fonts/layered_ui")

    abort "Missing CSS package source at #{css_source}" unless css_source.exist?
    abort "Missing Rails CSS source at #{rails_css_source}" unless rails_css_source.exist?
    abort "Missing CSS package fonts at #{fonts_source}" unless fonts_source.directory?

    css = css_source.read
      .gsub("url('../fonts/manrope.woff2')", "url('layered_ui/manrope.woff2')")
      .gsub("url('../fonts/inter.woff2')", "url('layered_ui/inter.woff2')")
      .chomp

    css_destination.dirname.mkpath
    css_destination.write("#{css}\n\n/* Rails integrations */\n\n#{rails_css_source.read.chomp}\n")

    fonts_destination.mkpath
    fonts_source.children.select(&:file?).each do |font|
      FileUtils.cp(font, fonts_destination.join(font.basename))
    end

    puts "Vendored @layered-ui/css into layered-ui-rails"
  end
end
