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

  private

  def load_users
    @pagy, @users = pagy(User.order(:name), limit: 10)
  end
end
