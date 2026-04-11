class Post < ApplicationRecord
  # Includes
  include Layered::Ui::ManagedModel

  # Associations
  belongs_to :user

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
end
