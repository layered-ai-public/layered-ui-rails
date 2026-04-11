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
        form_opts = { url: url, class: "l-ui-form" }
        form_opts[:method] = method if method

        form_with(model: record, **form_opts) do |f|
          parts = []
          parts << render("layered_ui/shared/form_errors", item: record)

          fields.each do |field_config|
            parts << l_ui_managed_field(f, record, field_config)
          end

          parts << tag.div(class: "l-ui-form__group") do
            f.submit(record.new_record? ? "Create" : "Save changes",
                     class: "l-ui-button l-ui-button--primary")
          end

          safe_join(parts)
        end
      end

      # Renders a single field group: label + input + hint + error.
      #
      #   l_ui_managed_field(f, @post,
      #     { attribute: :title, required: true })
      #
      def l_ui_managed_field(form, record, field_config)
        config = normalise_managed_field(record, field_config)
        return managed_field_input(form, record, config) if config[:as] == :hidden

        tag.div(class: "l-ui-form__group") do
          parts = []
          unless config[:as] == :checkbox
            parts << render("layered_ui/shared/label",
                            form: form, field: config[:attribute],
                            required: config[:required], name: config[:label])
          end
          parts << managed_field_input(form, record, config)

          if config[:hint]
            parts << tag.p(config[:hint], class: "l-ui-form__hint",
                           id: managed_field_hint_id(record, config[:attribute]))
          end

          parts << render("layered_ui/shared/field_error",
                          object: record, field: config[:attribute])
          safe_join(parts)
        end
      end

      private

      def normalise_managed_field(record, config)
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

      def managed_field_input(form, record, config)
        attribute = config[:attribute]
        extras = config[:extras] || {}
        base_opts = {}
        base_opts[:placeholder] = config[:placeholder] if config[:placeholder]
        base_opts[:required] = true if config[:required]

        unless config[:as] == :hidden
          describedby = [managed_field_error_id(record, attribute)]
          describedby.unshift(managed_field_hint_id(record, attribute)) if config[:hint]
          base_opts["aria-describedby"] = describedby.join(" ")
        end

        case config[:as]
        when :hidden
          form.hidden_field(attribute, **extras)
        when :text
          form.text_area(attribute, class: "l-ui-form__field",
                         rows: extras.delete(:rows) || 4,
                         **base_opts, **extras)
        when :select
          collection = config[:collection]
          choices = collection.respond_to?(:call) ? collection.call : collection
          include_blank = extras.delete(:include_blank)
          include_blank = true if include_blank.nil?
          tag.div(class: "l-ui-select-wrapper") do
            form.select(attribute, choices, { include_blank: include_blank },
                        class: "l-ui-select", **base_opts, **extras)
          end
        when :checkbox
          tag.div(class: "l-ui-container--checkbox") do
            safe_join([
              form.check_box(attribute, class: "l-ui-checkbox", **base_opts, **extras),
              form.label(attribute, config[:label], class: "l-ui-label--checkbox")
            ])
          end
        else
          method_name = config[:as] == :string ? :text_field : :"#{config[:as]}_field"
          form.public_send(method_name, attribute,
                           class: "l-ui-form__field", **base_opts, **extras)
        end
      end

      def managed_field_error_id(record, attribute)
        "#{record.model_name.param_key}_#{attribute}_error"
      end

      def managed_field_hint_id(record, attribute)
        "#{record.model_name.param_key}_#{attribute}_hint"
      end
    end
  end
end
