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
      #     f.submit "Go", class: "l-ui-button l-ui-button--primary"
      #   end
      #
      # Pass live: true (with a turbo_frame:) to search as the user types: no
      # Search button to press, a clear button in the field, and count: to have
      # the size of the result set announced. It is opt-in rather than inferred
      # from turbo_frame:, which only says where a response lands.
      #
      # Left alone the form submits when asked to. It still gets the clear
      # button: clearing means clearing the field and submitting, which the
      # l-ui--search-form controller does, and that is attached to any framed
      # form. Only an unframed form goes without - for a clear beside one,
      # build the link and wire it to the controller's `clear` action.
      def l_ui_search_form(query, url: nil, fields: [], predicate: :cont, combinator: :or,
                           label: "Search", placeholder: nil, button: nil, clear: nil,
                           live: false, count: nil, min_chars: nil,
                           page_param: "page", turbo_frame: nil, html: {}, &block)
        result = require_ransack("l_ui_search_form") { |msg| tag.p(msg, class: "l-ui-notice l-ui-notice--warning") }
        return result unless result == true

        validate_search_options!("l_ui_search_form", live: live, turbo_frame: turbo_frame,
                                 clear: clear, count: count, min_chars: min_chars)
        warn_missing_search_count if live && count.nil?

        scope = query.context&.search_key || :q
        # The clear button needs the controller, not live mode - and the
        # controller goes on every framed form, to preserve the other scopes.
        clear = turbo_frame.present? if clear.nil?
        # Replace, so Back leaves the collection rather than replaying the term
        # letter by letter. On the form, which Turbo reads before the frame's
        # own, so sort links and pagination in that frame still advance.
        turbo_action = live ? "replace" : "advance"
        html = html.merge(class: ["l-ui-form", html[:class]].compact.join(" "))

        if live
          html[:role] ||= "search"
          html[:aria] = { label: label }.merge(html[:aria] || {})
        end

        if turbo_frame
          existing_data = (html[:data] || {}).symbolize_keys
          existing_controller = existing_data[:controller]
          controller = [existing_controller, "l-ui--search-form"].compact.join(" ")
          existing_action = existing_data[:action]
          action = [existing_action, "submit->l-ui--search-form#preserve"].compact.join(" ")
          turbo_action = existing_data[:turbo_action] || turbo_action

          # What `preserve` and `rewriteLink` drop when carrying other
          # collections' params across a submit. Passed rather than guessed from
          # the search key: Pagy's page key is the host's to choose.
          values = { l_ui__search_form_scope_value: scope,
                     l_ui__search_form_page_param_value: page_param }
          if live
            values[:l_ui__search_form_live_value] = true
            values[:l_ui__search_form_min_chars_value] = min_chars if min_chars.to_i.positive?
            values[:l_ui__search_form_count_value] = count unless count.nil?
          end

          html[:data] = existing_data.except(:controller, :action, :l_ui__search_form_scope_value,
                                             :l_ui__search_form_page_param_value).merge(
            turbo_frame: turbo_frame, turbo_action: turbo_action,
            controller: controller, action: action,
            **values
          )
        end

        if block
          search_form_for(query, url: url, html: html, as: scope, &block)
        else
          raise ArgumentError, "l_ui_search_form requires at least one field in simple mode (e.g. fields: [:name])" if fields.empty?

          combined_field = fields.map(&:to_s).join("_#{combinator}_") + "_#{predicate}"
          placeholder ||= "Search by #{fields.map { |f| f.to_s.humanize.downcase }.join(', ')}"

          search_form_for(query, url: url, html: html, as: scope) do |f|
            tag.div(class: "l-ui-search-inline") do
              l_ui_search_control(f, combined_field,
                                  label: label, placeholder: placeholder,
                                  button: button, clear: clear, live: live)
            end
          end
        end
      end

      # The search control itself - the field, a clear button built into its
      # trailing edge, and the submit that keeps Enter and a JavaScript-less
      # browser working. Rendered by l_ui_search_form's simple mode, and
      # available on its own to a caller who passes a block and builds the row
      # by hand:
      #
      #   <%= l_ui_search_form(@q, url: users_path, turbo_frame: "users",
      #                        live: true, count: @pagy.count) do |f| %>
      #     <div class="l-ui-search-inline">
      #       <%= my_filter_hidden_fields %>
      #       <%= l_ui_search_control(f, :name_or_email_cont, live: true) %>
      #     </div>
      #   <% end %>
      #
      # Both live: and clear: need the l-ui--search-form controller, which
      # l_ui_search_form puts on the form when given a turbo_frame:. A
      # hand-built form may not carry it, so both are off unless asked for.
      def l_ui_search_control(form, attribute, label: "Search", placeholder: nil,
                              clear: nil, button: nil, live: false)
        # live: could not work without the controller, so it vouches for one
        # being there. On its own the control cannot tell, so clear: is opted
        # into by a caller who knows their form carries it.
        clear = live if clear.nil?
        # Either behaviour drives the field, so either needs it as a target.
        controlled = live || clear.present?
        hint_id = ("#{form.object_name}_#{attribute}_hint" if live)
        actions = []
        # Live, `search` refreshes the clear button as part of its own work.
        actions << "input->l-ui--search-form#search" if live
        actions << "input->l-ui--search-form#toggleClear" if clear.present? && !live
        actions << "keydown.esc->l-ui--search-form#clearSearch" if controlled

        field = form.text_field(
          attribute,
          class: "l-ui-form__field",
          placeholder: placeholder,
          autocomplete: "off",
          # Not type="search": WebKit draws its own cancel button, which would
          # sit under this one and take the same tap.
          aria: { describedby: hint_id }.compact,
          data: (controlled ? { "l-ui--search-form-target" => "input",
                                action: actions.join(" ") } : {})
        )

        parts = [ form.label(attribute, label, class: "l-ui-sr-only"), field ]
        parts << tag.span("Results update as you type.", id: hint_id, class: "l-ui-sr-only") if live
        parts << l_ui_search_clear_button(form, attribute, clear) if clear

        control = tag.div(safe_join(parts.compact),
                          class: [ "l-ui-search-control", ("l-ui-search-control--clearable" if clear) ].compact.join(" "))

        safe_join([ control, l_ui_search_submit(form, button, live: live) ].compact)
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

      # Options that say something about typing, so they mean nothing to a form
      # that submits when asked to. Passing one has no visible symptom, so it
      # names itself rather than being quietly dropped.
      LIVE_ONLY_OPTIONS = {
        count: "there is nothing to announce when the user pressed the button themselves",
        min_chars: "nothing is sent until the form is submitted"
      }.freeze

      def validate_search_options!(helper, live:, turbo_frame:, clear: nil, **options)
        if live && turbo_frame.blank?
          raise ArgumentError,
                "#{helper} requires a turbo_frame: for live: true - typing into an unframed form " \
                "would mean a full page load per keystroke"
        end

        if clear && turbo_frame.blank?
          raise ArgumentError,
                "#{helper}'s clear: requires a turbo_frame: - clearing means clearing the field and " \
                "submitting, which the l-ui--search-form controller does, and it is only attached " \
                "to a framed form"
        end

        return if live

        options.each do |key, value|
          # false and nil both say "not asked for", which is never a conflict.
          next if value.nil? || value == false

          raise ArgumentError,
                "#{helper}'s #{key}: applies to live: true only - #{LIVE_ONLY_OPTIONS.fetch(key)}"
        end
      end

      # count: is what a screen reader hears when results change with no button
      # press, so its absence is a hole rather than a default - and one nothing
      # on screen would reveal. A log line, not markup: the form itself is fine.
      def warn_missing_search_count
        return unless Rails.env.development?

        Rails.logger.warn(
          "[layered-ui-rails] l_ui_search_form with live: true was given no count:, so nothing is " \
          "announced when results change. Pass count: @pagy.count (or the size of the result set)."
        )
      end

      # Live, an unnamed submit is present but neither seen nor tabbed to: what
      # Enter in the field and a JavaScript-less browser submit through, without
      # a focus stop nobody can see (WCAG 2.4.7). A form that submits when asked
      # to needs a button that can be asked, so it always gets a visible one.
      def l_ui_search_submit(form, button, live: true)
        return form.submit(button, class: "l-ui-button l-ui-button--primary") if button.is_a?(String)
        return form.submit("Search", class: "l-ui-button l-ui-button--primary") unless live

        form.submit("Search", class: "l-ui-sr-only", tabindex: -1)
      end

      def l_ui_search_clear_button(form, attribute, clear)
        name = clear.is_a?(String) ? clear : "Clear search"

        # Hidden until there is something to clear; the controller corrects it
        # on connect. Ransack answers a combined reader like `name_or_email_cont`
        # through method_missing and denies respond_to?, so the value is asked
        # for rather than checked for.
        blank = begin
          form.object.public_send(attribute).blank?
        rescue NoMethodError
          true
        end

        tag.button(
          safe_join([ l_ui_search_clear_icon, tag.span(name, class: "l-ui-sr-only") ]),
          type: "button",
          class: "l-ui-search-control__clear",
          hidden: blank,
          data: { "l-ui--search-form-target" => "clear", action: "l-ui--search-form#clearSearch" }
        )
      end

      # Rendered inline rather than via image_tag so it inherits the surrounding
      # currentColor, as the combobox icons do; an <img>-loaded SVG cannot, and
      # would need the dark:invert of .l-ui-icon.
      def l_ui_search_clear_icon
        tag.svg(
          tag.path("d" => "M6 6 18 18M18 6 6 18",
                   "stroke-linecap" => "round", "stroke-linejoin" => "round"),
          class: "l-ui-icon--xs",
          fill: "none",
          stroke: "currentColor",
          "stroke-width" => "2",
          "viewBox" => "0 0 24 24",
          "aria-hidden" => "true"
        )
      end

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
