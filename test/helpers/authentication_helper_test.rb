require "test_helper"

class AuthenticationHelperTest < ActionView::TestCase
  include Layered::Ui::AuthenticationHelper

  def current_user
    @current_user
  end

  def with_devise_scope(scope)
    previous = Layered::Ui.devise_scope
    Layered::Ui.devise_scope = scope
    yield
  ensure
    Layered::Ui.devise_scope = previous
  end

  test "detects Devise is installed" do
    assert l_ui_devise_installed?
  end

  test "returns nil when no current user" do
    assert_nil l_ui_current_user
  end

  test "user_signed_in? returns false when no user" do
    assert_not l_ui_user_signed_in?
  end

  test "returns current user when present" do
    @current_user = User.new(email: "test@example.com", name: "Test")
    assert_equal @current_user, l_ui_current_user
  end

  test "user_signed_in? returns true when user present" do
    @current_user = User.new(email: "test@example.com", name: "Test")
    assert l_ui_user_signed_in?
  end

  test "returns the Devise account settings path" do
    assert_equal "/users/edit", l_ui_edit_registration_path
  end

  test "builds Devise paths for the configured scope" do
    with_devise_scope(:admin) do
      assert_nil l_ui_edit_registration_path
      assert_nil l_ui_new_session_path
      assert_nil l_ui_destroy_session_path
    end
  end
end
