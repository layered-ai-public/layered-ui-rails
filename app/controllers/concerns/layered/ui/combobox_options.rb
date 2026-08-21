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

      # Options:
      #   label:      (Symbol/Proc) Attribute, or callable taking the record, used for the option's label.
      #   value:      (Symbol/Proc) Attribute, or callable, used for the option's value. Defaults to +:id+.
      #   search:     (Array)       Attributes the term is matched against. Defaults to +label+.
      #   predicate:  (Symbol)      Ransack predicate for the match (default +:cont+; +:i_cont+ ignores case).
      #   combinator: (Symbol)      How the search attributes combine, +:or+ (default) or +:and+.
      #   term:       (String)      The term to search for. Defaults to +params[:term]+.
      #   page:       (Integer)     The page to return. Defaults to +params[:page]+.
      #   limit:      (Integer)     Options per page (default 20).
      def l_ui_combobox_options(scope, label:, value: :id, search: nil, predicate: :cont,
                                combinator: :or, term: nil, page: nil, limit: DEFAULT_LIMIT)
        term = (term.nil? ? l_ui_combobox_request_param(:term) : term).to_s.strip
        page = (page.nil? ? l_ui_combobox_request_param(:page) : page).to_i
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
        fields = Array(fields).map(&:to_s)

        if scope.respond_to?(:ransack)
          scope.ransack("#{fields.join("_#{combinator}_")}_#{predicate}" => term).result(distinct: true)
        else
          l_ui_combobox_like(scope, fields, term)
        end
      end

      # The fallback for apps without Ransack. Only the model's own columns can
      # be matched this way, so an association attribute is an error rather
      # than a query that silently finds nothing.
      def l_ui_combobox_like(scope, fields, term)
        model = scope.respond_to?(:klass) ? scope.klass : scope
        unknown = fields - model.column_names
        if unknown.any?
          raise ArgumentError,
                "l_ui_combobox_options cannot search #{unknown.join(', ')} on #{model.name}: they are not " \
                "columns of the table. Add the ransack gem to search attributes across associations."
        end

        condition = fields.map do |field|
          "#{model.quoted_table_name}.#{model.connection.quote_column_name(field)} LIKE :term"
        end.join(" OR ")

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
