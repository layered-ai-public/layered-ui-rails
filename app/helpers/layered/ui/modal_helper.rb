module Layered
  module Ui
    module ModalHelper
      # Renders a modal as a <dialog> wired up to the +l-ui--modal+ Stimulus
      # controller. The block's content is the modal body; call +m.trigger+ to
      # render a colocated trigger button.
      #
      #   <%= l_ui_modal(title: "Socials") do |m| %>
      #     <% m.trigger(class: "l-ui-button l-ui-button--outline") do %>
      #       Open socials
      #     <% end %>
      #     <p>Body content.</p>
      #   <% end %>
      #
      # To open the modal from elsewhere on the page (or to have multiple
      # triggers), give it a known +id:+ and add +data-l-ui-modal-open="<id>"+
      # to any button. The button does not need to live inside the helper's
      # wrapper; the +l-ui--modal+ controller listens at the document level
      # for matching clicks.
      #
      #   <button type="button" data-l-ui-modal-open="confirm-modal">Open</button>
      #
      # Calling +dialog.showModal()+ directly is not supported: it bypasses the
      # +l-ui--modal+ controller and skips scroll lock, focus restoration, open-
      # count tracking, and the screen-reader announcement.
      #
      # Note: use +<% m.trigger %>+ (without the equals sign) so its content is
      # captured by the builder rather than written to the body buffer.
      #
      # Options:
      #   title:          (String)  Required. Modal heading; also used for aria-labelledby.
      #   id:             (String)  DOM id for the <dialog>; defaults to an auto-generated id.
      #   heading_level:  (Symbol)  Heading tag for the title (e.g. :h2, :h3). Defaults to :h3.
      #   container:      (Hash)    Extra HTML attributes for the wrapping <div>.
      def l_ui_modal(title:, id: nil, heading_level: :h3, container: {}, &block)
        id ||= "l-ui-modal-#{SecureRandom.hex(4)}"
        builder = ModalBuilder.new(self, title: title, id: id, heading_level: heading_level)
        body_content = capture { block.call(builder) }

        container_attrs = container.deep_dup
        container_data = container_attrs[:data] || {}
        existing_controller = container_data.delete(:controller) || container_data.delete("controller")
        container_data[:controller] = [existing_controller, "l-ui--modal"].compact.reject(&:empty?).join(" ")
        container_attrs[:data] = container_data

        tag.div(**container_attrs) do
          safe_join([
            builder.trigger_html || ActiveSupport::SafeBuffer.new,
            render_modal_dialog(builder, body_content)
          ])
        end
      end

      class ModalBuilder
        attr_reader :title, :id, :heading_level, :trigger_html

        def initialize(view, title:, id:, heading_level: :h3)
          @view = view
          @title = title
          @id = id
          @heading_level = heading_level
        end

        def trigger(**options, &block)
          options = options.deep_dup
          options[:type] ||= "button"
          data = options[:data] || {}
          existing_action = data.delete(:action) || data.delete("action")
          data[:action] = [existing_action, "l-ui--modal#open"].compact.reject(&:empty?).join(" ")
          options[:data] = data
          content = @view.capture(&block)
          @trigger_html = @view.tag.button(content, **options)
          nil
        end
      end

      private

      def render_modal_dialog(builder, body_content)
        heading_id = "#{builder.id}-heading"

        dialog_attrs = {
          id: builder.id,
          class: "l-ui-modal",
          data: {
            "l-ui--modal-target" => "dialog",
            "action" => "click->l-ui--modal#closeOnBackdrop"
          },
          aria: { labelledby: heading_id }
        }

        tag.dialog(**dialog_attrs) do
          safe_join([
            tag.div(class: "l-ui-modal__header") do
              safe_join([
                content_tag(builder.heading_level, builder.title, id: heading_id),
                tag.button(
                  image_tag("layered_ui/icon_close.svg", alt: "", class: "l-ui-icon l-ui-icon--sm", aria: { hidden: true }),
                  class: "l-ui-button l-ui-button--icon",
                  type: "button",
                  data: { action: "l-ui--modal#close" },
                  "aria-label" => "Close"
                )
              ])
            end,
            tag.div(body_content, class: "l-ui-modal__body")
          ])
        end
      end
    end
  end
end
