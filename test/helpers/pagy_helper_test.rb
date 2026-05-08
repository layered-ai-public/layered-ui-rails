require "test_helper"

class PagyHelperTest < ActionView::TestCase
  include Layered::Ui::PagyHelper

  test "returns nil for single-page results" do
    pagy = Pagy::Offset.new(count: 5, limit: 10, page: 1)
    assert_nil l_ui_pagy(pagy)
  end

  test "renders container with correct class for multi-page results" do
    pagy = Pagy::Offset.new(count: 100, limit: 10, page: 1)
    # Stub series_nav to avoid needing a full request context
    pagy.define_singleton_method(:series_nav) { "<nav>pages</nav>" }
    result = l_ui_pagy(pagy)
    assert_includes result, "l-ui-pagy-container"
    assert_includes result, "l-ui-mt-lg"
  end
end
