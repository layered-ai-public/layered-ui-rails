require "test_helper"

# The dummy app maps :members to the User model, so the mapping name (:member)
# differs from the model's param key ("user"). That gap is where scope handling
# breaks: form fields must be scoped to the mapping, not the model, or Devise
# never finds the submitted parameters.
class DeviseScopeTest < ActionDispatch::IntegrationTest
  setup do
    @previous_scope = Layered::Ui.devise_scope
    @previous_user_method = Layered::Ui.current_user_method
    Layered::Ui.devise_scope = :member
    Layered::Ui.current_user_method = :current_member
  end

  teardown do
    Layered::Ui.devise_scope = @previous_scope
    Layered::Ui.current_user_method = @previous_user_method
  end

  test "auth views scope their fields to the mapping, not the model" do
    get "/members/sign_in"
    assert_response :success
    assert_select "form[action='/members/sign_in'] input[name='member[email]']"
    assert_select "input[name='user[email]']", count: 0
  end

  test "settings screen renders and updates under the mapping's scope" do
    user = sign_in_member

    get "/members/edit"
    assert_response :success
    assert_select "h1", text: "Settings"
    assert_select "form[action='/members'] input[name='member[email]']"

    put "/members", params: {
      member: { name: "Renamed", email: user.email, current_password: "notasecret123" }
    }

    assert_response :redirect
    assert_equal "Renamed", user.reload.name
  end

  test "navigation menu links to the mapping's own paths" do
    sign_in_member

    get "/"
    assert_response :success
    assert_select ".l-ui-popover__menu a[href='/members/edit']", text: "Settings"
    assert_select ".l-ui-popover__menu form[action='/members/sign_out'] button", text: "Logout"
  end

  private

  def sign_in_member
    user = User.create!(
      email: "member@test.com",
      password: "notasecret123",
      name: "Member User",
      confirmed_at: Time.current
    )

    get "/members/sign_in"
    post "/members/sign_in", params: { member: { email: user.email, password: "notasecret123" } }

    user
  end
end
