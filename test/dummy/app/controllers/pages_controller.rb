class PagesController < ApplicationController
  include Layered::Ui::ComboboxOptions

  before_action :load_users, only: [:tables, :pagination, :tables_helper, :forms_helper]

  def home
  end

  def buttons
  end

  def icons
  end

  def notices
  end

  def badges
  end

  def tags
  end

  def links
  end

  def surfaces
  end

  def hero
  end

  def cards
  end

  def logo_block
  end

  def tables
  end

  def pagination
  end

  def forms
  end

  def combobox
    @recipients = User.order(:name).pluck(:email, :id)
    # A remote combobox's selections carry their own labels, since there is no
    # collection on the page to look them up in.
    owner = User.order(:name).first
    @owner_selection = owner ? [[owner.name, owner.id]] : nil
  end

  # The endpoint the remote combobox example searches. Ransack and Pagy are
  # both present here, so this is the whole action.
  def combobox_options
    render json: l_ui_combobox_options(User.all, label: :name, search: [:name, :email], limit: 8)
  end

  def containers
  end

  def utilities
  end

  def typography
  end

  def layout
  end

  def layout_metadata
  end

  def layout_navigation
  end

  def layout_header
  end

  def layout_panel
  end

  def layout_logos
  end

  def layout_icons
  end

  def tabs
  end

  def modals
  end

  def popovers
  end

  def conversations
  end

  def tables_helper
    @posts = Post.order(:title).limit(10)
  end

  def forms_helper
    @post = Post.new
  end

  def form_errors
  end

  def devise
  end

  def integrations
  end

  def pagy_integration
  end

  def ransack_integration
    @users_q = User.ransack(params[:users_q], search_key: :users_q)
    users = @users_q.result(distinct: true)
    users = users.order(:name) if @users_q.sorts.empty?
    @users_pagy, @users = pagy(users, limit: 5, page_key: "users_page")

    @posts_q = Post.ransack(params[:posts_q], search_key: :posts_q)
    posts = @posts_q.result(distinct: true)
    posts = posts.order(:title) if @posts_q.sorts.empty?
    @posts_pagy, @posts = pagy(posts, limit: 5, page_key: "posts_page")
  end

  def search
  end

  def layout_colors
  end

  def layout_head
  end

  def test_icon_url_override
    @l_ui_icon_light_url = "https://example.com/custom_icon_light.svg"
    @l_ui_icon_dark_url = "https://example.com/custom_icon_dark.svg"
    @l_ui_apple_touch_icon_url = "https://example.com/custom_apple_touch_icon.png"
    @l_ui_panel_icon_light_url = "https://example.com/custom_panel_icon_light.svg"
    @l_ui_panel_icon_dark_url = "https://example.com/custom_panel_icon_dark.svg"
  end

  def test_panel_icon_light_only
    @l_ui_panel_icon_light_url = "https://example.com/custom_panel_icon_light.svg"
    render :home
  end

  def test_panel_icon_dark_only
    @l_ui_panel_icon_dark_url = "https://example.com/custom_panel_icon_dark.svg"
    render :home
  end

  def test_logo_override
  end

  def test_head_injection
  end

  def test_header_actions
  end

  def test_header_actions_replaced
  end

  private

  def load_users
    @pagy, @users = pagy(User.order(:name), limit: 10)
  end
end
