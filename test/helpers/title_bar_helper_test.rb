require "test_helper"

class TitleBarHelperTest < ActionView::TestCase
  include Layered::Ui::TitleBarHelper

  test "renders title bar with title" do
    result = l_ui_title_bar(title: "Users")

    assert_includes result, '<header class="l-ui-title-bar l-ui-spread">'
    assert_includes result, '<h1 class="l-ui-title-bar__title">Users</h1>'
  end

  test "renders breadcrumbs from array items" do
    result = l_ui_title_bar(
      title: "Alice",
      breadcrumbs: [
        ["Home", "/"],
        ["Users", "/users"]
      ]
    )

    assert_includes result, '<nav aria-label="Breadcrumb"'
    assert_includes result, 'href="/"'
    assert_includes result, 'href="/users"'
    assert_includes result, "Alice"
  end

  test "renders breadcrumbs from hash items" do
    result = l_ui_title_bar(
      title: "Alice",
      breadcrumbs: [
        { label: "Home", path: "/" },
        { label: "Users", path: "/users" }
      ]
    )

    assert_includes result, "Home"
    assert_includes result, "Users"
  end

  test "renders actions passed as content" do
    action = button_tag("New", type: "button", class: "l-ui-button l-ui-button--primary")
    result = l_ui_title_bar(title: "Users", actions: action)

    assert_includes result, 'class="l-ui-title-bar__actions"'
    assert_includes result, "New"
    assert_includes result, "l-ui-button--primary"
  end

  test "renders actions passed as an array" do
    result = l_ui_title_bar(
      title: "Users",
      actions: [
        link_to("Export", "/users.csv", class: "l-ui-button l-ui-button--outline"),
        link_to("New", "/users/new", class: "l-ui-button l-ui-button--primary")
      ]
    )

    assert_includes result, "Export"
    assert_includes result, "New"
    assert_includes result, "/users.csv"
    assert_includes result, "/users/new"
  end

  test "renders actions passed as a block" do
    result = l_ui_title_bar(title: "Users") do
      button_tag("New", type: "button", class: "l-ui-button l-ui-button--primary")
    end

    assert_includes result, 'class="l-ui-title-bar__actions"'
    assert_includes result, "New"
  end

  test "omits breadcrumbs and actions when absent" do
    result = l_ui_title_bar(title: "Users")

    assert_not_includes result, "l-ui-breadcrumbs"
    assert_not_includes result, "l-ui-title-bar__actions"
  end
end
