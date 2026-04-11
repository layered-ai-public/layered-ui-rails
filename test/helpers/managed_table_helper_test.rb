require "test_helper"

class ManagedTableHelperTest < ActionView::TestCase
  include Layered::Ui::ManagedTableHelper
  include Layered::Ui::RansackHelper

  setup do
    # Stub sort_url for sort link tests
    define_singleton_method(:sort_url) do |_q, attribute, _options = {}|
      "/test?q%5Bs%5D=#{attribute}+asc"
    end
  end

  # -- basic rendering --

  test "renders table with correct CSS classes" do
    result = build_table([mock_record("Alice")])
    assert_includes result, "l-ui-container--table"
    assert_includes result, "l-ui-utility--mt-lg"
    assert_includes result, 'class="l-ui-table"'
    assert_includes result, 'class="l-ui-table__header"'
    assert_includes result, 'class="l-ui-table__body"'
  end

  test "renders header cells with scope col" do
    result = build_table([mock_record("Alice")], columns: [{ attribute: :name }])
    assert_includes result, '<th class="l-ui-table__header-cell" scope="col">Name</th>'
  end

  test "auto-generates label from attribute name" do
    result = build_table([mock_record("Alice")], columns: [{ attribute: :created_at }])
    assert_includes result, "Created at"
  end

  test "uses custom label when provided" do
    result = build_table([mock_record("Alice")], columns: [{ attribute: :created_at, label: "Joined" }])
    assert_includes result, "Joined"
    assert_not_includes result, "Created at"
  end

  # -- primary column --

  test "first column is primary by default" do
    result = build_table([mock_record("Alice")], columns: [{ attribute: :name }, { attribute: :email }])
    assert_includes result, '<th class="l-ui-table__cell--primary" scope="row">Alice</th>'
  end

  test "explicit primary overrides default" do
    result = build_table(
      [mock_record("Alice", email: "alice@example.com")],
      columns: [{ attribute: :name }, { attribute: :email, primary: true }]
    )
    # name should be a regular cell, email should be primary
    assert_includes result, '<td class="l-ui-table__cell">Alice</td>'
    assert_includes result, '<th class="l-ui-table__cell--primary" scope="row">alice@example.com</th>'
  end

  # -- caption --

  test "renders caption with sr-only class" do
    result = build_table([mock_record("Alice")], caption: "Users")
    assert_includes result, '<caption class="l-ui-sr-only">Users</caption>'
  end

  test "omits caption when nil" do
    result = build_table([mock_record("Alice")])
    assert_not_includes result, "<caption"
  end

  # -- empty state --

  test "renders empty state message" do
    result = build_table([], columns: [{ attribute: :name }])
    assert_includes result, "No records found."
    assert_includes result, 'colspan="1"'
  end

  test "empty state colspan accounts for actions column" do
    result = build_table([], columns: [{ attribute: :name }], actions: ->(r) { "Edit" })
    assert_includes result, 'colspan="2"'
  end

  # -- custom rendering --

  test "uses render proc for cell content" do
    result = build_table(
      [mock_record("Alice")],
      columns: [{ attribute: :name, render: ->(r) { r.name.upcase } }]
    )
    assert_includes result, "ALICE"
    assert_not_includes result, ">Alice<"
  end

  test "falls back to public_send when no render proc" do
    result = build_table([mock_record("Alice")])
    assert_includes result, "Alice"
  end

  test "formats date values when no render proc" do
    date = Time.new(2025, 3, 15, 10, 30, 0)
    record = mock_record("Alice", created_at: date)
    result = build_table(
      [record],
      columns: [{ attribute: :name }, { attribute: :created_at }]
    )
    assert_includes result, "15 Mar 2025 10:30"
  end

  test "does not format dates when render proc is provided" do
    date = Time.new(2025, 3, 15, 10, 30, 0)
    record = mock_record("Alice", created_at: date)
    result = build_table(
      [record],
      columns: [{ attribute: :name }, { attribute: :created_at, render: ->(r) { "custom" } }]
    )
    assert_includes result, "custom"
    assert_not_includes result, "15 Mar 2025"
  end

  # -- actions column --

  test "renders actions header when actions proc is present" do
    result = build_table(
      [mock_record("Alice")],
      actions: ->(r) { "Edit" }
    )
    assert_includes result, '<th class="l-ui-table__header-cell--action" scope="col">Actions</th>'
  end

  test "renders action cells with correct class" do
    result = build_table(
      [mock_record("Alice")],
      actions: ->(r) { "Edit" }
    )
    assert_includes result, 'class="l-ui-table__cell--action"'
    assert_includes result, "Edit"
  end

  test "uses custom actions label" do
    result = l_ui_managed_table([mock_record("Alice")],
      columns: [{ attribute: :name }],
      actions: ->(r) { "Edit" },
      actions_label: "Options"
    )
    assert_includes result, "Options"
    assert_not_includes result, "Actions"
  end

  test "does not render actions column when actions is nil" do
    result = build_table([mock_record("Alice")])
    assert_not_includes result, "Actions"
    assert_not_includes result, "l-ui-table__cell--action"
  end

  test "calls actions proc with each record" do
    records = [mock_record("Alice"), mock_record("Bob")]
    names = []
    build_table(
      records,
      actions: ->(r) { names << r.name; "link" }
    )
    assert_equal ["Alice", "Bob"], names
  end

  # -- sort links --

  test "renders sort links when query is provided" do
    q = User.ransack({})
    result = l_ui_managed_table([mock_record("Alice")],
      columns: [{ attribute: :name }],
      query: q
    )
    assert_includes result, "l-ui-table__sort-link"
    assert_includes result, 'aria-sort="none"'
  end

  test "renders plain headers when query is nil" do
    result = build_table([mock_record("Alice")])
    assert_not_includes result, "l-ui-table__sort-link"
    assert_not_includes result, "aria-sort"
  end

  test "non-sortable columns render plain headers even with query" do
    q = User.ransack({})
    result = l_ui_managed_table([mock_record("Alice")],
      columns: [{ attribute: :name, sortable: false }],
      query: q
    )
    assert_not_includes result, "l-ui-table__sort-link"
    assert_includes result, '<th class="l-ui-table__header-cell" scope="col">Name</th>'
  end

  # -- nil values --

  test "handles nil attribute values" do
    record = mock_record("Alice", email: nil)
    result = build_table(
      [record],
      columns: [{ attribute: :name }, { attribute: :email }]
    )
    assert_includes result, '<td class="l-ui-table__cell"></td>'
  end

  private

  def build_table(records, columns: [{ attribute: :name }], caption: nil, actions: nil)
    l_ui_managed_table(records, columns: columns, caption: caption, actions: actions)
  end

  MockRecord = Struct.new(:name, :email, :created_at, keyword_init: true)

  def mock_record(name, **attrs)
    MockRecord.new(name: name, **attrs)
  end
end
