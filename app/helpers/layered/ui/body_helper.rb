module Layered
  module Ui
    module BodyHelper
      # Register one or more body modifier classes from any template or layout.
      # Calls accumulate, so a shared layout and an individual page can each
      # contribute without clobbering one another. Pass full class names, e.g.
      # l_ui_add_body_class "l-ui-body--hide-header", "l-ui-body--glass-header".
      def l_ui_add_body_class(*modifiers)
        (@_l_ui_body_classes ||= []).concat(modifiers.flatten.compact)
        nil
      end

      # Render the full <body> class string, including the base l-ui-body class.
      # Deduplicates and space-joins, so repeated or multi-token modifiers are safe.
      #
      # The legacy `content_for :l_ui_body_class` is still honoured as a temporary
      # bridge so existing host apps keep working; prefer l_ui_add_body_class.
      def l_ui_body_classes
        token_list("l-ui-body", *(@_l_ui_body_classes || []), content_for(:l_ui_body_class))
      end
    end
  end
end
