class User < ApplicationRecord
  devise :database_authenticatable,
    :validatable,
    :registerable,
    :confirmable,
    :recoverable,
    :lockable,
    :rememberable,
    :timeoutable,
    :trackable

  has_many :posts, dependent: :destroy

  after_create :confirm

  def self.ransackable_attributes(_auth_object = nil)
    %w[name email created_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    []
  end
end
