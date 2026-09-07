require "test_helper"

class RansackHelperTest < ActionView::TestCase
  include Layered::Ui::RansackHelper

  setup do
    # Stub search_form_for to capture the html and as options and yield a mock form builder
    @captured_html = nil
    @captured_as = nil
    @form_output = ""
    define_singleton_method(:search_form_for) do |_q, url: nil, html: {}, as: :q, &block|
      @captured_html = html
      @captured_as = as
      term = begin
        _q.name_cont
      rescue StandardError
        nil
      end
      block ? block.call(MockFormBuilder.new(term)) : ""
    end

    # Stub sort_url to return a plausible URL string (mirrors Ransack's sort_url).
    # The direction always defaults to asc here; tests that need to verify URL
    # content should use integration tests with real Ransack instead.
    define_singleton_method(:sort_url) do |_q, attribute, _options = {}|
      "/test?q%5Bs%5D=#{attribute}+asc"
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

  test "simple mode renders a clear button by default" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results")
    assert_includes result, "l-ui-search-control__clear"
    assert_includes result, "Clear search"
  end

  test "simple mode omits the clear button with false" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results", clear: false)
    assert_not_includes result, "l-ui-search-control__clear"
    assert_not_includes result, "l-ui-search-control--clearable"
  end

  test "simple mode names the clear button from a string" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results", clear: "Reset")
    assert_includes result, "Reset"
  end

  test "the clear button starts hidden when the field is empty" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results")
    assert_match(/<button[^>]*l-ui-search-control__clear[^>]*hidden/, result)
  end

  # Ransack answers a combined reader like name_or_email_cont through
  # method_missing, which respond_to? does not always admit to, so the helper
  # asks for the value rather than checking for the method.
  test "the clear button shows when the field already holds a term" do
    q = User.ransack({ "name_cont" => "ada" })
    result = l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results")
    assert_includes result, "l-ui-search-control__clear"
    assert_no_match(/<button[^>]*l-ui-search-control__clear[^>]*hidden/, result)
  end

  test "without a frame the clear falls back to a link" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name])
    assert_includes result, "l-ui-button--outline"
    assert_not_includes result, "l-ui-search-control__clear"
  end

  test "simple mode raises when fields is empty" do
    q = User.ransack({})
    assert_raises(ArgumentError) { l_ui_search_form(q, url: "/search") }
  end

  test "raises when a non-live clear has no url to point at" do
    q = User.ransack({})
    assert_raises(ArgumentError) { l_ui_search_form(q, fields: [:name], clear: true) }
  end

  # -- searching as you type --

  test "a framed form searches as the user types" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results")
    assert_equal true, @captured_html[:data][:l_ui__search_form_live_value]
    assert_includes result, "input->l-ui--search-form#search"
    assert_includes result, "keydown.esc->l-ui--search-form#clearSearch"
    assert_includes result, "l-ui--search-form-target=\"input\""
  end

  test "a form with no frame does not search as the user types" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name])
    assert_nil @captured_html[:data]
    assert_not_includes result, "l-ui--search-form#search"
  end

  test "live: false opts a framed form out of searching as you type" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results", live: false)
    assert_nil @captured_html[:data][:l_ui__search_form_live_value]
    assert_equal "advance", @captured_html[:data][:turbo_action]
    assert_not_includes result, "l-ui--search-form#search"
  end

  test "a live search replaces the history entry rather than pushing one" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results")
    assert_equal "replace", @captured_html[:data][:turbo_action]
  end

  test "an explicit turbo_action still wins" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results",
                     html: { data: { turbo_action: "advance" } })
    assert_equal "advance", @captured_html[:data][:turbo_action]
  end

  test "a live form is a search landmark" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results", label: "Search users")
    assert_equal "search", @captured_html[:role]
    assert_equal "Search users", @captured_html[:aria][:label]
  end

  test "the field describes itself as updating while you type" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results")
    assert_includes result, "Results update as you type."
    assert_includes result, "aria-describedby=\"q_name_cont_hint\""
  end

  # -- submit button --

  test "the submit is present but hidden by default" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results")
    assert_includes result, "l-ui-sr-only"
    assert_includes result, "tabindex=\"-1\""
    assert_not_includes result, "l-ui-button--primary"
  end

  test "a named button renders a visible submit" do
    q = User.ransack({})
    result = l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results", button: "Go")
    assert_includes result, "l-ui-button--primary"
    assert_includes result, "Go"
  end

  # -- result count --

  test "a count is handed to the controller to announce" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results", count: 12)
    assert_equal 12, @captured_html[:data][:l_ui__search_form_count_value]
  end

  test "a count of zero is still announced" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results", count: 0)
    assert_equal 0, @captured_html[:data][:l_ui__search_form_count_value]
  end

  test "no count means nothing is announced" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results")
    assert_nil @captured_html[:data][:l_ui__search_form_count_value]
  end

  test "min_chars is passed through when set" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results", min_chars: 3)
    assert_equal 3, @captured_html[:data][:l_ui__search_form_min_chars_value]
  end

  test "min_chars is left unsaid at its default" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "results")
    assert_nil @captured_html[:data][:l_ui__search_form_min_chars_value]
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

  # -- search_key / as: --

  test "search_form passes as: matching the search object's search_key" do
    q = User.ransack({}, search_key: :users_q)
    l_ui_search_form(q, url: "/search", fields: [:name])
    assert_equal :users_q, @captured_as
  end

  test "search_form defaults as: to :q when no custom search_key" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", fields: [:name])
    assert_equal :q, @captured_as
  end

  # -- turbo_frame on search_form --

  test "search_form with turbo_frame adds data attributes to form HTML" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", fields: [:name], turbo_frame: "my_frame")
    assert_equal "my_frame", @captured_html[:data][:turbo_frame]
    assert_equal :q, @captured_html[:data][:l_ui__search_form_scope_value]
  end

  test "search_form turbo_frame does not clobber existing data in html" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", fields: [:name],
                     turbo_frame: "my_frame", html: { data: { controller: "search" } })
    assert_includes @captured_html[:data][:controller], "search"
    assert_includes @captured_html[:data][:controller], "l-ui--search-form"
    assert_equal "my_frame", @captured_html[:data][:turbo_frame]
  end

  test "search_form without turbo_frame does not add turbo data attributes" do
    q = User.ransack({})
    l_ui_search_form(q, url: "/search", fields: [:name])
    assert_nil @captured_html[:data]
  end

  # -- l_ui_sort_link --

  test "sort_link renders a th with sort link inside" do
    q = User.ransack({})
    result = l_ui_sort_link(q, :name)
    assert_includes result, "<th"
    assert_includes result, "Name"
    assert_includes result, "l-ui-table__sort-link"
    assert_includes result, "l-ui-table__header-cell"
    assert_includes result, 'aria-sort="none"'
    assert_includes result, 'scope="col"'
  end

  test "sort_link uses custom label" do
    q = User.ransack({})
    result = l_ui_sort_link(q, :created_at, "Joined")
    assert_includes result, "Joined"
  end

  test "sort_link merges custom CSS classes on the anchor" do
    q = User.ransack({})
    result = l_ui_sort_link(q, :name, html: { class: "extra" })
    assert_includes result, "l-ui-table__sort-link extra"
  end

  test "sort_link does not mutate the caller's html hash" do
    q = User.ransack({})
    opts = { class: "extra" }
    l_ui_sort_link(q, :name, html: opts)
    assert_equal({ class: "extra" }, opts)
  end

  test "sort_link forwards non-class HTML options to the anchor" do
    q = User.ransack({})
    result = l_ui_sort_link(q, :name, html: { data: { turbo_action: "replace" } })
    assert_includes result, 'data-turbo-action="replace"'
  end

  test "sort_link shows ascending indicator and aria-sort" do
    q = User.ransack(s: "name asc")
    result = l_ui_sort_link(q, :name)
    assert_includes result, "▲"
    assert_includes result, "sorted ascending"
    assert_includes result, 'aria-sort="ascending"'
  end

  test "sort_link shows descending indicator and aria-sort" do
    q = User.ransack(s: "name desc")
    result = l_ui_sort_link(q, :name)
    assert_includes result, "▼"
    assert_includes result, "sorted descending"
    assert_includes result, 'aria-sort="descending"'
  end

  # -- turbo_frame on sort_link --

  test "sort_link with turbo_frame adds data attributes to link" do
    q = User.ransack({})
    result = l_ui_sort_link(q, :name, turbo_frame: "my_frame")
    assert_includes result, 'data-turbo-frame="my_frame"'
    assert_includes result, 'data-turbo-action="advance"'
  end

  test "sort_link turbo_frame does not clobber existing data in html" do
    q = User.ransack({})
    result = l_ui_sort_link(q, :name, turbo_frame: "my_frame", html: { data: { controller: "sort" } })
    assert_includes result, 'data-controller="sort"'
    assert_includes result, 'data-turbo-frame="my_frame"'
  end

  test "sort_link without turbo_frame does not add turbo data attributes" do
    q = User.ransack({})
    result = l_ui_sort_link(q, :name)
    assert_not_includes result, "data-turbo-frame"
    assert_not_includes result, "data-turbo-action"
  end

  test "sort_link renders th when Ransack is not available" do
    without_ransack do
      result = l_ui_sort_link(nil, :name)
      assert_includes result, "<th"
      assert_includes result, "Name"
      assert_not_includes result, "l-ui-table__sort-link"
      assert_includes result, "l-ui-table__header-cell"
    end
  end

  test "sort_link uses custom label when Ransack is not available" do
    without_ransack do
      result = l_ui_sort_link(nil, :created_at, "Joined")
      assert_includes result, "Joined"
    end
  end

  private

  def without_ransack
    define_singleton_method(:ransack_available?) { false }
    yield
  ensure
    define_singleton_method(:ransack_available?) { defined?(Ransack) }
  end


  # Minimal form builder stand-in for unit tests. `data:` and `aria:` hashes are
  # flattened the way Rails flattens them, so a test can assert on the
  # attributes the search control actually emits.
  class MockFormBuilder
    # Stands in for the searched-for object. Ransack answers attribute readers
    # through method_missing, and denies respond_to? for a combined one, which
    # is the shape the helper has to cope with.
    class SearchObject
      def initialize(term) = @term = term
      def respond_to_missing?(_name, _include_private = false) = false
      def method_missing(_name, *) = @term
    end

    def initialize(term = nil) = @term = term

    def object_name = "q"

    def object = @object ||= SearchObject.new(@term)

    def label(field, text = nil, **opts)
      "<label for=\"#{field}\">#{text}</label>".html_safe
    end

    def text_field(field, **opts)
      "<input name=\"#{field}\" #{attributes(opts)} />".html_safe
    end

    def submit(text, **opts)
      "<button #{attributes(opts)}>#{text}</button>".html_safe
    end

    private

    def attributes(opts)
      opts.flat_map { |key, value|
        if value.is_a?(Hash)
          value.map { |k, v| "#{key}-#{k.to_s.tr('_', '-')}=\"#{v}\"" }
        else
          "#{key}=\"#{value}\""
        end
      }.join(" ")
    end
  end
end
