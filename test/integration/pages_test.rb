require "test_helper"

class PagesTest < ActionDispatch::IntegrationTest
  test "welcome page renders" do
    get "/"
    assert_response :success
  end

  %w[
    buttons icons notices badges links surfaces forms containers
    utilities typography layout layout_metadata layout_navigation layout_panel
    layout_logos layout_icons layout_colors tabs
    conversations devise integrations
  ].each do |page|
    test "#{page} page renders" do
      get "/#{page}"
      assert_response :success
    end
  end

  test "pagy page renders" do
    get "/pagy"
    assert_response :success
  end

  test "icon URL instance variables are rendered in link and img tags when set" do
    get "/test_icon_url_override"
    assert_response :success
    assert_select "link[rel='icon'][media='(prefers-color-scheme: light)'][href='https://example.com/custom_icon_light.svg']"
    assert_select "link[rel='icon'][media='(prefers-color-scheme: dark)'][href='https://example.com/custom_icon_dark.svg']"
    assert_select "link[rel='apple-touch-icon'][href='https://example.com/custom_apple_touch_icon.png']"
    assert_select "img[src='https://example.com/custom_icon_light.svg']"
    assert_select "img[src='https://example.com/custom_icon_dark.svg']"
    assert_select "img[src='https://example.com/custom_panel_icon_light.svg']"
    assert_select "img[src='https://example.com/custom_panel_icon_dark.svg']"
  end

  test "tables page renders" do
    create_test_users
    get "/tables"
    assert_response :success
  end

  test "pagination page renders" do
    create_test_users
    get "/pagination"
    assert_response :success
  end

  private

  def create_test_users
    3.times do |i|
      User.create!(
        email: "user#{i}@test.com",
        password: "password123",
        name: "Test User #{i}",
        confirmed_at: Time.current
      )
    end
  end
end
