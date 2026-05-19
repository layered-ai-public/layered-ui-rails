module Layered
  module Ui
    module FormHelper
      FIELD_TYPES = %i[
        string text email password number tel url search
        date datetime time month week
        color range file
        select checkbox hidden
      ].freeze

      # Renders a complete form with all fields, error summary,
      # and submit button.
      #
      #   l_ui_form(@post,
      #     fields: Post.l_managed_resource_fields,
      #     url: managed_posts_path)
      #
      def l_ui_form(record, fields:, url:, method: nil, submit: nil, multipart: nil)
        render partial: "layered/ui/managed_resource/form",
               locals: { record: record, fields: fields, url: url, method: method,
                         submit: submit, multipart: multipart }
      end

      # Normalises a raw field config hash into a canonical form.
      def l_ui_normalise_field(record, config)
        attribute = config[:attribute]
        as = config[:as] || l_ui_field_type_for(record.class, attribute)

        unless FIELD_TYPES.include?(as)
          raise ArgumentError,
                "Unsupported field type :#{as} for :#{attribute}. " \
                "Supported types: #{FIELD_TYPES.map { |t| ":#{t}" }.join(', ')}"
        end

        if as == :select && config[:collection].nil?
          raise ArgumentError,
                "Field :#{attribute} is declared as :select but has no :collection. " \
                "Provide collection: [['Label', value], ...] or collection: -> { Model.pluck(:name, :id) }"
        end

        label = config[:label] || attribute.to_s.humanize

        extras = config.except(:attribute, :as, :label, :required, :hint,
                               :collection, :placeholder, :prompt, :include_blank)

        {
          attribute: attribute,
          as: as,
          label: label,
          required: config.fetch(:required, false),
          hint: config[:hint],
          collection: config[:collection],
          placeholder: config[:placeholder],
          prompt: config[:prompt],
          include_blank: config[:include_blank],
          extras: extras
        }
      end

      def l_ui_field_error_id(record, attribute)
        "#{record.model_name.param_key}_#{attribute}_error"
      end

      def l_ui_field_hint_id(record, attribute)
        "#{record.model_name.param_key}_#{attribute}_hint"
      end

      private

      def l_ui_field_type_for(model_class, attribute)
        return :string unless model_class.respond_to?(:columns_hash)

        col = model_class.columns_hash[attribute.to_s]
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
    end
  end
end
