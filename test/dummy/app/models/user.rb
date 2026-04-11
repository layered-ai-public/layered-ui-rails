class User < ApplicationRecord
  # Includes
  devise :database_authenticatable,
    :validatable,
    :registerable,
    :confirmable,
    :recoverable,
    :lockable,
    :rememberable,
    :timeoutable,
    :trackable

  # Associations
  has_many :posts, dependent: :destroy

  # Callbacks
  after_create :confirm

  # Ransack
  def self.ransackable_attributes(_auth_object = nil)
    %w[name email created_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    []
  end
end
