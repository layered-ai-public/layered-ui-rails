require "test_helper"

class BodyHelperTest < ActionView::TestCase
  include Layered::Ui::BodyHelper

  test "renders just the base class when nothing is registered" do
    assert_equal "l-ui-body", l_ui_body_classes
  end

  test "registers a single modifier" do
    l_ui_add_body_class "l-ui-body--hide-header"
    assert_equal "l-ui-body l-ui-body--hide-header", l_ui_body_classes
  end

  test "accumulates across multiple calls and multiple arguments" do
    l_ui_add_body_class "l-ui-body--glass-header", "l-ui-body--flush-top"
    l_ui_add_body_class "l-ui-body--always-show-navigation"
    assert_equal(
      "l-ui-body l-ui-body--glass-header l-ui-body--flush-top l-ui-body--always-show-navigation",
      l_ui_body_classes
    )
  end

  test "deduplicates repeated modifiers" do
    l_ui_add_body_class "l-ui-body--hide-header"
    l_ui_add_body_class "l-ui-body--hide-header"
    assert_equal "l-ui-body l-ui-body--hide-header", l_ui_body_classes
  end

  test "ignores nil arguments" do
    l_ui_add_body_class "l-ui-body--hide-header", nil
    assert_equal "l-ui-body l-ui-body--hide-header", l_ui_body_classes
  end

  test "still honours the legacy content_for bridge" do
    content_for :l_ui_body_class, "l-ui-body--header-contained"
    l_ui_add_body_class "l-ui-body--hide-header"
    assert_equal "l-ui-body l-ui-body--hide-header l-ui-body--header-contained", l_ui_body_classes
  end
end
