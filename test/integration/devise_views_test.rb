require "test_helper"

class DeviseViewsTest < ActionDispatch::IntegrationTest
  test "login page renders the assistance heading with its links" do
    get "/users/sign_in"
    assert_response :success
    assert_select "h2", text: "Need assistance?"
    assert_select "a", text: "Reset your password"
  end

  test "assistance heading is only rendered when there are assistance links" do
    get "/users/sign_in"
    assert_response :success

    headings = css_select("h2").select { |heading| heading.text.strip == "Need assistance?" }
    links = css_select("a").map(&:text).map(&:strip)
    assistance_links = links & [ "Reset your password", "Resend account confirmation email", "Resend account unlock email" ]

    assert_equal assistance_links.any?, headings.any?
  end

  test "field hints are referenced by their input" do
    get "/users/sign_up"
    assert_response :success
    assert_select "input[name='user[password]'][aria-describedby='user_password_hint user_password_error']"
    assert_select "#user_password_hint", text: /characters minimum/
  end

  test "account settings page renders for a signed in user" do
    sign_in_user

    get "/users/edit"
    assert_response :success
    assert_select "h1", text: "Settings"
    assert_select ".l-ui-tabs__list [role='tab']", text: "Account", count: 1
    assert_select "input[name='user[email]']"
    assert_select "input[name='user[name]']"
    assert_select "input[name='user[current_password]']"
    assert_select "input[type='submit'][value='Save changes']"
    assert_select "form[action='/users'] button", text: "Cancel my account"
  end

  test "navigation links a signed in user to their account settings" do
    sign_in_user

    get "/"
    assert_response :success
    assert_select ".l-ui-navigation__user button[popovertarget] .l-ui-sr-only", text: "Account menu"
    assert_select ".l-ui-navigation__user .l-ui-popover__menu a[href='/users/edit']", text: "Settings"
    assert_select ".l-ui-navigation__user .l-ui-popover__menu form[action='/users/sign_out'] button", text: "Logout"
  end

  test "account settings page keeps the primary navigation" do
    sign_in_user

    get "/users/edit"
    assert_response :success
    assert_select "#l-ui-navigation .l-ui-navigation__links a[href='/']"
  end

  test "account settings updates the user" do
    user = sign_in_user

    put "/users", params: {
      user: {
        name: "Updated Name",
        email: user.email,
        current_password: "notasecret123"
      }
    }

    assert_response :redirect
    assert_equal "Updated Name", user.reload.name
  end

  private

  def sign_in_user
    user = User.create!(
      email: "settings@test.com",
      password: "notasecret123",
      name: "Settings User",
      confirmed_at: Time.current
    )

    get "/users/sign_in"
    post "/users/sign_in", params: { user: { email: user.email, password: "notasecret123" } }

    user
  end
end
