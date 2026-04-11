require "tailwindcss-rails"
require "layered/ui/version"
require "layered/ui/routing"
require "layered/ui/engine"

module Layered
  module Ui
    mattr_accessor :current_user_method, default: :current_user
  end
end
