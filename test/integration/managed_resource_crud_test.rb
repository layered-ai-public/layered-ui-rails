require "test_helper"

class ManagedResourceCrudTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      email: "author@test.com",
      password: "password123",
      name: "Author",
      confirmed_at: Time.current
    )
  end

  # -- index --

  test "index renders with new link when crud enabled" do
    get "/posts"
    assert_response :success
    assert_select "a[href='/posts/new']", text: "New"
  end

  test "index renders edit and delete actions when crud enabled" do
    post = Post.create!(title: "Hello", user: @user)
    get "/posts"
    assert_response :success
    assert_select "a[href='/posts/#{post.id}/edit']", text: "Edit"
    assert_select "form[action='/posts/#{post.id}'] button", text: "Delete"
  end

  # -- new --

  test "new renders form" do
    get "/posts/new"
    assert_response :success
    assert_select "h1", /New post/i
    assert_select "form.l-ui-form"
    assert_select "input[name='post[title]']"
    assert_select "textarea[name='post[body]']"
    assert_select "select[name='post[user_id]']"
  end

  # -- create --

  test "create with valid params redirects to index" do
    assert_difference "Post.count", 1 do
      post "/posts", params: { post: { title: "New post", body: "Content", user_id: @user.id } }
    end
    assert_redirected_to "/posts"
    follow_redirect!
    assert_select ".l-ui-notice--success", /created/i
  end

  test "create with invalid params re-renders with 422" do
    assert_no_difference "Post.count" do
      post "/posts", params: { post: { title: "", user_id: @user.id } }
    end
    assert_response :unprocessable_entity
    assert_select "form.l-ui-form"
    assert_select ".l-ui-form__errors"
  end

  # -- edit --

  test "edit renders form with existing values" do
    record = Post.create!(title: "Existing", body: "Body text", user: @user)
    get "/posts/#{record.id}/edit"
    assert_response :success
    assert_select "h1", /Edit post/i
    assert_select "input[name='post[title]'][value='Existing']"
    assert_select "textarea[name='post[body]']", text: "Body text"
  end

  # -- update --

  test "update with valid params redirects to index" do
    record = Post.create!(title: "Old title", user: @user)
    patch "/posts/#{record.id}", params: { post: { title: "New title" } }
    assert_redirected_to "/posts"
    assert_equal "New title", record.reload.title
  end

  test "update with invalid params re-renders with 422" do
    record = Post.create!(title: "Valid", user: @user)
    patch "/posts/#{record.id}", params: { post: { title: "" } }
    assert_response :unprocessable_entity
    assert_select "form.l-ui-form"
    assert_select ".l-ui-form__errors"
  end

  # -- destroy --

  test "destroy removes record and redirects to index" do
    record = Post.create!(title: "Doomed", user: @user)
    assert_difference "Post.count", -1 do
      delete "/posts/#{record.id}"
    end
    assert_redirected_to "/posts"
  end

  test "destroy for missing record returns 404" do
    delete "/posts/999999"
    assert_response :not_found
  end

  test "destroy handles halted callback gracefully" do
    record = Post.create!(title: "Protected", user: @user)
    Post.before_destroy { throw :abort }
    begin
      assert_no_difference "Post.count" do
        delete "/posts/#{record.id}"
      end
      assert_redirected_to "/posts"
      follow_redirect!
      assert_select ".l-ui-notice--warning", /could not be deleted/i
    ensure
      Post.reset_callbacks(:destroy)
    end
  end

  # -- route key injection --

  test "query string cannot override _managed_route_key" do
    get "/readonly/posts", params: { _managed_route_key: "posts" }
    assert_response :success
    assert_select "a[href='/readonly/posts/new']", count: 0,
      message: "Full-CRUD actions must not leak via query string override"
  end

  # -- only: option --

  test "only: [:index] hides new link" do
    get "/readonly/posts"
    assert_response :success
    assert_select "a[href='/readonly/posts/new']", count: 0
  end

  test "only: [:index] excludes CRUD routes" do
    record = Post.create!(title: "Hello", user: @user)
    get "/readonly/posts/new"
    assert_response :not_found

    get "/readonly/posts/#{record.id}/edit"
    assert_response :not_found

    delete "/readonly/posts/#{record.id}"
    assert_response :not_found
  end

  test "destroy without index route does not delete the record" do
    record = Post.create!(title: "Hello", user: @user)
    assert_no_difference "Post.count" do
      delete "/destroy-only/posts/#{record.id}"
    end
    assert_response :not_found
  end

  test "only: [:new] without :index raises at route definition" do
    error = assert_raises(ArgumentError) do
      Rails.application.routes.draw do
        l_ui_managed_resources :posts, only: [:new]
      end
    end
    assert_match(/without :index/, error.message)
  ensure
    Rails.application.reload_routes!
  end

  test "only: [:create] without :index raises at route definition" do
    error = assert_raises(ArgumentError) do
      Rails.application.routes.draw do
        l_ui_managed_resources :posts, only: [:create]
      end
    end
    assert_match(/without :index/, error.message)
  ensure
    Rails.application.reload_routes!
  end

  test "destroy works without l_ui_managed_fields" do
    record = Post.create!(title: "Hello", user: @user)
    original_fields = Post.method(:l_ui_managed_fields)
    Post.define_singleton_method(:l_ui_managed_fields) { [] }
    begin
      assert_difference "Post.count", -1 do
        delete "/deletable/posts/#{record.id}"
      end
      assert_redirected_to "/deletable/posts"
    ensure
      Post.define_singleton_method(:l_ui_managed_fields, original_fields)
    end
  end
end
