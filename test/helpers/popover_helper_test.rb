require "test_helper"

class PopoverHelperTest < ActionView::TestCase
  include Layered::Ui::PopoverHelper

  test "renders wrapper with Stimulus controller and default placement and align" do
    result = l_ui_popover(id: "p1") do |p|
      p.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, 'data-controller="l-ui--popover"'
    assert_includes result, 'data-l-ui--popover-placement-value="bottom"'
    assert_includes result, 'data-l-ui--popover-align-value="start"'
  end

  test "honours placement option" do
    result = l_ui_popover(id: "p1", placement: :right) do |p|
      p.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, 'data-l-ui--popover-placement-value="right"'
  end

  test "honours align option" do
    result = l_ui_popover(id: "p1", align: :end) do |p|
      p.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, 'data-l-ui--popover-align-value="end"'
  end

  test "renders trigger button wired to the popover via popovertarget" do
    result = l_ui_popover(id: "p1") do |p|
      p.trigger(class: "l-ui-button") { concat "Open" }
      concat "Body"
    end

    assert_includes result, '<button class="l-ui-button"'
    assert_includes result, 'type="button"'
    assert_includes result, 'popovertarget="p1"'
    assert_includes result, 'data-l-ui--popover-target="trigger"'
    assert_includes result, ">Open</button>"
  end

  test "renders popover element with id, popover attribute, and target" do
    result = l_ui_popover(id: "p1") do |p|
      p.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, '<div id="p1" popover="auto" class="l-ui-popover"'
    assert_includes result, 'data-l-ui--popover-target="popover"'
  end

  test "wraps block content in l-ui-popover" do
    result = l_ui_popover(id: "p1") do |p|
      p.trigger { concat "Open" }
      concat "Body content"
    end

    assert_includes result, '>Body content</div>'
  end

  test "renders without a trigger when p.trigger is not called" do
    result = l_ui_popover(id: "p1") do |_p|
      concat "Body"
    end

    assert_includes result, '<div id="p1" popover="auto"'
    refute_includes result, "popovertarget"
  end

  test "merges container attributes" do
    result = l_ui_popover(id: "p1", container: { class: "mt-4" }) do |p|
      p.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, 'class="mt-4"'
    assert_includes result, 'data-controller="l-ui--popover"'
  end

  test "merges existing data-controller from container" do
    result = l_ui_popover(id: "p1", container: { data: { controller: "foo" } }) do |p|
      p.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, 'data-controller="foo l-ui--popover"'
  end

  test "generates an id when none is given" do
    result = l_ui_popover do |p|
      p.trigger { concat "Open" }
      concat "Body"
    end

    assert_match(/popovertarget="l-ui-popover-[0-9a-f]+"/, result)
  end
end
