require "tailwindcss-rails"
require "layered/ui/version"
require "layered/ui/engine"

module Layered
  module Ui
    mattr_accessor :current_user_method, default: :current_user
    mattr_accessor :devise_scope, default: :user
  end
end
