class Post < ApplicationRecord
  # Includes
  include Layered::Ui::ManagedResource

  # Associations
  belongs_to :user

  # Validations
  validates :title, presence: true

  # l_ui_managed
  def self.l_ui_managed_columns
    [
      { attribute: :title, primary: true },
      { attribute: :body },
      { attribute: :created_at, label: "Created" }
    ]
  end

  def self.l_ui_managed_search_fields
    [:title, :body]
  end

  def self.l_ui_managed_default_sort
    { attribute: :created_at, direction: :desc }
  end

  def self.l_ui_managed_fields
    [
      { attribute: :title, required: true },
      { attribute: :body, as: :text },
      { attribute: :user_id, as: :select, label: "Author", collection: -> { User.pluck(:email, :id) } }
    ]
  end
end
