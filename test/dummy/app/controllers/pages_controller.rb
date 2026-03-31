class PagesController < ApplicationController
  before_action :load_users, only: [:tables, :pagination]

  def welcome
  end

  def buttons
  end

  def icons
  end

  def notices
  end

  def badges
  end

  def links
  end

  def surfaces
  end

  def tables
  end

  def pagination
  end

  def forms
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

  def layout_panel
  end

  def layout_logos
  end

  def layout_icons
  end

  def tabs
  end

  def conversations
  end

  def form_errors
  end

  def devise
  end

  def integrations
  end

  def pagy_integration
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

  private

  def load_users
    @pagy, @users = pagy(User.order(:name), limit: 10)
  end
end
