require "test_helper"

class ViewPathsTest < ActiveSupport::TestCase
  # The engine prepends its own app/views, then prepends the host application's
  # back on top. Both halves matter: the engine has to beat Devise's own views,
  # and the application has to keep the last word so it can eject any engine
  # view by copying it to the matching path.
  test "host application views take precedence over engine views" do
    assert_operator index_of(Rails.root.join("app/views").to_s),
                   :<,
                   index_of(Layered::Ui::Engine.root.join("app/views").to_s),
                   "Application views must resolve before engine views"
  end

  test "engine views take precedence over Devise's own views" do
    devise_index = view_paths.index { |path| path.match?(%r{/gems/devise-[^/]+/app/views}) }
    skip "Devise views are not on the view path" if devise_index.nil?

    assert_operator index_of(Layered::Ui::Engine.root.join("app/views").to_s),
                   :<,
                   devise_index,
                   "Engine views must resolve before Devise's own views"
  end

  private

  def view_paths
    ActionController::Base.view_paths.map(&:to_s)
  end

  def index_of(path)
    index = view_paths.index(path)
    assert_not_nil index, "Expected #{path} on the view path"
    index
  end
end
