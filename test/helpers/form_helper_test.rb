require "test_helper"

class FormHelperTest < ActionView::TestCase
  include Layered::Ui::FormHelper
  include Layered::Ui::ComboboxHelper

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

  test "renders password field" do
    result = render_field({ attribute: :title, as: :password })
    assert_includes result, 'type="password"'
    assert_includes result, 'class="l-ui-form__field"'
  end

  test "renders tel field (maps to telephone_field)" do
    result = render_field({ attribute: :title, as: :tel })
    assert_includes result, 'type="tel"'
    assert_includes result, 'class="l-ui-form__field"'
  end

  test "renders url field" do
    result = render_field({ attribute: :title, as: :url })
    assert_includes result, 'type="url"'
  end

  test "renders search field" do
    result = render_field({ attribute: :title, as: :search })
    assert_includes result, 'type="search"'
  end

  test "renders time field" do
    result = render_field({ attribute: :created_at, as: :time })
    assert_includes result, 'type="time"'
  end

  test "renders month field" do
    result = render_field({ attribute: :created_at, as: :month })
    assert_includes result, 'type="month"'
  end

  test "renders week field" do
    result = render_field({ attribute: :created_at, as: :week })
    assert_includes result, 'type="week"'
  end

  test "renders color field" do
    result = render_field({ attribute: :title, as: :color })
    assert_includes result, 'type="color"'
  end

  test "renders range field" do
    result = render_field({ attribute: :user_id, as: :range })
    assert_includes result, 'type="range"'
  end

  test "renders file field" do
    result = render_field({ attribute: :title, as: :file })
    assert_includes result, 'type="file"'
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

  # -- multipart auto-detection --

  test "form auto-enables multipart when any field is :file" do
    result = render_form(fields: [
      { attribute: :title },
      { attribute: :body, as: :file }
    ])
    assert_includes result, 'enctype="multipart/form-data"'
  end

  test "form omits multipart when no :file fields" do
    result = render_form(fields: [{ attribute: :title }, { attribute: :body, as: :text }])
    assert_not_includes result, 'enctype="multipart/form-data"'
  end

  test "multipart: true forces multipart without any :file field" do
    result = render_form(fields: [{ attribute: :title }], multipart: true)
    assert_includes result, 'enctype="multipart/form-data"'
  end

  # -- combobox --

  test "renders combobox field with static collection" do
    result = render_field({
      attribute: :user_id, as: :combobox, label: "Author", multiple: false,
      collection: [["Ada", 1], ["Grace", 2]]
    })
    assert_includes result, "l-ui-combobox"
    assert_includes result, 'role="combobox"'
    assert_includes result, 'name="post[user_id]"'
    assert_includes result, "Grace"
  end

  test "combobox field renders its own label rather than the shared one" do
    result = render_field({
      attribute: :user_id, as: :combobox, label: "Author",
      collection: [["Ada", 1]]
    })
    assert_equal 1, result.scan("Author").size
    assert_includes result, 'class="l-ui-label"'
  end

  test "combobox field describes the error element" do
    result = render_field({
      attribute: :user_id, as: :combobox, collection: [["Ada", 1]]
    })
    assert_includes result, "post_user_id_error"
    assert_match(/aria-describedby="[^"]*post_user_id_error/, result)
  end

  test "combobox field renders its hint once, bound to the input" do
    result = render_field({
      attribute: :user_id, as: :combobox, hint: "Start typing a name",
      collection: [["Ada", 1]]
    })
    assert_equal 1, result.scan("Start typing a name").size
    assert_includes result, "l-ui-form__hint"
  end

  test "combobox field selects the record's current value" do
    record = Post.new(user_id: 2)
    config = l_ui_normalise_field(record, {
      attribute: :user_id, as: :combobox, multiple: false,
      collection: [["Ada", 1], ["Grace", 2]]
    })
    builder = ActionView::Helpers::FormBuilder.new(
      record.model_name.param_key, record, self, {}
    )
    render partial: "layered/ui/managed_resource/field",
           locals: { form: builder, record: record, config: config }
    assert_includes rendered, "l-ui-combobox__token"
    assert_includes rendered, "Grace"
  end

  test "remote combobox field raises when the record has a value and no selection" do
    error = assert_raises(ArgumentError) do
      l_ui_normalise_field(Post.new(user_id: 2), {
        attribute: :user_id, as: :combobox, multiple: false, url: "/options/users"
      })
    end
    assert_includes error.message, ":selected"
  end

  test "remote combobox field renders a labelled selection for an existing value" do
    record = Post.new(user_id: 2)
    config = l_ui_normalise_field(record, {
      attribute: :user_id, as: :combobox, multiple: false, url: "/options/users",
      selected: [["Grace", 2]]
    })
    builder = ActionView::Helpers::FormBuilder.new(
      record.model_name.param_key, record, self, {}
    )
    render partial: "layered/ui/managed_resource/field",
           locals: { form: builder, record: record, config: config }
    assert_includes rendered, "l-ui-combobox__token"
    assert_includes rendered, "Grace"
  end

  test "combobox field is single by default, so a scalar attribute posts a scalar" do
    result = render_field({
      attribute: :user_id, as: :combobox, collection: [["Ada", 1], ["Grace", 2]]
    })
    assert_includes result, 'name="post[user_id]"'
    assert_not_includes result, 'name="post[user_id][]"'
    assert_includes result, 'data-l-ui--combobox-multiple-value="false"'
  end

  test "combobox field on an _ids attribute is multiple" do
    result = render_field({
      attribute: :tag_ids, as: :combobox, collection: [["Ada", 1], ["Grace", 2]]
    })
    assert_includes result, 'name="post[tag_ids][]"'
    assert_includes result, 'data-l-ui--combobox-multiple-value="true"'
  end

  test "combobox field on an array column is multiple even when the value is nil" do
    record = ArrayColumnRecord.new
    assert_nil record.tags
    config = l_ui_normalise_field(record, {
      attribute: :tags, as: :combobox, collection: [["Urgent", "urgent"]]
    })
    assert_equal true, config[:extras][:multiple]
  end

  test "combobox field honours an explicit multiple over the inferred one" do
    result = render_field({
      attribute: :user_id, as: :combobox, multiple: true, collection: [["Ada", 1]]
    })
    assert_includes result, 'name="post[user_id][]"'
    assert_includes result, 'data-l-ui--combobox-multiple-value="true"'
  end

  test "combobox field passes remote options through" do
    result = render_field({
      attribute: :user_id, as: :combobox, url: "/options/users", min_chars: 2
    })
    assert_includes result, 'data-l-ui--combobox-url-value="/options/users"'
    assert_includes result, 'data-l-ui--combobox-min-chars-value="2"'
  end

  test "combobox field keeps the error element alongside a given describedby" do
    result = render_field({
      attribute: :user_id, as: :combobox, collection: [["Ada", 1]],
      describedby: "extra-note"
    })
    assert_match(/aria-describedby="[^"]*post_user_id_error[^"]*extra-note/, result)
  end

  test "combobox field raises for an option it cannot take" do
    error = assert_raises(ArgumentError) do
      l_ui_normalise_field(Post.new, {
        attribute: :user_id, as: :combobox, collection: [["Ada", 1]], autofocus: true
      })
    end
    assert_includes error.message, ":autofocus"
    assert_includes error.message, "container:"
  end

  test "combobox field raises for a select-only prompt" do
    error = assert_raises(ArgumentError) do
      l_ui_normalise_field(Post.new, {
        attribute: :user_id, as: :combobox, collection: [["Ada", 1]], prompt: "Choose an author"
      })
    end
    assert_includes error.message, ":prompt"
    assert_includes error.message, "placeholder:"
  end

  test "combobox field raises for a select-only include_blank" do
    error = assert_raises(ArgumentError) do
      l_ui_normalise_field(Post.new, {
        attribute: :user_id, as: :combobox, collection: [["Ada", 1]], include_blank: false
      })
    end
    assert_includes error.message, ":include_blank"
    assert_includes error.message, "already blank"
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

  test "raises ArgumentError for combobox without collection or url" do
    error = assert_raises(ArgumentError) do
      l_ui_normalise_field(Post.new, { attribute: :user_id, as: :combobox })
    end
    assert_includes error.message, ":combobox"
    assert_includes error.message, ":collection"
    assert_includes error.message, ":url"
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

  def render_form(fields:, multipart: nil)
    record = Post.new
    render partial: "layered/ui/managed_resource/form",
           locals: { record: record, fields: fields, url: "/posts",
                     method: nil, submit: nil, multipart: multipart }
    rendered
  end

  # Array columns are PostgreSQL-only and the dummy app runs on SQLite, so the
  # column is stood in for, as is the record carrying it: normalising a field
  # with an explicit :as asks the class only for its columns and the record only
  # for its value. The column has no default, which is what leaves a new
  # record's value nil rather than an empty array.
  class ArrayColumn
    def array?
      true
    end
  end

  class ArrayColumnRecord
    def self.columns_hash
      { "tags" => ArrayColumn.new }
    end

    def tags
      nil
    end
  end
end
