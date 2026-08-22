module Layered
  module Ui
    module FormHelper
      FIELD_TYPES = %i[
        string text email password number tel url search
        date datetime time month week
        color range file
        select checkbox hidden combobox
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

        if as == :combobox && config[:collection].nil? && config[:url].nil?
          raise ArgumentError,
                "Field :#{attribute} is declared as :combobox but has no :collection or :url. " \
                "Provide collection: [['Label', value], ...] to filter in the browser, " \
                "or url: to fetch options from an endpoint as the user types"
        end

        if as == :combobox && config[:url] && !config.key?(:selected) &&
           l_ui_field_value(record, attribute).present?
          raise ArgumentError,
                "Field :#{attribute} is a remote :combobox with a value already set, but no :selected. " \
                "A remote collection cannot be searched for the label of an existing value, " \
                "so pass it with its label, e.g. selected: [[record.user.name, record.user_id]]"
        end

        label = config[:label] || attribute.to_s.humanize

        extras = config.except(:attribute, :as, :label, :required, :hint,
                               :collection, :placeholder, :prompt, :include_blank)

        if as == :combobox
          unusable = {
            prompt: "Use placeholder: instead, which a combobox shows until something is selected.",
            include_blank: "A combobox with no selection is already blank, so there is nothing to set."
          }
          unusable.each do |key, advice|
            next unless config.key?(key)

            raise ArgumentError,
                  "Field :#{attribute} is a :combobox and cannot take :#{key}. #{advice}"
          end

          extras[:multiple] = l_ui_field_multiple?(record, attribute) unless config.key?(:multiple)

          allowed = ComboboxHelper::COMBOBOX_OPTIONS + [:class]
          unknown = extras.keys - allowed
          if unknown.any?
            raise ArgumentError,
                  "Field :#{attribute} is a :combobox and cannot take " \
                  "#{unknown.map { |key| ":#{key}" }.join(', ')}. Unlike the other field types, a " \
                  "combobox takes only its own options (#{allowed.map { |key| ":#{key}" }.join(', ')}); " \
                  "extra HTML attributes belong on container:"
          end
        end

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

      # The record's current value for a field, used as the default selection
      # for a :combobox field when +selected:+ is not given.
      def l_ui_field_value(record, attribute)
        record.public_send(attribute) if record.respond_to?(attribute)
      end

      def l_ui_field_error_id(record, attribute)
        "#{record.model_name.param_key}_#{attribute}_error"
      end

      def l_ui_field_hint_id(record, attribute)
        "#{record.model_name.param_key}_#{attribute}_hint"
      end

      # Space-joined ids for a field's aria-describedby: its hint (when the field
      # has one) followed by its error message, which is always rendered.
      def l_ui_field_describedby(record, attribute, hint: false)
        ids = []
        ids << l_ui_field_hint_id(record, attribute) if hint
        ids << l_ui_field_error_id(record, attribute)
        ids.join(" ")
      end

      private

      # Whether a :combobox field holds several values. +l_ui_combobox+ defaults
      # to a multiple select, but a form field is more often a single scalar
      # attribute, which would silently cast an array of values to nil. So a
      # field is multiple only when the attribute is plainly a collection: an
      # +_ids+ association writer, or an attribute already holding an array.
      def l_ui_field_multiple?(record, attribute)
        return true if attribute.to_s.end_with?("_ids")

        l_ui_field_value(record, attribute).is_a?(Array)
      end

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
