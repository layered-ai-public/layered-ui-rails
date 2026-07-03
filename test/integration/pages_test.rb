require "test_helper"

class PagesTest < ActionDispatch::IntegrationTest
  test "home page renders" do
    get "/"
    assert_response :success
  end

  %w[
    buttons icons notices badges links surfaces forms containers
    utilities typography layout layout_metadata layout_navigation layout_panel
    layout_logos layout_icons layout_colors layout_breadcrumbs layout_header tabs
    popovers conversations devise integrations
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

  test "panel renders inline SVG fallback for both themes when neither URL is set" do
    get "/"
    assert_response :success
    assert_select "button.l-ui-panel__button svg.l-ui-panel__icon--light", count: 1
    assert_select "button.l-ui-panel__button svg.l-ui-panel__icon--dark", count: 1
    assert_select "button.l-ui-panel__button img", count: 0
  end

  test "panel falls back to inline SVG for the dark theme when only light URL is set" do
    get "/test_panel_icon_light_only"
    assert_response :success
    assert_select "button.l-ui-panel__button img.l-ui-panel__icon--light[src='https://example.com/custom_panel_icon_light.svg']"
    assert_select "button.l-ui-panel__button svg.l-ui-panel__icon--dark"
    assert_select "button.l-ui-panel__button img.l-ui-panel__icon--dark", count: 0
  end

  test "panel falls back to inline SVG for the light theme when only dark URL is set" do
    get "/test_panel_icon_dark_only"
    assert_response :success
    assert_select "button.l-ui-panel__button img.l-ui-panel__icon--dark[src='https://example.com/custom_panel_icon_dark.svg']"
    assert_select "button.l-ui-panel__button svg.l-ui-panel__icon--light"
    assert_select "button.l-ui-panel__button img.l-ui-panel__icon--light", count: 0
  end

  test "logo content_for yields are rendered in the header when set" do
    get "/test_logo_override"
    assert_response :success
    assert_select "img[src='https://example.com/custom_logo_light.svg']"
    assert_select "img[src='https://example.com/custom_logo_dark.svg']"
  end

  test "default header actions render the theme toggle and navigation toggle" do
    get "/"
    assert_response :success
    assert_select "nav.l-ui-header__navigation button.l-ui-theme-toggle"
    assert_select "nav.l-ui-header__navigation button.l-ui-button--navigation-toggle"
  end

  test "header actions start and end yields prepend and append items around the defaults" do
    get "/test_header_actions"
    assert_response :success
    assert_select "nav.l-ui-header__navigation a[data-test='actions-start']"
    assert_select "nav.l-ui-header__navigation a[data-test='actions-end']"
    assert_select "nav.l-ui-header__navigation button.l-ui-theme-toggle"
  end

  test "header actions yield replaces the default action group" do
    get "/test_header_actions_replaced"
    assert_response :success
    assert_select "nav.l-ui-header__navigation a[data-test='actions-replaced']"
    assert_select "nav.l-ui-header__navigation button.l-ui-theme-toggle"
    assert_select "nav.l-ui-header__navigation button.l-ui-button--navigation-toggle", count: 0
    assert_select "nav.l-ui-header__navigation a[data-test='actions-start-suppressed']", count: 0
    assert_select "nav.l-ui-header__navigation a[data-test='actions-end-suppressed']", count: 0
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

  test "tables_helper page renders" do
    create_test_users
    get "/tables_helper"
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
        password: "notasecret123",
        name: "Test User #{i}",
        confirmed_at: Time.current
      )
    end
  end
end
