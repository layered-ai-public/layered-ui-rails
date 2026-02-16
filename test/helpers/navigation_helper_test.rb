require "test_helper"

class NavigationHelperTest < ActionView::TestCase
  include Layered::Ui::NavigationHelper

  test "renders inactive navigation item" do
    result = l_ui_navigation_item("Dashboard", "/dashboard", active: false)
    assert_not_includes result, "l-ui-navigation__item--active"
    assert_includes result, "Dashboard"
    assert_includes result, "/dashboard"
  end

  test "renders active navigation item with aria-current" do
    result = l_ui_navigation_item("Dashboard", "/dashboard", active: true)
    assert_includes result, "l-ui-navigation__item--active"
    assert_includes result, 'aria-current="page"'
  end

  test "renders children in secondary list" do
    result = l_ui_navigation_item("Section", "/section", active: false) do
      content_tag(:li) { link_to "Child", "/child", class: "l-ui-navigation__item" }
    end
    assert_includes result, "l-ui-navigation__secondary"
    assert_includes result, "Child"
  end

  test "parent activates when child has active class" do
    result = l_ui_navigation_item("Section", "/section") do
      content_tag(:li) { link_to "Child", "/child", class: "l-ui-navigation__item--active" }
    end
    assert_includes result, "l-ui-navigation__item--active"
  end
end
