require "test_helper"

class FormHelperTest < ActionView::TestCase
  include Layered::Ui::FormHelper

  # -- type auto-detection (via normalise) --

  test "detects string type for string column" do
    config = l_ui_normalise_field(Post.new, { attribute: :title })
    assert_equal :string, config[:as]
  end

  test "detects text type for text column" do
    config = l_ui_normalise_field(Post.new, { attribute: :body })
    assert_equal :text, config[:as]
  end

  test "detects datetime type for datetime column" do
    config = l_ui_normalise_field(Post.new, { attribute: :created_at })
    assert_equal :datetime, config[:as]
  end

  test "detects number type for integer column" do
    config = l_ui_normalise_field(Post.new, { attribute: :user_id })
    assert_equal :number, config[:as]
  end

  test "falls back to string for virtual attributes" do
    config = l_ui_normalise_field(Post.new, { attribute: :nonexistent_attr })
    assert_equal :string, config[:as]
  end

  # -- normalise --

  test "normalise sets defaults from column type" do
    config = l_ui_normalise_field(Post.new, { attribute: :title })
    assert_equal :title, config[:attribute]
    assert_equal :string, config[:as]
    assert_equal "Title", config[:label]
    assert_equal false, config[:required]
    assert_nil config[:hint]
  end

  # -- field rendering --

  test "renders string field with correct class" do
    result = render_field({ attribute: :title })
    assert_includes result, 'class="l-ui-form__field"'
    assert_includes result, 'type="text"'
  end

  test "renders text field as textarea" do
    result = render_field({ attribute: :body, as: :text })
    assert_includes result, "<textarea"
    assert_includes result, 'class="l-ui-form__field"'
    assert_includes result, 'rows="4"'
  end

  test "renders email field" do
    result = render_field({ attribute: :title, as: :email })
    assert_includes result, 'type="email"'
    assert_includes result, 'class="l-ui-form__field"'
  end

  test "renders number field" do
    result = render_field({ attribute: :user_id, as: :number })
    assert_includes result, 'type="number"'
  end

  test "renders date field" do
    result = render_field({ attribute: :created_at, as: :date })
    assert_includes result, 'type="date"'
  end

  test "renders datetime field" do
    result = render_field({ attribute: :created_at, as: :datetime })
    assert_includes result, 'datetime'
  end

  test "renders hidden field without group wrapper" do
    result = render_field({ attribute: :user_id, as: :hidden })
    assert_includes result, 'type="hidden"'
    assert_not_includes result, "l-ui-form__group"
    assert_not_includes result, "l-ui-label"
  end

  test "renders select field with static collection" do
    result = render_field({
      attribute: :user_id, as: :select,
      collection: [["Alice", 1], ["Bob", 2]]
    })
    assert_includes result, "l-ui-select-container"
    assert_includes result, "l-ui-select"
    assert_includes result, "<option"
    assert_includes result, "Alice"
  end

  test "renders select field with proc collection" do
    called = false
    result = render_field({
      attribute: :user_id, as: :select,
      collection: -> { called = true; [["Alice", 1]] }
    })
    assert called, "Proc collection should be called at render time"
    assert_includes result, "Alice"
  end

  test "renders checkbox field" do
    result = render_field({ attribute: :user_id, as: :checkbox })
    assert_includes result, "l-ui-checkbox-container"
    assert_includes result, 'type="checkbox"'
    assert_includes result, "l-ui-checkbox-container__label"
  end

  test "checkbox does not render duplicate shared label" do
    result = render_field({ attribute: :user_id, as: :checkbox })
    assert_not_includes result, "l-ui-label\"", "Checkbox should not render the shared label partial"
  end

  # -- labels --

  test "auto-generates label from attribute name" do
    result = render_field({ attribute: :title })
    assert_includes result, "l-ui-label"
    assert_includes result, "Title"
  end

  test "uses custom label when provided" do
    result = render_field({ attribute: :user_id, label: "Author" })
    assert_includes result, "Author"
  end

  test "renders required indicator" do
    result = render_field({ attribute: :title, required: true })
    assert_includes result, "l-ui-form__required"
    assert_includes result, "(required)"
  end

  test "does not render required indicator when not required" do
    result = render_field({ attribute: :title })
    assert_not_includes result, "l-ui-form__required"
  end

  # -- hints --

  test "renders hint text" do
    result = render_field({ attribute: :title, hint: "Enter a descriptive title" })
    assert_includes result, "l-ui-form__hint"
    assert_includes result, "Enter a descriptive title"
  end

  test "does not render hint when nil" do
    result = render_field({ attribute: :title })
    assert_not_includes result, "l-ui-form__hint"
  end

  # -- field errors --

  test "renders field error element" do
    result = render_field({ attribute: :title })
    assert_includes result, "l-ui-form__field-error"
    assert_includes result, "post_title_error"
  end

  # -- aria-describedby --

  test "sets aria-describedby to error id" do
    result = render_field({ attribute: :title })
    assert_includes result, 'aria-describedby="post_title_error"'
  end

  test "sets aria-describedby to hint and error ids when hint present" do
    result = render_field({ attribute: :title, hint: "Help text" })
    assert_includes result, 'aria-describedby="post_title_hint post_title_error"'
  end

  test "hidden field does not get aria-describedby" do
    result = render_field({ attribute: :user_id, as: :hidden })
    assert_not_includes result, "aria-describedby"
  end

  # -- placeholder --

  test "renders placeholder" do
    result = render_field({ attribute: :title, placeholder: "Enter title" })
    assert_includes result, 'placeholder="Enter title"'
  end

  # -- extra options pass-through --

  test "passes extra options to text area" do
    result = render_field({ attribute: :body, as: :text, rows: 8 })
    assert_includes result, 'rows="8"'
  end

  # -- type validation --

  test "raises ArgumentError for unsupported field type" do
    error = assert_raises(ArgumentError) do
      l_ui_normalise_field(Post.new, { attribute: :title, as: :banana })
    end
    assert_includes error.message, ":banana"
    assert_includes error.message, "Unsupported field type"
  end

  test "raises ArgumentError for select without collection" do
    error = assert_raises(ArgumentError) do
      l_ui_normalise_field(Post.new, { attribute: :user_id, as: :select })
    end
    assert_includes error.message, ":select"
    assert_includes error.message, ":collection"
  end

  private

  def render_field(field_config)
    record = Post.new
    config = l_ui_normalise_field(record, field_config)
    builder = ActionView::Helpers::FormBuilder.new(
      record.model_name.param_key, record, self, {}
    )
    render partial: "layered/ui/managed_resource/field",
           locals: { form: builder, record: record, config: config }
    rendered
  end
end
