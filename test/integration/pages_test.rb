require "test_helper"

class PagesTest < ActionDispatch::IntegrationTest
  test "welcome page renders" do
    get "/"
    assert_response :success
  end

  %w[
    buttons icons notices badges links surfaces forms containers
    utilities typography layouts content tabs conversations devise
    integrations
  ].each do |page|
    test "#{page} page renders" do
      get "/#{page}"
      assert_response :success
    end
  end

  test "pagy page renders" do
    get "/pagy"
    assert_response :success
  end

  test "tables page renders" do
    create_test_users
    get "/tables"
    assert_response :success
  end

  test "pagination page renders" do
    create_test_users
    get "/pagination"
    assert_response :success
  end

  private

  def create_test_users
    3.times do |i|
      User.create!(
        email: "user#{i}@test.com",
        password: "password123",
        name: "Test User #{i}",
        confirmed_at: Time.current
      )
    end
  end
end
