module Layered
  module Ui
    module SearchHelper
      # Renders a styled Ransack search form.
      #
      # Simple usage (single input searching across fields):
      #   l_ui_search_form(@q, url: users_path, fields: [:name, :email])
      #
      # Custom usage (full control via block):
      #   l_ui_search_form(@q, url: users_path) do |f|
      #     render "layered_ui/shared/search_field", form: f, field: :name_cont, label: "Name"
      #     f.submit "Go", class: "l-ui-button--primary"
      #   end
      def l_ui_search_form(query, url: nil, fields: [], predicate: :cont, combinator: :or, label: "Search", placeholder: nil, button: "Search", clear: nil, html: {}, &block)
        unless defined?(Ransack)
          message = "l_ui_search_form requires the ransack gem. Add `gem \"ransack\"` to your Gemfile."

          if Rails.env.development?
            return tag.p(message, class: "l-ui-notice--warning")
          end

          Rails.logger.warn("[layered-ui-rails] #{message} The search form has been hidden.")
          return
        end

        html = html.merge(class: "l-ui-form #{html[:class]}".strip)

        if block
          search_form_for(query, url: url, html: html, &block)
        else
          raise ArgumentError, "l_ui_search_form requires at least one field in simple mode (e.g. fields: [:name])" if fields.empty?

          combined_field = fields.map(&:to_s).join("_#{combinator}_") + "_#{predicate}"
          placeholder ||= "Search by #{fields.map { |f| f.to_s.humanize.downcase }.join(', ')}"

          search_form_for(query, url: url, html: html) do |f|
            f.label(combined_field, label, class: "l-ui-sr-only") +
              tag.div(class: "l-ui-search__inline") do
                content = f.text_field(combined_field, class: "l-ui-form__field", placeholder: placeholder) +
                  f.submit(button, class: "l-ui-button--primary")
                content += link_to(clear == true ? "Clear" : clear, url || request.path, class: "l-ui-button--outline") if clear
                content
              end
          end
        end
      end
    end
  end
end
