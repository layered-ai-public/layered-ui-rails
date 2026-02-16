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

  def layouts
  end

  def content
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

  private

  def load_users
    @pagy, @users = pagy(User.order(:name), limit: 10)
  end
end
