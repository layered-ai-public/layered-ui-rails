require "test_helper"

class SearchHelperTest < ActionView::TestCase
  include Layered::Ui::SearchHelper

  setup do
    # Stub search_form_for to capture the html options and yield a mock form builder
    @captured_html = nil
    @form_output = ""
    define_singleton_method(:search_form_for) do |_q, url: nil, html: {}, &block|
      @captured_html = html
      block ? block.call(MockFormBuilder.new) : ""
    end
  end

  test "does not mutate the caller's html hash" do
    opts = { class: "original" }
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", html: opts) { "" }
    assert_equal "original", opts[:class]
  end

  test "merges l-ui-form class with custom classes" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", html: { class: "custom" }) { "" }
    assert_equal "l-ui-form custom", @captured_html[:class]
  end

  test "simple mode generates combined predicate field" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name, :email])
    assert_includes result, "name_or_email_cont"
  end

  test "simple mode uses custom predicate" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name], predicate: :eq)
    assert_includes result, "name_eq"
  end

  test "simple mode uses and combinator" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name, :email], combinator: :and)
    assert_includes result, "name_and_email_cont"
  end

  test "simple mode defaults to or combinator" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name, :email])
    assert_includes result, "name_or_email_cont"
  end

  test "simple mode auto-generates placeholder from field names" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name, :email])
    assert_includes result, "Search by name, email"
  end

  test "simple mode omits clear button by default" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name])
    assert_not_includes result, "Clear"
  end

  test "simple mode renders clear button with true" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name], clear: true)
    assert_includes result, "Clear"
    assert_includes result, "l-ui-button--outline"
  end

  test "simple mode renders clear button with custom label" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name], clear: "Reset")
    assert_includes result, "Reset"
  end

  test "simple mode raises when fields is empty" do
    q = User.ransack({})
    assert_raises(ArgumentError) { l_ui_search_form(q, url: "/search") }
  end

  test "simple mode raises when clear is set without url" do
    q = User.ransack({})
    assert_raises(ArgumentError) { l_ui_search_form(q, fields: [:name], clear: true) }
  end

  test "block mode yields form builder" do
    q = User.ransack({})
    yielded = false
    l_ui_search_form(q, url: "/search") { |_f| yielded = true; "" }
    assert yielded
  end

  test "returns nil when Ransack is not available" do
    without_ransack do
      result = l_ui_search_form(nil, url: "/search", fields: [:name])
      assert_nil result
    end
  end

  private

  def without_ransack
    define_singleton_method(:ransack_available?) { false }
    yield
  ensure
    define_singleton_method(:ransack_available?) { defined?(Ransack) }
  end


  # Minimal form builder stand-in for unit tests
  class MockFormBuilder
    def label(field, text = nil, **opts)
      "<label for=\"#{field}\">#{text}</label>"
    end

    def text_field(field, **opts)
      attrs = opts.map { |k, v| "#{k}=\"#{v}\"" }.join(" ")
      "<input name=\"#{field}\" #{attrs} />"
    end

    def submit(text, **opts)
      "<button>#{text}</button>"
    end
  end
end
