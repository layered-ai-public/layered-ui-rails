require "test_helper"

# The dummy app has both Ransack and Pagy, so its endpoint exercises those
# paths of Layered::Ui::ComboboxOptions - and the JSON contract the combobox's
# remote search relies on.
class ComboboxOptionsEndpointTest < ActionDispatch::IntegrationTest
  def setup
    @users = ["Ada Lovelace", "Alan Turing", "Grace Hopper"].map.with_index do |name, index|
      User.create!(name: name, email: "endpoint-#{index}-#{SecureRandom.hex(4)}@test.com",
                   password: "notasecret123", confirmed_at: Time.current)
    end
  end

  test "answers with the labelled options for a term" do
    get "/combobox_options", params: { term: "Lovelace" }

    assert_response :success
    payload = response.parsed_body

    assert_equal [{ "label" => "Ada Lovelace", "value" => @users.first.id.to_s }], payload["options"]
    assert_equal 1, payload["count"]
    assert_equal 1, payload["pages"]
    assert_equal 1, payload["page"]
  end

  test "matches any of the searched attributes" do
    get "/combobox_options", params: { term: @users.last.email }

    assert_equal ["Grace Hopper"], response.parsed_body["options"].map { |option| option["label"] }
  end

  test "a term matching nothing answers with an empty list rather than an error" do
    get "/combobox_options", params: { term: "Zzzzz" }

    assert_response :success
    assert_empty response.parsed_body["options"]
    assert_equal 0, response.parsed_body["count"]
  end

  test "pages are taken with Pagy and reported alongside the options" do
    get "/combobox_options"

    payload = response.parsed_body

    # The endpoint's limit is 8, and the dummy app is seeded with more people
    # than that in development - here only the ones created above exist.
    assert_operator payload["options"].length, :<=, 8
    assert_equal User.count, payload["count"]
    assert_equal (User.count / 8.0).ceil, payload["pages"]
  end

  test "a page beyond the last is empty rather than an error" do
    get "/combobox_options", params: { page: 99 }

    assert_response :success
    assert_empty response.parsed_body["options"]
  end
end
