require "test_helper"

class ModalHelperTest < ActionView::TestCase
  include Layered::Ui::ModalHelper

  test "renders wrapper with Stimulus controller" do
    result = l_ui_modal(title: "Hello", id: "m1") do |m|
      m.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, 'data-controller="l-ui--modal"'
  end

  test "renders trigger button wired to open action" do
    result = l_ui_modal(title: "Hello", id: "m1") do |m|
      m.trigger(class: "l-ui-button") { concat "Open" }
      concat "Body"
    end

    assert_includes result, '<button class="l-ui-button"'
    assert_includes result, 'type="button"'
    assert_includes result, 'data-action="l-ui--modal#open"'
    assert_includes result, ">Open</button>"
  end

  test "renders dialog with id, target, backdrop action and aria-labelledby" do
    result = l_ui_modal(title: "Hello", id: "m1") do |m|
      m.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, '<dialog id="m1" class="l-ui-modal"'
    assert_includes result, 'data-l-ui--modal-target="dialog"'
    assert_includes result, 'data-action="click-&gt;l-ui--modal#closeOnBackdrop"'
    assert_includes result, 'aria-labelledby="m1-heading"'
    assert_includes result, '<h3 id="m1-heading">Hello</h3>'
  end

  test "renders close button in header" do
    result = l_ui_modal(title: "Hello", id: "m1") do |m|
      m.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, 'aria-label="Close"'
    assert_includes result, 'data-action="l-ui--modal#close"'
  end

  test "wraps block content in l-ui-modal__body" do
    result = l_ui_modal(title: "Hello", id: "m1") do |m|
      m.trigger { concat "Open" }
      concat "Body content"
    end

    assert_includes result, '<div class="l-ui-modal__body">Body content</div>'
  end

  test "renders without a trigger when m.trigger is not called" do
    result = l_ui_modal(title: "Hello", id: "m1") do |_m|
      concat "Body"
    end

    assert_includes result, '<dialog id="m1"'
    assert_includes result, '<div class="l-ui-modal__body">Body</div>'
    refute_includes result, 'data-action="l-ui--modal#open"'
  end

  test "merges container attributes" do
    result = l_ui_modal(title: "Hello", id: "m1", container: { class: "mt-4" }) do |m|
      m.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, 'class="mt-4"'
    assert_includes result, 'data-controller="l-ui--modal"'
  end

  test "honours heading_level option" do
    result = l_ui_modal(title: "Hello", id: "m1", heading_level: :h2) do |m|
      m.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, '<h2 id="m1-heading">Hello</h2>'
  end

  test "merges existing data-controller from container" do
    result = l_ui_modal(title: "Hello", id: "m1", container: { data: { controller: "foo" } }) do |m|
      m.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, 'data-controller="foo l-ui--modal"'
  end

  test "merges existing data-controller from container with string key" do
    result = l_ui_modal(title: "Hello", id: "m1", container: { data: { "controller" => "foo" } }) do |m|
      m.trigger { concat "Open" }
      concat "Body"
    end

    assert_includes result, 'data-controller="foo l-ui--modal"'
    assert_equal 1, result.scan('data-controller').size
  end

  test "preserves caller's data-action on trigger and appends open action" do
    result = l_ui_modal(title: "Hello", id: "m1") do |m|
      m.trigger(data: { action: "analytics#track" }) { concat "Open" }
      concat "Body"
    end

    assert_includes result, 'data-action="analytics#track l-ui--modal#open"'
    assert_equal 1, result.scan(/<button[^>]*data-action="analytics#track l-ui--modal#open"/).size
  end

  test "preserves caller's data-action on trigger with string key" do
    result = l_ui_modal(title: "Hello", id: "m1") do |m|
      m.trigger(data: { "action" => "analytics#track" }) { concat "Open" }
      concat "Body"
    end

    assert_includes result, 'data-action="analytics#track l-ui--modal#open"'
  end
end
