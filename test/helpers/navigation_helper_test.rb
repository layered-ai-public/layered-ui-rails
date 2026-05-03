require "test_helper"

class NavigationHelperTest < ActionView::TestCase
  include Layered::Ui::NavigationHelper

  test "renders inactive navigation item" do
    result = l_ui_navigation_item("Dashboard", "/dashboard", active: false)
    assert_not_includes result, "l-ui-navigation__item--active"
    assert_includes result, "Dashboard"
    assert_includes result, "/dashboard"
  end

  test "active: true styles the item active but does not set aria-current unless on the page" do
    request.env["PATH_INFO"] = "/somewhere-else"
    result = l_ui_navigation_item("Dashboard", "/dashboard", active: true)
    assert_includes result, "l-ui-navigation__item--active"
    assert_not_includes result, 'aria-current="page"'
  end

  test "aria-current=page is set only when current_page? matches" do
    request.env["PATH_INFO"] = "/dashboard"
    result = l_ui_navigation_item("Dashboard", "/dashboard")
    assert_includes result, "l-ui-navigation__item--active"
    assert_includes result, 'aria-current="page"'
  end

  test "renders icon when icon name provided" do
    result = l_ui_navigation_item("Home", "/", active: false, icon: "home")
    assert_includes result, "l-ui-navigation__item-icon"
    assert_includes result, "icon_home.svg"
  end

  test "renders icon when icon_path provided" do
    result = l_ui_navigation_item("Home", "/", active: false, icon_path: "custom/my_icon.svg")
    assert_includes result, "l-ui-navigation__item-icon"
    assert_includes result, "custom/my_icon.svg"
  end

  test "match starts_with activates item for descendant paths" do
    request.env["PATH_INFO"] = "/layout/colors"
    result = l_ui_navigation_item("Layout", "/layout", match: :starts_with)
    assert_includes result, "l-ui-navigation__item--active"
    assert_not_includes result, 'aria-current="page"'
  end

  test "match starts_with does not activate sibling prefix paths" do
    request.env["PATH_INFO"] = "/layouts"
    result = l_ui_navigation_item("Layout", "/layout", match: :starts_with)
    assert_not_includes result, "l-ui-navigation__item--active"
  end

  test "renders non-collapsible section with heading" do
    result = l_ui_navigation_section("Group") do
      l_ui_navigation_item("Item", "/item", active: false)
    end
    assert_includes result, "l-ui-navigation__section"
    assert_includes result, "l-ui-navigation__section-heading"
    assert_includes result, "Group"
    assert_not_includes result, "aria-expanded"
  end

  test "renders collapsible section with toggle button" do
    result = l_ui_navigation_section("Group", collapsible: true, storage_key: "group") do
      l_ui_navigation_item("Item", "/item", active: false)
    end
    assert_includes result, "l-ui-navigation__section--collapsible"
    assert_includes result, "navigation-section"
    assert_includes result, 'data-l-ui--navigation-section-storage-key-value="group"'
    assert_includes result, 'aria-expanded="true"'
  end

  test "collapsible section wires aria-controls to panel id" do
    result = l_ui_navigation_section("Group", collapsible: true) do
      l_ui_navigation_item("Item", "/item", active: false)
    end
    panel_id = result[/id="(l-ui-navigation-section-[a-f0-9]+)"/, 1]
    assert panel_id, "expected a panel id in #{result}"
    assert_includes result, %(aria-controls="#{panel_id}")
  end

  test "collapsible section starts collapsed when expanded false" do
    result = l_ui_navigation_section("Group", collapsible: true, expanded: false) do
      l_ui_navigation_item("Item", "/item", active: false)
    end
    assert_includes result, 'aria-expanded="false"'
    assert_includes result, "hidden"
  end

  test "collapsible section forced open when child active" do
    result = l_ui_navigation_section("Group", collapsible: true, expanded: false) do
      l_ui_navigation_item("Item", "/item", active: true)
    end
    assert_includes result, 'aria-expanded="true"'
    assert_includes result, 'data-l-ui--navigation-section-force-open-value="true"'
  end

  test "collapsible section forced open when nested descendant active" do
    result = l_ui_navigation_section("Outer", collapsible: true, expanded: false) do
      l_ui_navigation_section("Inner", collapsible: true, expanded: false) do
        l_ui_navigation_item("Deep", "/deep", active: true)
      end
    end
    assert_equal 2, result.scan('data-l-ui--navigation-section-force-open-value="true"').size
  end

  test "separated section gets separator class" do
    result = l_ui_navigation_section("Group", separated: true) do
      l_ui_navigation_item("Item", "/item", active: false)
    end
    assert_includes result, "l-ui-navigation__section--separated"
  end
end
