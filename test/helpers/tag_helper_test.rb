require "test_helper"

class TagHelperTest < ActionView::TestCase
  include Layered::Ui::TagHelper

  test "renders container div with l-ui-tag class" do
    result = l_ui_tag do |t|
      t.text "Ruby"
    end

    assert_includes result, '<div class="l-ui-tag">'
  end

  test "is not rounded by default" do
    result = l_ui_tag do |t|
      t.text "Ruby"
    end

    refute_includes result, "l-ui-tag--rounded"
  end

  test "rounded: true adds the rounded modifier" do
    result = l_ui_tag(rounded: true) do |t|
      t.text "Ruby"
    end

    assert_includes result, '<div class="l-ui-tag l-ui-tag--rounded">'
  end

  test "renders text segment as a span with a label wrapper" do
    result = l_ui_tag do |t|
      t.text "Ruby"
    end

    assert_includes result, '<span class="l-ui-tag__text"><span class="l-ui-tag__label">Ruby</span></span>'
  end

  test "text segment accepts a block" do
    result = l_ui_tag do |t|
      t.text { concat "Rails" }
    end

    assert_includes result, '<span class="l-ui-tag__text"><span class="l-ui-tag__label">Rails</span></span>'
  end

  test "renders button segment with type button" do
    result = l_ui_tag do |t|
      t.button { concat "Status: Active" }
    end

    assert_includes result, '<button class="l-ui-tag__button" type="button"><span class="l-ui-tag__label">Status: Active</span></button>'
  end

  test "renders link segment styled as a button segment" do
    result = l_ui_tag do |t|
      t.link("/tags/ruby") { concat "Ruby" }
    end

    assert_includes result, '<a class="l-ui-tag__button" href="/tags/ruby"><span class="l-ui-tag__label">Ruby</span></a>'
  end

  test "renders remove segment as a button with the default icon when no url is given" do
    result = l_ui_tag do |t|
      t.text "Ruby"
      t.remove aria: { label: "Remove Ruby" }
    end

    assert_match(/<button[^>]*class="l-ui-tag__remove"[^>]*type="button"/, result)
    assert_includes result, 'aria-label="Remove Ruby"'
    assert_includes result, "<svg"
    assert_includes result, 'class="l-ui-icon--sm"'
    assert_includes result, 'aria-hidden="true"'
  end

  test "renders remove segment as a link when a url is given" do
    result = l_ui_tag do |t|
      t.text "Ruby"
      t.remove "/tags/ruby/remove", aria: { label: "Remove Ruby" }
    end

    assert_match(/<a[^>]*class="l-ui-tag__remove"[^>]*href="\/tags\/ruby\/remove"/, result)
    assert_includes result, 'aria-label="Remove Ruby"'
    assert_includes result, "<svg"
  end

  test "remove segment accepts custom content via a block" do
    result = l_ui_tag do |t|
      t.remove(aria: { label: "Remove" }) { concat "x" }
    end

    assert_includes result, ">x</button>"
    refute_includes result, "<svg"
  end

  test "segments render in call order" do
    result = l_ui_tag do |t|
      t.text "Ruby"
      t.remove aria: { label: "Remove Ruby" }
    end

    assert_match(/l-ui-tag__text.*l-ui-tag__remove/m, result)
  end

  test "renders without popover wiring when no popover is declared" do
    result = l_ui_tag do |t|
      t.button { concat "Open" }
    end

    refute_includes result, "data-controller"
    refute_includes result, "popovertarget"
  end

  test "popover makes the whole tag the placement target" do
    result = l_ui_tag do |t|
      t.button { concat "Open" }
      t.popover(id: "p1") { concat "Body" }
    end

    assert_includes result, 'data-controller="l-ui--popover"'
    assert_includes result, 'data-l-ui--popover-target="trigger"'
    assert_includes result, 'data-l-ui--popover-placement-value="bottom"'
    assert_includes result, 'data-l-ui--popover-align-value="start"'
  end

  test "popover honours placement and align options" do
    result = l_ui_tag do |t|
      t.button { concat "Open" }
      t.popover(id: "p1", placement: :top, align: :end) { concat "Body" }
    end

    assert_includes result, 'data-l-ui--popover-placement-value="top"'
    assert_includes result, 'data-l-ui--popover-align-value="end"'
  end

  test "popover is not open on connect by default" do
    result = l_ui_tag do |t|
      t.button { concat "Open" }
      t.popover(id: "p1") { concat "Body" }
    end

    refute_includes result, "data-l-ui--popover-open-value"
  end

  test "popover honours open option" do
    result = l_ui_tag do |t|
      t.button { concat "Open" }
      t.popover(id: "p1", open: true) { concat "Body" }
    end

    assert_includes result, 'data-l-ui--popover-open-value="true"'
  end

  test "popover element renders last with id, popover attribute, and target" do
    result = l_ui_tag do |t|
      t.popover(id: "p1") { concat "Body" }
      t.button { concat "Open" }
      t.remove aria: { label: "Remove" }
    end

    assert_includes result, '<div id="p1" popover="auto" class="l-ui-popover"'
    assert_includes result, 'data-l-ui--popover-target="popover"'
    assert_includes result, ">Body</div>"
    assert_match(/l-ui-tag__remove.*l-ui-popover/m, result)
  end

  test "button segments open the tag's popover via popovertarget" do
    result = l_ui_tag do |t|
      t.button { concat "Open" }
      t.popover(id: "p1") { concat "Body" }
    end

    assert_includes result, 'popovertarget="p1"'
  end

  test "button segment declared before the popover is still wired to it" do
    result = l_ui_tag do |t|
      t.button { concat "Open" }
      t.popover(id: "p1") { concat "Body" }
    end

    assert_match(/<button[^>]*popovertarget="p1"/, result)
  end

  test "generates a popover id when none is given" do
    result = l_ui_tag do |t|
      t.button { concat "Open" }
      t.popover { concat "Body" }
    end

    assert_match(/popovertarget="l-ui-tag-popover-[0-9a-f]+"/, result)
  end

  test "merges container attributes" do
    result = l_ui_tag(container: { class: "mt-4", id: "chip-1" }) do |t|
      t.text "Ruby"
    end

    assert_includes result, 'class="l-ui-tag mt-4"'
    assert_includes result, 'id="chip-1"'
  end

  test "merges existing data-controller from container when a popover is declared" do
    result = l_ui_tag(container: { data: { controller: "foo" } }) do |t|
      t.button { concat "Open" }
      t.popover(id: "p1") { concat "Body" }
    end

    assert_includes result, 'data-controller="foo l-ui--popover"'
  end

  test "segment options are merged as HTML attributes" do
    result = l_ui_tag do |t|
      t.text "Ruby"
      t.remove "/remove", aria: { label: "Remove Ruby" },
        data: { turbo_frame: "list", turbo_action: "advance" }
    end

    assert_includes result, 'data-turbo-frame="list"'
    assert_includes result, 'data-turbo-action="advance"'
  end
end
