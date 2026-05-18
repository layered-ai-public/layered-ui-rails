require "test_helper"

class HeaderHelperTest < ActionView::TestCase
  include Layered::Ui::HeaderHelper

  test "l_ui_theme_toggle renders the toggle button" do
    markup = l_ui_theme_toggle
    assert_includes markup, 'data-controller="l-ui--theme"'
    assert_includes markup, "l-ui-theme-toggle"
    assert_includes markup, 'aria-label="Toggle dark mode"'
  end
end
