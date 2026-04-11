module Layered
  module Ui
    module ManagedResource
      extend ActiveSupport::Concern

      included do
        raise "Layered::Ui::ManagedResource requires the ransack gem. Add `gem \"ransack\"` to your Gemfile." unless defined?(Ransack)
        raise "Layered::Ui::ManagedResource requires the pagy gem. Add `gem \"pagy\"` to your Gemfile." unless defined?(Pagy)
      end

      class_methods do
        def l_ui_managed_columns
          [{ attribute: :id }]
        end

        def l_ui_managed_search_fields
          []
        end

        def l_ui_managed_default_sort
          { attribute: :id, direction: :desc }
        end

        def l_ui_managed_per_page
          20
        end

        # --- CRUD support ---

        # Array of field hashes defining form fields. Empty = CRUD disabled.
        # Override in your model to enable new/edit/destroy actions.
        def l_ui_managed_fields
          []
        end

        # Attributes permitted for mass assignment. Auto-derived from fields.
        # Override for nested attributes or other special cases.
        def l_ui_managed_permitted_params
          l_ui_managed_fields.map { |f| f[:attribute] }
        end

        # How to build a new record. Override for scoped builds
        # (e.g. controller.current_user.posts.build).
        def l_ui_managed_build_record(_controller)
          new
        end

        # Base scope for finding records. Used in index (Ransack) and
        # edit/update/destroy (find). Override for tenant scoping.
        def l_ui_managed_scope(_controller)
          all
        end

        # Redirect target after create/update. Override to redirect
        # to a show page or other destination. Requires :index in the
        # only: list; override this method if :index is excluded.
        def l_ui_managed_after_save_path(controller, _record)
          controller.send(:managed_collection_path)
        end

        # Auto-detect field type from the database column.
        def l_ui_managed_field_type_for(attribute)
          col = columns_hash[attribute.to_s]
          return :string unless col

          case col.type
          when :text then :text
          when :integer, :float, :decimal then :number
          when :boolean then :checkbox
          when :date then :date
          when :datetime then :datetime
          else :string
          end
        end

        # --- Ransack ---

        def ransackable_attributes(_auth_object = nil)
          attrs = l_ui_managed_columns.map { |c| c[:attribute].to_s }
          attrs |= l_ui_managed_search_fields.map(&:to_s)
          attrs
        end

        def ransackable_associations(_auth_object = nil)
          []
        end
      end
    end
  end
end
