module Layered
  module Ui
    module ComboboxHelper
      # Renders a token select: a text input with type-ahead filtering whose
      # selections become removable tokens, in the style of an email recipient
      # field. Built on the ARIA combobox pattern (an +input+ with
      # +role="combobox"+ owning a +listbox+ popup), so it works with the
      # keyboard and with screen readers - no third-party select library.
      #
      #   <%= l_ui_combobox("post[tag_ids]",
      #         label: "Tags",
      #         collection: Tag.pluck(:name, :id),
      #         selected: @post.tag_ids) %>
      #
      # Inside a form builder, pass the attribute as a Symbol with +form:+ and
      # the parameter name is derived from the builder:
      #
      #   <%= form_with model: @post do |f| %>
      #     <%= l_ui_combobox(:tag_ids, form: f, label: "Tags",
      #           collection: Tag.pluck(:name, :id), selected: @post.tag_ids) %>
      #   <% end %>
      #
      # Selections post as hidden inputs named after the field, so the control
      # needs no JSON round-trip on submit. A leading blank value is always
      # posted, so clearing every token submits an empty collection rather than
      # omitting the parameter (which would leave the association untouched).
      #
      # == Single select
      #
      # Pass +multiple: false+ for a one-of-many control. The parameter loses
      # its +[]+ suffix, choosing an option replaces the current token, and the
      # listbox closes on selection.
      #
      # == Creating new values
      #
      # With +create: true+, a term that matches no option can be added as a
      # new token. New tokens post under a separate parameter (+create_name:+,
      # which is then required) so the server never has to guess whether a
      # submitted value is an existing record's ID or a free-text label:
      #
      #   <%= l_ui_combobox(:tag_ids, form: f, create: true, create_name: :new_tag_names, ...) %>
      #
      #   # => post[tag_ids][]       => ["", "7"]
      #   #    post[new_tag_names][] => ["urgent"]
      #
      # On redisplay, pass previously created values in +selected:+ alongside
      # the existing ones: any selected value absent from +collection+ is
      # rendered as a new token.
      #
      # == Remote options
      #
      # Pass +url:+ and the options are fetched from that endpoint as the user
      # types, instead of being filtered in the browser - for collections too
      # large to render up front. The endpoint is sent +term+ and +page+ and
      # answers with JSON; +Layered::Ui::ComboboxOptions+ builds that payload:
      #
      #   <%= l_ui_combobox(:author_id, form: f, multiple: false,
      #         url: options_users_path, min_chars: 2,
      #         selected: [[@post.author.name, @post.author_id]]) %>
      #
      # +collection:+ is then optional (any options given are shown until the
      # first response arrives). Because the browser holds no copy of the
      # collection, a selected value cannot be looked up for its label, so pass
      # remote selections as +[label, value]+ pairs.
      #
      # Further pages are appended as the user reaches the end of the list -
      # by scrolling to its foot, or by pressing Down on its last option, so
      # the keyboard is not capped at the first page.
      #
      # == Reordering
      #
      # With +reorder: true+ each token gains a pair of move controls and can
      # be dragged with a mouse; the parameters are posted in the displayed
      # order. The move buttons are not decoration: dragging alone would fail
      # WCAG 2.2 SC 2.5.7, which requires a single-pointer alternative.
      #
      # Options:
      #   collection:  (Array)   Options as ["Label", value] pairs, {label:, value:} hashes, or plain strings.
      #   url:         (String)  Endpoint searched as the user types. Options come from it rather than +collection:+.
      #   form:        (Builder) Form builder used to derive parameter names from Symbol names.
      #   selected:    (Array)   Selected values, or ["Label", value] pairs / {label:, value:} hashes where the
      #                          label cannot be looked up in +collection+. Values outside it become new tokens.
      #   multiple:    (Boolean) Multi-select with many tokens (default), or single select.
      #   create:      (Boolean) Allow adding values that are not in the collection. Requires +create_name:+.
      #   create_name: (String)  Parameter name new values post under.
      #   reorder:     (Boolean) Show move controls and allow dragging tokens (default false).
      #   min_chars:   (Integer) Characters needed before a remote search runs (default 0, i.e. search on focus).
      #   label:       (String)  Renders an +l-ui-label+ bound to the input.
      #   hint:        (String)  Renders an +l-ui-form__hint+ referenced by the input.
      #   placeholder: (String)  Input placeholder. Defaults to nothing.
      #   required:    (Boolean) Marks the label and input as required.
      #   disabled:    (Boolean) Disables the input and every token control.
      #   container:   (Hash)    Extra HTML attributes for the wrapping <div>.
      def l_ui_combobox(name, collection: nil, form: nil, selected: nil, multiple: true,
                        create: false, create_name: nil, reorder: false, url: nil,
                        min_chars: 0, id: nil, label: nil, hint: nil, placeholder: nil,
                        required: false, disabled: false, container: {})
        if collection.nil? && url.nil?
          raise ArgumentError,
                "l_ui_combobox requires collection: (options filtered in the browser) or url: " \
                "(options fetched from an endpoint as the user types)"
        end

        if create && create_name.nil?
          raise ArgumentError,
                "l_ui_combobox requires create_name: when create: is set, so new values post " \
                "under their own parameter (e.g. create_name: :new_tag_names)"
        end

        id ||= "l-ui-combobox-#{SecureRandom.hex(4)}"
        options = l_ui_combobox_option_pairs(collection)
        value_name = l_ui_combobox_param(name, form, multiple: multiple)
        create_value_name = create ? l_ui_combobox_param(create_name, form, multiple: multiple) : nil

        tokens = l_ui_combobox_tokens(selected, options, multiple: multiple, create: create, url: url,
                                                         value_name: value_name, create_value_name: create_value_name)

        container_attrs = container.deep_dup
        container_attrs[:class] = class_names("l-ui-combobox", container_attrs[:class])
        container_attrs[:data] = l_ui_combobox_data(container_attrs[:data],
                                                    multiple: multiple, create: create, reorder: reorder,
                                                    disabled: disabled, value_name: value_name,
                                                    create_value_name: create_value_name,
                                                    url: url, min_chars: min_chars)

        tag.div(**container_attrs) do
          safe_join([
            l_ui_combobox_label(label, id, required: required),
            (tag.p(hint, id: "#{id}-hint", class: "l-ui-form__hint") if hint),
            l_ui_combobox_control(id, tokens,
                                  value_name: value_name, placeholder: placeholder, hint: hint,
                                  reorder: reorder, disabled: disabled, required: required, url: url),
            l_ui_combobox_listbox(id, options, tokens, multiple: multiple, url: url),
            l_ui_combobox_template(reorder: reorder, disabled: disabled),
            (l_ui_combobox_option_template if url),
            tag.span(l_ui_combobox_instructions(multiple: multiple, create: create, url: url),
                     id: "#{id}-instructions", class: "l-ui-sr-only"),
            tag.div("", class: "l-ui-sr-only", role: "status", aria: { live: "polite" },
                        data: { "l-ui--combobox-target" => "status" })
          ].compact)
        end
      end

      private

      # Normalises the supported collection shapes into [label, value] pairs.
      def l_ui_combobox_option_pairs(collection)
        Array(collection).map do |option|
          case option
          when Hash
            [option[:label].to_s, option[:value].to_s]
          when Array
            [option.first.to_s, option.last.to_s]
          else
            [option.to_s, option.to_s]
          end
        end
      end

      # Pairs each selected value with its option label, which comes either with
      # the selection (as a pair or hash, the only option for a remote
      # collection) or from the matching option. A value with no label at all
      # is a created value, so it carries its own and is flagged so it posts
      # under the create parameter.
      def l_ui_combobox_tokens(selected, options, multiple:, create:, url:, value_name:, create_value_name:)
        entries = Array.wrap(selected).reject { |entry| entry.nil? || entry.to_s.empty? }
        entries = entries.first(1) unless multiple

        entries.map do |entry|
          given_label, value = l_ui_combobox_selection(entry)
          next if value.empty?

          label = given_label || options.detect { |_, option_value| option_value == value }&.first

          if label.nil? && !create
            raise ArgumentError,
                  "l_ui_combobox was given selected value #{value.inspect}, which is not in the " \
                  "collection. " +
                  (url ? "Pass it as a [label, value] pair, since a remote collection cannot be " \
                         "searched for its label. " : "") +
                  "Pass create: true (with create_name:) to allow values outside it."
          end

          {
            label: label || value,
            value: value,
            new: label.nil?,
            name: label.nil? ? create_value_name : value_name
          }
        end.compact
      end

      # A selection is either a bare value or a labelled ["Label", value] pair
      # or {label:, value:} hash. Returns [label or nil, value].
      def l_ui_combobox_selection(entry)
        case entry
        when Hash then [entry[:label]&.to_s, entry[:value].to_s]
        when Array then [entry.first&.to_s, entry.last.to_s]
        else [nil, entry.to_s]
        end
      end

      def l_ui_combobox_param(name, form, multiple:)
        base = form && name.is_a?(Symbol) ? form.field_name(name) : name.to_s
        multiple ? "#{base}[]" : base
      end

      def l_ui_combobox_data(data, multiple:, create:, reorder:, disabled:, value_name:, create_value_name:,
                             url: nil, min_chars: 0)
        data = (data || {}).deep_dup
        existing_controller = data.delete(:controller) || data.delete("controller")

        data[:controller] = [existing_controller, "l-ui--combobox"].compact.reject(&:empty?).join(" ")
        data[:"l-ui--combobox-multiple-value"] = multiple
        data[:"l-ui--combobox-create-value"] = create
        data[:"l-ui--combobox-reorder-value"] = reorder
        data[:"l-ui--combobox-disabled-value"] = disabled
        data[:"l-ui--combobox-name-value"] = value_name
        data[:"l-ui--combobox-create-name-value"] = create_value_name if create_value_name

        if url
          data[:"l-ui--combobox-url-value"] = url
          data[:"l-ui--combobox-min-chars-value"] = min_chars
        end

        data
      end

      def l_ui_combobox_drag_actions
        "dragstart->l-ui--combobox#dragstart " \
          "dragover->l-ui--combobox#dragover " \
          "drop->l-ui--combobox#drop " \
          "dragend->l-ui--combobox#dragend"
      end

      def l_ui_combobox_label(label, id, required:)
        return if label.blank?

        tag.label(class: "l-ui-label", for: "#{id}-input") do
          parts = [label]
          parts << tag.span("*", class: "l-ui-form__required", aria: { hidden: true }) if required
          safe_join(parts, " ")
        end
      end

      def l_ui_combobox_control(id, tokens, value_name:, placeholder:, hint:, reorder:, disabled:, required:, url: nil)
        described_by = [("#{id}-hint" if hint), "#{id}-instructions"].compact.join(" ")

        tag.div(class: class_names("l-ui-combobox__control", "l-ui-combobox__control--disabled" => disabled),
                data: { "l-ui--combobox-target" => "control", action: "click->l-ui--combobox#focusInput" }) do
          safe_join([
            # Posted before any token so clearing every token still submits the
            # field, rather than omitting it and leaving the association as-is.
            hidden_field_tag(value_name, "", id: nil),
            tag.ul(class: "l-ui-combobox__tokens",
                   data: {
                     "l-ui--combobox-target" => "tokens",
                     action: (l_ui_combobox_drag_actions if reorder)
                   }.compact) do
              safe_join(tokens.map do |token|
                l_ui_combobox_token(token, reorder: reorder, disabled: disabled)
              end)
            end,
            tag.input(
              type: "text",
              id: "#{id}-input",
              class: "l-ui-combobox__input",
              role: "combobox",
              placeholder: placeholder,
              autocomplete: "off",
              disabled: disabled,
              aria: {
                expanded: "false",
                controls: "#{id}-listbox",
                autocomplete: "list",
                haspopup: "listbox",
                describedby: described_by,
                required: (true if required)
              }.compact,
              data: {
                "l-ui--combobox-target" => "input",
                action: "input->l-ui--combobox#filter " \
                        "keydown->l-ui--combobox#keydown " \
                        "focus->l-ui--combobox#open " \
                        "blur->l-ui--combobox#blur"
              }
            ),
            (l_ui_combobox_busy if url)
          ].compact)
        end
      end

      # A token reuses the tag component's segments so it matches the tags used
      # elsewhere, and adds the hidden input carrying its value.
      def l_ui_combobox_token(token, reorder:, disabled:)
        draggable = reorder && !disabled

        tag.li(class: class_names("l-ui-combobox__token", "l-ui-tag",
                                  "l-ui-combobox__token--draggable" => draggable),
               draggable: (true if draggable),
               data: {
                 "l-ui--combobox-target" => "token",
                 value: token[:value],
                 new: token[:new].to_s
               }) do
          parts = []
          # Decorative: it advertises the drag, but the move buttons are what
          # actually carry reordering for the keyboard and for touch.
          parts << tag.span(l_ui_combobox_grip_icon, class: "l-ui-combobox__grip", aria: { hidden: true }) if draggable
          parts << tag.span(tag.span(token[:label], class: "l-ui-tag__label"),
                            class: "l-ui-tag__text")
          parts.concat(l_ui_combobox_move_controls(token, disabled: disabled)) if reorder
          parts << tag.button(l_ui_combobox_icon(:remove),
                              type: "button",
                              class: "l-ui-tag__remove",
                              disabled: disabled,
                              aria: { label: "Remove #{token[:label]}" },
                              data: { action: "l-ui--combobox#removeToken" })
          parts << hidden_field_tag(token[:name].to_s, token[:value], id: nil)
          safe_join(parts)
        end
      end

      def l_ui_combobox_move_controls(token, disabled:)
        [
          tag.button(l_ui_combobox_icon(:previous),
                     type: "button",
                     class: "l-ui-tag__button l-ui-combobox__move",
                     disabled: disabled,
                     aria: { label: "Move #{token[:label]} earlier" },
                     data: { action: "l-ui--combobox#moveTokenEarlier" }),
          tag.button(l_ui_combobox_icon(:next),
                     type: "button",
                     class: "l-ui-tag__button l-ui-combobox__move",
                     disabled: disabled,
                     aria: { label: "Move #{token[:label]} later" },
                     data: { action: "l-ui--combobox#moveTokenLater" })
        ]
      end

      def l_ui_combobox_listbox(id, options, tokens, multiple:, url: nil)
        selected_values = tokens.map { |token| token[:value] }

        tag.ul(id: "#{id}-listbox",
               class: "l-ui-combobox__listbox",
               role: "listbox",
               hidden: true,
               aria: { multiselectable: ("true" if multiple) }.compact,
               data: {
                 "l-ui--combobox-target" => "listbox",
                 # Scrolling to the foot of a remote list loads the next page.
                 action: ("scroll->l-ui--combobox#scrolled" if url)
               }.compact) do
          items = options.each_with_index.map do |(label, value), index|
            l_ui_combobox_option(label, value,
                                 id: "#{id}-option-#{index}",
                                 selected: selected_values.include?(value))
          end

          items << tag.li("No matches",
                          class: "l-ui-combobox__empty",
                          role: "presentation",
                          hidden: true,
                          data: { "l-ui--combobox-target" => "empty" })
          # Carries whatever the list has to say about itself rather than about
          # an option - how far into the matches it has got, or that they could
          # not be loaded - so it is presentational, never a choice. The spinner
          # beside it covers a page being fetched, which is a state rather than
          # a message.
          items << tag.li(class: "l-ui-combobox__notice",
                          role: "presentation",
                          hidden: true,
                          data: { "l-ui--combobox-target" => "notice" }) do
            safe_join([
              tag.span("", data: { "l-ui--combobox-target" => "noticeText" }),
              (l_ui_combobox_spinner(target: "moreSpinner") if url)
            ].compact)
          end
          safe_join(items)
        end
      end

      def l_ui_combobox_option(label, value, id: nil, selected: false)
        tag.li(l_ui_combobox_option_content(label),
               id: id,
               class: "l-ui-combobox__option",
               role: "option",
               aria: { selected: selected.to_s },
               data: {
                 "l-ui--combobox-target" => "option",
                 value: value,
                 label: label,
                 action: "mousedown->l-ui--combobox#selectOption"
               })
      end

      def l_ui_combobox_option_content(label)
        safe_join([
          tag.span(label, class: "l-ui-combobox__option-label"),
          tag.span(l_ui_combobox_check_icon, class: "l-ui-combobox__option-check")
        ])
      end

      # The blank token the controller clones for each new selection, so
      # client-rendered tokens match server-rendered ones exactly.
      def l_ui_combobox_template(reorder:, disabled:)
        tag.template(data: { "l-ui--combobox-target" => "template" }) do
          l_ui_combobox_token({ label: "", value: "", new: false, name: "" }, reorder: reorder, disabled: disabled)
        end
      end

      # Shown in place of a "searching" message: a request in flight is a state,
      # and a message that appears and vanishes within a keystroke is unreadable.
      # It is aria-hidden because the listbox carries aria-busy for the same
      # state, and the results are announced when they arrive.
      def l_ui_combobox_busy
        tag.span(l_ui_combobox_spinner,
                 class: "l-ui-combobox__busy",
                 hidden: true,
                 aria: { hidden: true },
                 data: { "l-ui--combobox-target" => "busy" })
      end

      def l_ui_combobox_spinner(target: nil)
        tag.span("",
                 class: "l-ui-combobox__spinner",
                 hidden: (true if target),
                 aria: { hidden: true },
                 data: ({ "l-ui--combobox-target" => target } if target))
      end

      # The blank option the controller clones for each fetched option, so
      # remote options match locally rendered ones exactly.
      def l_ui_combobox_option_template
        tag.template(data: { "l-ui--combobox-target" => "optionTemplate" }) do
          l_ui_combobox_option("", "")
        end
      end

      def l_ui_combobox_instructions(multiple:, create:, url: nil)
        parts = [
          if url
            "Type to search for options. Use the up and down arrow keys to browse them and Enter to choose. " \
              "More options load as you reach the end of the list."
          else
            "Type to filter the options. Use the up and down arrow keys to browse them and Enter to choose."
          end
        ]
        parts << "Enter also adds a value that is not in the list." if create
        parts << "Backspace on the empty input removes the last selection." if multiple
        parts.join(" ")
      end

      # The two-column dot grid conventionally used for a drag handle.
      def l_ui_combobox_grip_icon
        dots = [[9, 5], [15, 5], [9, 12], [15, 12], [9, 19], [15, 19]]

        tag.svg(
          safe_join(dots.map { |cx, cy| tag.circle(cx: cx, cy: cy, r: 1.6) }),
          class: "l-ui-icon--xs",
          fill: "currentColor",
          "viewBox" => "0 0 24 24",
          "aria-hidden" => "true"
        )
      end

      # The tick inside a selected option's badge. Drawn with a stroke rather
      # than as a filled outline (as the other icons are) so its weight can be
      # set independently of its size - a filled tick reads as a hairline once
      # it is scaled down to fit the badge.
      def l_ui_combobox_check_icon
        tag.svg(
          tag.path("d" => "m4.5 12.75 6 6 9-13.5",
                   "stroke-linecap" => "round", "stroke-linejoin" => "round"),
          class: "l-ui-combobox__option-check-icon",
          fill: "none",
          stroke: "currentColor",
          "stroke-width" => "4",
          "viewBox" => "0 0 24 24",
          "aria-hidden" => "true"
        )
      end

      # Rendered inline (rather than via image_tag) so each icon inherits the
      # surrounding currentColor; an <img>-loaded SVG cannot.
      def l_ui_combobox_icon(kind)
        paths = {
          remove: "M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 0 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z",
          previous: "M15.53 4.72a.75.75 0 0 1 0 1.06L9.31 12l6.22 6.22a.75.75 0 1 1-1.06 1.06l-6.75-6.75a.75.75 0 0 1 0-1.06l6.75-6.75a.75.75 0 0 1 1.06 0Z",
          next: "M8.47 4.72a.75.75 0 0 1 1.06 0l6.75 6.75a.75.75 0 0 1 0 1.06l-6.75 6.75a.75.75 0 1 1-1.06-1.06L14.69 12 8.47 5.78a.75.75 0 0 1 0-1.06Z"
        }

        tag.svg(
          tag.path("fill-rule" => "evenodd", "clip-rule" => "evenodd", "d" => paths.fetch(kind)),
          class: "l-ui-icon--sm",
          fill: "currentColor",
          "viewBox" => "0 0 24 24",
          "aria-hidden" => "true"
        )
      end
    end
  end
end
