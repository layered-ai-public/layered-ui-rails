require "layered/ui/version"
require "layered/ui/engine"

module Layered
  module Ui
    mattr_accessor :current_user_method, default: :current_user
  end
end
