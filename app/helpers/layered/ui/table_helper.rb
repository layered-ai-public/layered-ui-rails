module Layered
  module Ui
    module TableHelper
      # Renders a styled, accessible data table.
      #
      # Use this helper in any view to render a table with the engine's
      # +l-ui-table+ styles. Every column must supply a +render:+ proc
      # that receives a record and returns cell content — the helper does
      # not extract or format data itself.
      #
      #   l_ui_table(@personas,
      #     columns: [
      #       { attribute: :name, primary: true, render: ->(r) { link_to r.name, persona_path(r) } },
      #       { attribute: :description, render: ->(r) { truncate(r.description, length: 60) } },
      #     ],
      #     actions: ->(r) { link_to "Edit", edit_persona_path(r) },
      #     caption: "Personas"
      #   )
      #
      # Column options:
      #   attribute: (Symbol)  Used for label generation and sort links.
      #   label:     (String)  Custom header text. Defaults to humanised attribute.
      #   primary:   (Boolean) Renders as <th scope="row">. Defaults to first column.
      #   sortable:  (Boolean) Show sort link when query: is provided. Defaults to true.
      #   render:    (Proc)    Required. Receives (record), returns cell content.
      #
      # Pass +query:+ (a Ransack search object) and +turbo_frame:+ to enable
      # sortable column headers via +l_ui_sort_link+.

      # Formats a date/time value for display in a table cell.
      #
      #   l_ui_format_datetime(record.created_at) # => "15 Apr 2026, 10:30"
      def l_ui_format_datetime(value)
        value&.strftime("%-d %b %Y, %H:%M")
      end

      def l_ui_table(records, columns:, caption: nil, actions: nil, actions_label: "Actions", query: nil, url: nil, turbo_frame: nil)
        columns = normalise_table_columns(columns)
        col_count = columns.size + (actions ? 1 : 0)

        thead = tag.thead(class: "l-ui-table__header") do
          tag.tr do
            cells = columns.map do |col|
              if col[:sortable] && query
                l_ui_sort_link(query, col[:attribute], col[:label], url: url, turbo_frame: turbo_frame)
              else
                tag.th(col[:label], class: "l-ui-table__header-cell", scope: "col")
              end
            end
            cells << tag.th(actions_label, class: "l-ui-table__header-cell--action", scope: "col") if actions
            safe_join(cells)
          end
        end

        tbody = tag.tbody(class: "l-ui-table__body") do
          if records.empty?
            tag.tr do
              tag.td("No records found.", class: "l-ui-table__cell", colspan: col_count)
            end
          else
            safe_join(records.map do |record|
              tag.tr do
                cells = columns.map do |col|
                  table_cell(record, col)
                end
                cells << tag.td(class: "l-ui-table__cell--action") { actions.call(record) } if actions
                safe_join(cells)
              end
            end)
          end
        end

        caption_tag = caption ? tag.caption(caption, class: "l-ui-sr-only") : nil
        table = tag.table(class: "l-ui-table") { safe_join([caption_tag, thead, tbody].compact) }
        tag.div(table, class: "l-ui-container--table")
      end

      private

      def normalise_table_columns(columns)
        has_primary = columns.any? { |c| c[:primary] }
        columns.each_with_index.map do |col, i|
          unless col[:render]
            raise ArgumentError,
                  "Column #{col[:attribute].inspect} is missing a :render proc. " \
                  "Every column must supply render: ->(record) { ... }"
          end

          {
            attribute: col[:attribute],
            label: col[:label] || col[:attribute].to_s.humanize,
            sortable: col.fetch(:sortable, true),
            primary: has_primary ? col.fetch(:primary, false) : i == 0,
            render: col[:render]
          }
        end
      end

      def table_cell(record, col)
        value = col[:render].call(record)

        if col[:primary]
          tag.th(value, class: "l-ui-table__cell--primary", scope: "row")
        else
          tag.td(value, class: "l-ui-table__cell")
        end
      end
    end
  end
end
