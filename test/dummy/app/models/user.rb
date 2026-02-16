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
end
