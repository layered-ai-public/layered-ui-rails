module Layered
  module Ui
    module RansackHelper
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
      def l_ui_search_form(query, url: nil, fields: [], predicate: :cont, combinator: :or, label: "Search", placeholder: nil, button: "Search", clear: nil, turbo_frame: nil, html: {}, &block)
        result = require_ransack("l_ui_search_form") { |msg| tag.p(msg, class: "l-ui-notice l-ui-notice--warning") }
        return result unless result == true

        scope = query.context&.search_key || :q
        turbo_action = "advance"
        html = html.merge(class: ["l-ui-form", html[:class]].compact.join(" "))

        if turbo_frame
          existing_data = (html[:data] || {}).symbolize_keys
          existing_controller = existing_data[:controller]
          controller = [existing_controller, "l-ui--search-form"].compact.join(" ")
          existing_action = existing_data[:action]
          action = [existing_action, "submit->l-ui--search-form#preserve"].compact.join(" ")
          turbo_action = existing_data[:turbo_action] || turbo_action

          html[:data] = existing_data.except(:controller, :action, :l_ui__search_form_scope_value).merge(
            turbo_frame: turbo_frame, turbo_action: turbo_action,
            controller: controller, action: action,
            l_ui__search_form_scope_value: scope
          )
        end

        if block
          search_form_for(query, url: url, html: html, as: scope, &block)
        else
          raise ArgumentError, "l_ui_search_form requires at least one field in simple mode (e.g. fields: [:name])" if fields.empty?

          combined_field = fields.map(&:to_s).join("_#{combinator}_") + "_#{predicate}"
          placeholder ||= "Search by #{fields.map { |f| f.to_s.humanize.downcase }.join(', ')}"

          search_form_for(query, url: url, html: html, as: scope) do |f|
            f.label(combined_field, label, class: "l-ui-sr-only") +
              tag.div(class: "l-ui-search-inline") do
                content = f.text_field(combined_field, class: "l-ui-form__field", placeholder: placeholder) +
                  f.submit(button, class: "l-ui-button--primary")
                if clear
                  raise ArgumentError, "l_ui_search_form requires an explicit url: when clear: is set" unless url
                  clear_options = { class: "l-ui-button--outline" }
                  clear_options[:data] = { turbo_frame: turbo_frame, turbo_action: turbo_action, action: "click->l-ui--search-form#clear" } if turbo_frame
                  content += link_to(clear == true ? "Clear" : clear, url, **clear_options)
                end
                content
              end
          end
        end
      end

      SORT_INDICATORS = {
        "asc"  => { symbol: "▲", label: ", sorted ascending",  aria: "ascending" },
        "desc" => { symbol: "▼", label: ", sorted descending", aria: "descending" }
      }.freeze

      # Renders a styled, accessible Ransack sort header cell.
      #
      # Returns a +<th>+ element containing a sort link and an accessible sort
      # direction indicator. The +aria-sort+ attribute is set on the +<th>+
      # so screen readers announce the current sort state.
      #
      # Usage:
      #   l_ui_sort_link(@q, :name)
      #   l_ui_sort_link(@q, :name, "Full name")
      #   l_ui_sort_link(@q, :created_at, "Joined", default_order: :desc)
      #   l_ui_sort_link(@q, :name, html: { data: { turbo_action: "replace" } })
      def l_ui_sort_link(query, attribute, label = nil, default_order: nil, turbo_frame: nil, url: nil, html: {})
        label ||= attribute.to_s.humanize
        link_class = ["l-ui-table__sort-link", html[:class]].compact.join(" ")

        result = require_ransack("l_ui_sort_link") { |msg| tag.th(tag.span(label, title: msg), class: "l-ui-table__header-cell", scope: "col") }
        return (result || tag.th(label, class: "l-ui-table__header-cell", scope: "col")) unless result == true

        current_dir = sort_direction_for(query, attribute)
        indicator = SORT_INDICATORS[current_dir]
        aria_sort = indicator&.dig(:aria) || "none"

        url = if url
                build_sort_url(url, query, attribute, default_order: default_order)
              else
                sort_url(query, attribute, { default_order: default_order }.compact)
              end
        link_html = html.except(:class)
        if turbo_frame
          existing_data = (link_html[:data] || {}).symbolize_keys
          link_html[:data] = existing_data.merge(turbo_frame: turbo_frame, turbo_action: existing_data[:turbo_action] || "advance")
        end
        link = link_to(url, **link_html, class: link_class) do
          parts = [label]
          if indicator
            parts << tag.span(indicator[:symbol], aria: { hidden: true }, class: "l-ui-table__sort-indicator")
            parts << tag.span(indicator[:label], class: "l-ui-sr-only")
          end
          safe_join(parts)
        end

        tag.th(link, class: "l-ui-table__header-cell l-ui-table__header-cell--sortable",
               scope: "col", aria: { sort: aria_sort })
      end

      private

      def ransack_available?
        defined?(Ransack)
      end

      # Returns +true+ if Ransack is available. In development, returns the
      # block's result so the caller can render a visible fallback. In
      # production/test, logs and returns +nil+.
      def require_ransack(helper_name)
        return true if ransack_available?

        message = "#{helper_name} requires the ransack gem. Add `gem \"ransack\"` to your Gemfile."

        if Rails.env.development?
          return yield(message)
        end

        Rails.logger.warn("[layered-ui-rails] #{message} The output has been hidden.")
        nil
      end

      def sort_direction_for(query, attribute)
        return unless query.respond_to?(:sorts)
        sort = query.sorts.detect { |s| s.name == attribute.to_s }
        sort&.dir
      end

      # Mirrors Ransack's sort-cycling logic (asc -> desc -> asc) for cases
      # where the sort link must point to a custom base URL instead of the
      # current request path. If Ransack changes its cycling behaviour,
      # this will need updating to match.
      def build_sort_url(base_url, query, attribute, default_order: nil)
        current_dir = sort_direction_for(query, attribute)
        next_dir = case current_dir
                   when "asc" then "desc"
                   when "desc" then "asc"
                   else (default_order || "asc").to_s
                   end

        scope = query.context&.search_key || :q
        uri = URI.parse(base_url)
        existing = uri.query ? URI.decode_www_form(uri.query) : []
        existing.reject! { |k, _| k == "#{scope}[s]" }
        existing << ["#{scope}[s]", "#{attribute} #{next_dir}"]
        uri.query = URI.encode_www_form(existing)
        uri.to_s
      end
    end
  end
end
