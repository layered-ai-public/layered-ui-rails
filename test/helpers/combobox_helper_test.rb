require "test_helper"

class ComboboxHelperTest < ActionView::TestCase
  include Layered::Ui::ComboboxHelper

  COLLECTION = [["Ruby", "1"], ["Rails", "2"], ["Hotwire", "3"]].freeze

  test "renders a container wired to the combobox controller" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION)

    assert_includes result, 'class="l-ui-combobox"'
    assert_includes result, 'data-controller="l-ui--combobox"'
    assert_includes result, 'data-l-ui--combobox-name-value="post[tag_ids][]"'
  end

  test "renders an input with the combobox role and listbox wiring" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, id: "tags")

    assert_includes result, 'role="combobox"'
    assert_includes result, 'aria-expanded="false"'
    assert_includes result, 'aria-controls="tags-listbox"'
    assert_includes result, 'aria-autocomplete="list"'
    assert_includes result, 'id="tags-input"'
  end

  test "renders the collection as listbox options" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, id: "tags")

    assert_includes result, '<ul id="tags-listbox" class="l-ui-combobox__listbox" role="listbox" hidden'
    assert_includes result, 'id="tags-option-0"'
    assert_includes result, 'data-value="1"'
    assert_includes result, 'data-label="Ruby"'
  end

  test "accepts hash, pair and plain string collections" do
    hashes = l_ui_combobox("f[a]", collection: [{ label: "Ruby", value: "1" }])
    strings = l_ui_combobox("f[a]", collection: %w[Ruby])

    assert_includes hashes, 'data-label="Ruby"'
    assert_includes hashes, 'data-value="1"'
    assert_includes strings, 'data-label="Ruby"'
    assert_includes strings, 'data-value="Ruby"'
  end

  test "renders selected values as tokens carrying hidden inputs" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, selected: [1, 3])

    assert_includes result, 'class="l-ui-combobox__token l-ui-tag"'
    assert_includes result, '<span class="l-ui-tag__label">Ruby</span>'
    assert_includes result, '<span class="l-ui-tag__label">Hotwire</span>'
    assert_includes result, '<input type="hidden" name="post[tag_ids][]" value="1"'
    assert_includes result, '<input type="hidden" name="post[tag_ids][]" value="3"'
  end

  test "marks selected options in the listbox" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, selected: [1], id: "tags")

    assert_includes result, 'id="tags-option-0" class="l-ui-combobox__option" role="option" aria-selected="true"'
    assert_includes result, 'id="tags-option-1" class="l-ui-combobox__option" role="option" aria-selected="false"'
  end

  test "always posts a blank value so clearing every token submits the field" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION)

    assert_includes result, '<input type="hidden" name="post[tag_ids][]" value=""'
  end

  test "gives each token a remove control with an accessible name" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, selected: [1])

    assert_includes result, 'class="l-ui-tag__remove"'
    assert_includes result, 'aria-label="Remove Ruby"'
    assert_includes result, 'data-action="l-ui--combobox#removeToken"'
  end

  test "multiple is the default and marks the listbox multiselectable" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION)

    assert_includes result, 'data-l-ui--combobox-multiple-value="true"'
    assert_includes result, 'aria-multiselectable="true"'
  end

  test "multiple: false drops the array suffix and the multiselectable flag" do
    result = l_ui_combobox("post[category_id]", collection: COLLECTION, multiple: false)

    assert_includes result, 'data-l-ui--combobox-multiple-value="false"'
    assert_includes result, 'data-l-ui--combobox-name-value="post[category_id]"'
    refute_includes result, "aria-multiselectable"
  end

  test "multiple: false keeps only the first selected value" do
    result = l_ui_combobox("post[category_id]", collection: COLLECTION, multiple: false, selected: [1, 2])

    assert_includes result, '<span class="l-ui-tag__label">Ruby</span>'
    refute_includes result, '<span class="l-ui-tag__label">Rails</span>'
  end

  test "create: true requires create_name:" do
    error = assert_raises(ArgumentError) do
      l_ui_combobox("post[tag_ids]", collection: COLLECTION, create: true)
    end

    assert_match(/create_name:/, error.message)
  end

  test "created values post under the create parameter" do
    result = l_ui_combobox("post[tag_ids]",
                           collection: COLLECTION,
                           selected: [1, "urgent"],
                           create: true,
                           create_name: "post[new_tag_names]")

    assert_includes result, 'data-l-ui--combobox-create-value="true"'
    assert_includes result, 'data-l-ui--combobox-create-name-value="post[new_tag_names][]"'
    assert_includes result, '<input type="hidden" name="post[tag_ids][]" value="1"'
    assert_includes result, '<input type="hidden" name="post[new_tag_names][]" value="urgent"'
    assert_includes result, 'data-new="true"'
  end

  test "a selected value outside the collection is rejected unless create is set" do
    error = assert_raises(ArgumentError) do
      l_ui_combobox("post[tag_ids]", collection: COLLECTION, selected: ["urgent"])
    end

    assert_match(/not in the collection/, error.message)
  end

  test "reorder is off by default" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, selected: [1])

    assert_includes result, 'data-l-ui--combobox-reorder-value="false"'
    refute_includes result, "l-ui-combobox__move"
    refute_includes result, "l-ui-combobox__grip"
    refute_includes result, "draggable"
  end

  test "a draggable token carries a decorative grip handle" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, selected: [1], reorder: true)

    assert_includes result, "l-ui-combobox__token--draggable"
    assert_includes result, '<span class="l-ui-combobox__grip" aria-hidden="true">'
  end

  test "a disabled token is neither draggable nor gripped" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, selected: [1],
                           reorder: true, disabled: true)

    refute_includes result, "l-ui-combobox__token--draggable"
    refute_includes result, "l-ui-combobox__grip"
    refute_includes result, 'draggable="true"'
  end

  test "the disabled state is exposed to the controller" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, selected: [1],
                           reorder: true, disabled: true)

    assert_includes result, 'data-l-ui--combobox-disabled-value="true"'

    enabled = l_ui_combobox("post[tag_ids]", collection: COLLECTION, selected: [1], reorder: true)

    assert_includes enabled, 'data-l-ui--combobox-disabled-value="false"'
  end

  test "reorder: true adds move controls and drag wiring" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, selected: [1], reorder: true)

    assert_includes result, 'aria-label="Move Ruby earlier"'
    assert_includes result, 'aria-label="Move Ruby later"'
    assert_includes result, 'data-action="l-ui--combobox#moveTokenEarlier"'
    assert_includes result, 'draggable="true"'
    assert_includes result, "dragstart-&gt;l-ui--combobox#dragstart"
  end

  test "renders a label bound to the input" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, label: "Tags", id: "tags")

    assert_includes result, '<label class="l-ui-label" for="tags-input">Tags'
  end

  test "required marks the label and the input" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, label: "Tags", required: true)

    assert_includes result, 'class="l-ui-form__required"'
    assert_includes result, 'aria-required="true"'
  end

  test "a hint is rendered and referenced by the input" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, hint: "Pick a few", id: "tags")

    assert_includes result, '<p id="tags-hint" class="l-ui-form__hint">Pick a few</p>'
    assert_includes result, 'aria-describedby="tags-hint tags-instructions"'
  end

  test "keyboard instructions are always described to the input" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, id: "tags")

    assert_includes result, 'aria-describedby="tags-instructions"'
    assert_includes result, '<span id="tags-instructions" class="l-ui-sr-only">'
  end

  test "disabled disables the input and the token controls" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION, selected: [1], disabled: true)

    assert_includes result, "l-ui-combobox__control--disabled"
    assert_includes result, '<input type="text" id='
    assert_includes result, "disabled"
    refute_includes result, 'draggable="true"'
  end

  test "renders a polite status region for announcements" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION)

    assert_includes result, 'role="status" aria-live="polite"'
  end

  test "renders a token template for client-side selections" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION)

    assert_includes result, '<template data-l-ui--combobox-target="template">'
  end

  test "container attributes are merged and the controller is preserved" do
    result = l_ui_combobox("post[tag_ids]", collection: COLLECTION,
                           container: { class: "mt-8", data: { controller: "custom" } })

    assert_includes result, 'class="l-ui-combobox mt-8"'
    assert_includes result, 'data-controller="custom l-ui--combobox"'
  end

  test "derives parameter names from a form builder" do
    post = Post.new
    form = ActionView::Helpers::FormBuilder.new(:post, post, self, {})
    result = l_ui_combobox(:tag_ids, form: form, collection: COLLECTION,
                           create: true, create_name: :new_tag_names)

    assert_includes result, 'data-l-ui--combobox-name-value="post[tag_ids][]"'
    assert_includes result, 'data-l-ui--combobox-create-name-value="post[new_tag_names][]"'
  end
end
