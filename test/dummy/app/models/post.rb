class Post < ApplicationRecord
  include Layered::Ui::Managed

  belongs_to :user

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

  def self.ransackable_attributes(_auth_object = nil)
    %w[title body created_at]
  end

  def self.ransackable_associations(_auth_object = nil)
    []
  end
end
