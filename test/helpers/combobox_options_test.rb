require "test_helper"

# Exercises the plain-Active-Record path: this endpoint has no `pagy` method,
# so pages come from limit/offset. The Pagy path is covered by the dummy app's
# own endpoint in test/integration/combobox_options_test.rb.
class ComboboxOptionsPayloadTest < ActiveSupport::TestCase
  class Endpoint
    include Layered::Ui::ComboboxOptions

    attr_reader :params

    def initialize(params = {})
      @params = params.with_indifferent_access
    end
  end

  def setup
    @names = ["Ada Lovelace", "Alan Turing", "Grace Hopper"]
    @users = @names.map.with_index do |name, index|
      User.create!(name: name, email: "combobox-#{index}-#{SecureRandom.hex(4)}@test.com",
                   password: "notasecret123", confirmed_at: Time.current)
    end
  end

  test "returns every option with its label and value when no term is given" do
    payload = Endpoint.new.l_ui_combobox_options(User.where(id: @users), label: :name)

    assert_equal @names, payload[:options].map { |option| option[:label] }
    assert_equal @users.map { |user| user.id.to_s }, payload[:options].map { |option| option[:value] }
    assert_equal 3, payload[:count]
    assert_equal 1, payload[:pages]
    assert_equal 1, payload[:page]
  end

  test "searches the term against the given attributes" do
    payload = Endpoint.new(term: "Turing").l_ui_combobox_options(
      User.where(id: @users), label: :name, search: [:name, :email]
    )

    assert_equal ["Alan Turing"], payload[:options].map { |option| option[:label] }
    assert_equal 1, payload[:count]
  end

  test "searches the label attribute when no search attributes are given" do
    payload = Endpoint.new(term: "Ada").l_ui_combobox_options(User.where(id: @users), label: :name)

    assert_equal ["Ada Lovelace"], payload[:options].map { |option| option[:label] }
  end

  test "the term can be passed explicitly instead of coming from the params" do
    payload = Endpoint.new(term: "Ada").l_ui_combobox_options(
      User.where(id: @users), label: :name, term: "Grace"
    )

    assert_equal ["Grace Hopper"], payload[:options].map { |option| option[:label] }
  end

  test "pages the matches and reports how many there are in total" do
    endpoint = Endpoint.new(page: "2")
    payload = endpoint.l_ui_combobox_options(User.where(id: @users), label: :name, limit: 2)

    assert_equal ["Grace Hopper"], payload[:options].map { |option| option[:label] }
    assert_equal 2, payload[:page]
    assert_equal 2, payload[:pages]
    assert_equal 3, payload[:count]
  end

  test "a page beyond the last is empty rather than an error" do
    payload = Endpoint.new.l_ui_combobox_options(User.where(id: @users), label: :name, limit: 2, page: 9)

    assert_empty payload[:options]
    assert_equal 3, payload[:count]
  end

  test "a missing or nonsense page is the first page" do
    ["", "0", nil, "not-a-page"].each do |page|
      payload = Endpoint.new(page: page).l_ui_combobox_options(User.where(id: @users), label: :name)

      assert_equal 1, payload[:page]
    end
  end

  test "label and value accept callables" do
    payload = Endpoint.new.l_ui_combobox_options(
      User.where(id: @users.first), label: ->(user) { user.name.upcase }, value: :email
    )

    assert_equal [{ label: "ADA LOVELACE", value: @users.first.email }], payload[:options]
  end

  test "an unordered scope is ordered by the label, so pages do not overlap" do
    payload = Endpoint.new.l_ui_combobox_options(User.where(id: @users), label: :name, limit: 1)

    assert_equal ["Ada Lovelace"], payload[:options].map { |option| option[:label] }
  end

  test "a label that is a method rather than a column is ordered by the primary key" do
    payload = Endpoint.new.l_ui_combobox_options(User.where(id: @users), label: :display_name, limit: 2)

    assert_equal ["ADA LOVELACE", "ALAN TURING"], payload[:options].map { |option| option[:label] }
    assert_equal 3, payload[:count]
  end

  test "a scope's own order is left alone" do
    payload = Endpoint.new.l_ui_combobox_options(
      User.where(id: @users).order(name: :desc), label: :name, limit: 1
    )

    assert_equal ["Grace Hopper"], payload[:options].map { |option| option[:label] }
  end

  test "an attribute Ransack does not recognise is an error rather than every term matching" do
    error = assert_raises(ArgumentError) do
      Endpoint.new.send(:l_ui_combobox_ransack, User.all, %w[name display_name], "Ada", :cont, :or)
    end

    assert_match(/cannot search name, display_name on User/, error.message)
    assert_match(/ransackable_attributes/, error.message)
  end

  test "a recognised attribute searches as it did" do
    matches = Endpoint.new.send(:l_ui_combobox_ransack, User.where(id: @users), %w[name email], "Hopper",
                                :cont, :or)

    assert_equal ["Grace Hopper"], matches.map(&:name)
  end

  test "a callable label cannot be searched on, so search: is required" do
    error = assert_raises(ArgumentError) do
      Endpoint.new(term: "Ada").l_ui_combobox_options(User.where(id: @users), label: ->(user) { user.name })
    end

    assert_match(/pass search:/, error.message)
  end

  test "a callable label is fine once search: says what to match on" do
    payload = Endpoint.new(term: "Ada").l_ui_combobox_options(
      User.where(id: @users), label: ->(user) { user.name.upcase }, search: [:name]
    )

    assert_equal ["ADA LOVELACE"], payload[:options].map { |option| option[:label] }
  end

  test "the LIKE fallback matches any of the given columns" do
    matches = Endpoint.new.send(:l_ui_combobox_like, User.where(id: @users), %w[name email], "Hopper")

    assert_equal ["Grace Hopper"], matches.map(&:name)
  end

  test "the LIKE fallback rejects attributes that are not columns" do
    error = assert_raises(ArgumentError) do
      Endpoint.new.send(:l_ui_combobox_like, User.all, %w[posts_title], "Rails")
    end

    assert_match(/cannot search posts_title on User/, error.message)
    assert_match(/ransack/, error.message)
  end
end
