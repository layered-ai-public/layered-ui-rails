require "test_helper"

class BreadcrumbsHelperTest < ActionView::TestCase
  include Layered::Ui::BreadcrumbsHelper

  test "renders breadcrumbs nav with aria label" do
    result = l_ui_breadcrumbs do
      l_ui_breadcrumb_item("Home", "/")
    end
    assert_includes result, '<nav aria-label="Breadcrumb"'
    assert_includes result, "l-ui-breadcrumbs"
  end

  test "renders ordered list with role" do
    result = l_ui_breadcrumbs do
      l_ui_breadcrumb_item("Home", "/")
    end
    assert_includes result, '<ol class="l-ui-breadcrumbs__list" role="list">'
  end

  test "renders linked breadcrumb item" do
    result = l_ui_breadcrumb_item("Home", "/")
    assert_includes result, "l-ui-breadcrumbs__item"
    assert_includes result, "l-ui-breadcrumbs__link"
    assert_includes result, 'href="/"'
    assert_includes result, "Home"
  end

  test "renders text breadcrumb item without path" do
    result = l_ui_breadcrumb_item("Current")
    assert_includes result, "l-ui-breadcrumbs__item"
    assert_includes result, "l-ui-breadcrumbs__text"
    assert_includes result, "Current"
    assert_not_includes result, "<a "
  end

  test "renders multiple items" do
    result = l_ui_breadcrumbs do
      l_ui_breadcrumb_item("Home", "/") +
        l_ui_breadcrumb_item("Products", "/products")
    end
    assert_includes result, "Home"
    assert_includes result, "Products"
  end
end
