module Layered
  module Ui
    # Builds the JSON a combobox rendered with +url:+ expects, so a remote
    # option list is a couple of lines in the host app's controller rather than
    # a hand-rolled endpoint:
    #
    #   class UsersController < ApplicationController
    #     include Layered::Ui::ComboboxOptions
    #
    #     def options
    #       render json: l_ui_combobox_options(policy_scope(User), label: :name, search: [:name, :email])
    #     end
    #   end
    #
    # The endpoint is deliberately plain: it reads +term+ and +page+ from the
    # query string and answers with
    #
    #   { "options": [{ "label": "Ada Lovelace", "value": "7" }], "page": 1, "pages": 3, "count": 42 }
    #
    # Ransack and Pagy are used when they are available - Ransack to build the
    # search predicate (so association attributes such as +:author_name+ work),
    # Pagy to take the page - and there is a plain Active Record fallback for
    # when they are not, so neither gem is required.
    #
    # Endpoints stay the host app's own actions on purpose: there is no generic
    # "query any model" route to authorise, so the scope passed in is whatever
    # the current user is allowed to see.
    module ComboboxOptions
      DEFAULT_LIMIT = 20

      # The predicates the Ransack-less fallback can build for itself, mapping a
      # quoted column onto its condition. Ransack has many more, so the rest are
      # an error rather than a query quietly matching on something else.
      # +i_cont+ lowers both sides, as Ransack's own does, rather than reaching
      # for an ILIKE only PostgreSQL has.
      LIKE_PREDICATES = {
        cont: ->(column) { "#{column} LIKE :term" },
        i_cont: ->(column) { "LOWER(#{column}) LIKE :term" }
      }.freeze

      # Options:
      #   label:      (Symbol/Proc) Attribute, or callable taking the record, used for the option's label.
      #   value:      (Symbol/Proc) Attribute, or callable, used for the option's value. Defaults to +:id+.
      #   search:     (Array)       Attributes the term is matched against. Defaults to +label+, so it is
      #                            required when +label+ is a callable.
      #   predicate:  (Symbol)      Ransack predicate for the match (default +:cont+; +:i_cont+ ignores case).
      #                            Without Ransack only +:cont+ and +:i_cont+ can be built; any other raises.
      #   combinator: (Symbol)      How the search attributes combine, +:or+ (default) or +:and+.
      #   term:       (String)      The term to search for. Defaults to +params[:term]+.
      #   page:       (Integer)     The page to return. Defaults to +params[:page]+.
      #   limit:      (Integer)     Options per page (default 20).
      def l_ui_combobox_options(scope, label:, value: :id, search: nil, predicate: :cont,
                                combinator: :or, term: nil, page: nil, limit: DEFAULT_LIMIT)
        # Both come off the query string, where a parameter can arrive as any
        # shape Rack can parse - +?page[]=1+ hands over an Array - so each is
        # read through to_s. A page that makes no sense is the first page, as a
        # missing one is, rather than an exception from the coercion.
        term = (term.nil? ? l_ui_combobox_request_param(:term) : term).to_s.strip
        page = (page.nil? ? l_ui_combobox_request_param(:page) : page).to_s.to_i
        page = 1 if page < 1

        matches = term.empty? ? scope.all : l_ui_combobox_matches(scope, search || [label], term, predicate, combinator)
        matches = l_ui_combobox_ordered(matches, label)
        records, count, pages = l_ui_combobox_page(matches, page, limit)

        {
          options: records.map do |record|
            { label: l_ui_combobox_attribute(record, label).to_s,
              value: l_ui_combobox_attribute(record, value).to_s }
          end,
          page: page,
          pages: pages,
          count: count
        }
      end

      private

      def l_ui_combobox_request_param(key)
        params[key] if respond_to?(:params)
      end

      def l_ui_combobox_attribute(record, accessor)
        accessor.respond_to?(:call) ? accessor.call(record) : record.public_send(accessor)
      end

      def l_ui_combobox_matches(scope, fields, term, predicate, combinator)
        fields = l_ui_combobox_search_fields(fields)
        combinator = l_ui_combobox_combinator(combinator)

        if scope.respond_to?(:ransack)
          l_ui_combobox_ransack(scope, fields, term, predicate, combinator)
        else
          l_ui_combobox_like(scope, fields, term, predicate, combinator)
        end
      end

      # Ransack answers a combinator it does not know by dropping the whole
      # condition, and the fallback would read anything but +:and+ as +:or+, so
      # neither backend would say what had happened.
      def l_ui_combobox_combinator(combinator)
        return combinator.to_s.to_sym if %w[or and].include?(combinator.to_s)

        raise ArgumentError,
              "l_ui_combobox_options was given combinator: #{combinator.inspect}. It says how the search " \
              "attributes combine, and is :or (the default) or :and."
      end

      # A callable makes a good label but not a good search attribute: the
      # searching is the database's to do, so there is nothing to build a
      # predicate from. Caught here rather than left to the backend, which
      # answers a key it cannot parse with an error from its own internals.
      def l_ui_combobox_search_fields(fields)
        fields = Array(fields)
        unusable = fields.reject { |field| field.is_a?(Symbol) || field.is_a?(String) }

        if unusable.any?
          raise ArgumentError,
                "l_ui_combobox_options cannot search a #{unusable.first.class}: pass search: with the " \
                "attributes the term should be matched against, since a computed label gives it nothing " \
                "to search on."
        end

        fields.map(&:to_s)
      end

      # Ransack answers a condition it does not recognise by dropping it rather
      # than raising, and a search with no conditions left is the whole scope -
      # so every term would match everything, quietly. One unrecognised
      # attribute takes the whole condition with it, valid attributes included,
      # so this is said out loud, as the LIKE fallback says it.
      def l_ui_combobox_ransack(scope, fields, term, predicate, combinator)
        search = scope.ransack("#{fields.join("_#{combinator}_")}_#{predicate}" => term)
        return search.result(distinct: true) if search.conditions.any?

        model = scope.respond_to?(:klass) ? scope.klass : scope
        raise ArgumentError,
              "l_ui_combobox_options cannot search #{fields.join(', ')} on #{model.name} with the " \
              "#{predicate} predicate: Ransack does not recognise that condition and drops it, which " \
              "would leave every term matching everything. Check the model's ransackable_attributes, " \
              "and its ransackable_associations for an attribute across an association."
      end

      # The fallback for apps without Ransack. Only the model's own columns can
      # be matched this way, so an association attribute is an error rather
      # than a query that silently finds nothing - and so is a predicate it
      # cannot build, rather than one it ignores.
      def l_ui_combobox_like(scope, fields, term, predicate = :cont, combinator = :or)
        model = scope.respond_to?(:klass) ? scope.klass : scope
        unknown = fields - model.column_names
        if unknown.any?
          raise ArgumentError,
                "l_ui_combobox_options cannot search #{unknown.join(', ')} on #{model.name}: they are not " \
                "columns of the table. Add the ransack gem to search attributes across associations."
        end

        matcher = LIKE_PREDICATES[predicate.to_s.to_sym]
        unless matcher
          raise ArgumentError,
                "l_ui_combobox_options cannot search with the #{predicate} predicate without Ransack: on " \
                "its own it builds #{LIKE_PREDICATES.keys.map(&:inspect).join(' and ')}. Add the ransack " \
                "gem for the rest of its predicates."
        end

        condition = fields.map do |field|
          matcher.call("#{model.quoted_table_name}.#{model.connection.quote_column_name(field)}")
        end.join(combinator.to_s == "and" ? " AND " : " OR ")

        term = term.downcase if predicate.to_s == "i_cont"
        scope.where(condition, term: "%#{term}%")
      end

      # An unordered relation would return arbitrary - and between pages,
      # overlapping - rows, so fall back to the label, or the primary key when
      # the label is not something the database can order by - a callable, or a
      # method on the model rather than one of its columns.
      def l_ui_combobox_ordered(matches, label)
        return matches unless matches.respond_to?(:order_values) && matches.order_values.empty?

        model = matches.respond_to?(:klass) ? matches.klass : matches
        column = label.is_a?(Symbol) && model.column_names.include?(label.to_s)

        matches.order(column ? label : matches.primary_key)
      end

      def l_ui_combobox_page(matches, page, limit)
        if defined?(Pagy) && respond_to?(:pagy, true)
          # An out-of-range page answers with an empty list rather than raising,
          # whatever the host app's Pagy configuration does elsewhere.
          pagy, records = pagy(matches, limit: limit, page: page, raise_range_error: false)
          [records, pagy.count, pagy.pages]
        else
          count = matches.count
          [matches.limit(limit).offset((page - 1) * limit), count, [(count.to_f / limit).ceil, 1].max]
        end
      end
    end
  end
end
