class Post < ApplicationRecord
  belongs_to :user

  def self.ransackable_attributes(_auth_object = nil)
    %w[title body created_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    []
  end
end
