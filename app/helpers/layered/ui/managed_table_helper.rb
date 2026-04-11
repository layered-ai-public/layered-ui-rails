module Layered
  module Ui
    module ManagedTableHelper
      # Renders a styled, accessible data table.
      #
      # Use this helper in any view to render a table with the engine's
      # +l-ui-table+ styles. It supports custom cell rendering via procs,
      # an optional actions column, and Ransack sort links.
      #
      #   l_ui_managed_table(@personas,
      #     columns: [
      #       { attribute: :name, primary: true, render: ->(r) { link_to r.name, persona_path(r) } },
      #       { attribute: :description, render: ->(r) { truncate(r.description, length: 60) } },
      #     ],
      #     actions: ->(r) { link_to "Edit", edit_persona_path(r) },
      #     caption: "Personas"
      #   )
      #
      # Column options:
      #   attribute: (Symbol)  Model attribute for data and label generation.
      #   label:     (String)  Custom header text. Defaults to humanised attribute.
      #   primary:   (Boolean) Renders as <th scope="row">. Defaults to first column.
      #   sortable:  (Boolean) Show sort link when query: is provided. Defaults to true.
      #   render:    (Proc)    Receives (record), returns cell content.
      #
      # When no +render:+ proc is given, the cell value is extracted via
      # +record.public_send(attribute)+ with automatic date formatting.
      #
      # Pass +query:+ (a Ransack search object) and +turbo_frame:+ to enable
      # sortable column headers via +l_ui_sort_link+.
      def l_ui_managed_table(records, columns:, caption: nil, actions: nil, actions_label: "Actions", query: nil, turbo_frame: nil)
        columns = normalise_managed_columns(columns)
        col_count = columns.size + (actions ? 1 : 0)

        thead = tag.thead(class: "l-ui-table__header") do
          tag.tr do
            cells = columns.map do |col|
              if col[:sortable] && query
                l_ui_sort_link(query, col[:attribute], col[:label], turbo_frame: turbo_frame)
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
                  managed_table_cell(record, col)
                end
                cells << tag.td(class: "l-ui-table__cell--action") { actions.call(record) } if actions
                safe_join(cells)
              end
            end)
          end
        end

        caption_tag = caption ? tag.caption(caption, class: "l-ui-sr-only") : nil
        table = tag.table(class: "l-ui-table") { safe_join([caption_tag, thead, tbody].compact) }
        tag.div(table, class: "l-ui-container--table l-ui-utility--mt-lg")
      end

      private

      def normalise_managed_columns(columns)
        has_primary = columns.any? { |c| c[:primary] }
        columns.each_with_index.map do |col, i|
          {
            attribute: col[:attribute],
            label: col[:label] || col[:attribute].to_s.gsub("_", " ").sub(/\A\w/, &:upcase),
            sortable: col.fetch(:sortable, true),
            primary: has_primary ? col.fetch(:primary, false) : i == 0,
            render: col[:render]
          }
        end
      end

      def managed_table_cell(record, col)
        if col[:render]
          value = col[:render].call(record)
        else
          raw = record.public_send(col[:attribute])
          value = raw.respond_to?(:strftime) ? raw.strftime("%-d %b %Y %H:%M") : raw
        end

        if col[:primary]
          tag.th(value, class: "l-ui-table__cell--primary", scope: "row")
        else
          tag.td(value, class: "l-ui-table__cell")
        end
      end
    end
  end
end
