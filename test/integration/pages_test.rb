require "test_helper"

class PagesTest < ActionDispatch::IntegrationTest
  test "home page renders" do
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

  test "search page renders" do
    get "/search"
    assert_response :success
  end

  test "ransack page renders" do
    get "/ransack"
    assert_response :success
  end

  test "ransack page renders search results" do
    create_test_users
    get "/ransack", params: { users_q: { name_cont: "Test" } }
    assert_response :success
    assert_select "caption", "Users"
    assert_select "th", /Test User/
  end

  test "ransack page renders sort links" do
    create_test_users
    get "/ransack"
    assert_response :success
    assert_select "th.l-ui-table__header-cell--sortable", minimum: 3
    assert_select "th[aria-sort]", minimum: 3
    assert_select "a.l-ui-table__sort-link", minimum: 3
  end

  test "ransack page sorts by column" do
    create_test_users
    get "/ransack", params: { users_q: { s: "name desc" } }
    assert_response :success
    # The sortable table has header cells with aria-sort attributes
    sortable_table = css_select("table.l-ui-table").detect { |t| t.css("th[aria-sort]").any? }
    assert_not_nil sortable_table, "Expected a table with sortable headers (th[aria-sort])"
    names = sortable_table.css("tbody th[scope='row']").map(&:text)
    assert_equal names.sort.reverse, names, "Expected rows sorted by name descending"
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

  test "logo content_for yields are rendered in the header when set" do
    get "/test_logo_override"
    assert_response :success
    assert_select "img[src='https://example.com/custom_logo_light.svg']"
    assert_select "img[src='https://example.com/custom_logo_dark.svg']"
  end

  test "l_ui_head content_for is injected into the head when set" do
    get "/test_head_injection"
    assert_response :success
    assert_select "head style[data-test='custom-head']"
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
