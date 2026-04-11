module Layered
  module Ui
    module ManagedFormHelper
      # Renders a complete managed form with all fields, error summary,
      # and submit button.
      #
      #   l_ui_managed_form(@post,
      #     fields: Post.l_ui_managed_fields,
      #     url: managed_posts_path)
      #
      def l_ui_managed_form(record, fields:, url:, method: nil)
        render partial: "layered/ui/managed_resource/form",
               locals: { record: record, fields: fields, url: url, method: method }
      end

      # Normalises a raw field config hash into a canonical form.
      def l_ui_normalise_managed_field(record, config)
        attribute = config[:attribute]
        as = config[:as] || record.class.l_ui_managed_field_type_for(attribute)
        label = config[:label] || attribute.to_s.humanize

        extras = config.except(:attribute, :as, :label, :required, :hint,
                               :collection, :placeholder)

        {
          attribute: attribute,
          as: as,
          label: label,
          required: config.fetch(:required, false),
          hint: config[:hint],
          collection: config[:collection],
          placeholder: config[:placeholder],
          extras: extras
        }
      end

      def l_ui_managed_field_error_id(record, attribute)
        "#{record.model_name.param_key}_#{attribute}_error"
      end

      def l_ui_managed_field_hint_id(record, attribute)
        "#{record.model_name.param_key}_#{attribute}_hint"
      end
    end
  end
end
