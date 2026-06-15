Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users

  root "pages#home"

  get "buttons", to: "pages#buttons"
  get "icons", to: "pages#icons"
  get "notices", to: "pages#notices"
  get "badges", to: "pages#badges"
  get "links", to: "pages#links"
  get "surfaces", to: "pages#surfaces"
  get "hero", to: "pages#hero"
  get "cards", to: "pages#cards"
  get "tables", to: "pages#tables"
  get "tables_helper", to: "pages#tables_helper"
  get "pagination", to: "pages#pagination"
  get "forms", to: "pages#forms"
  get "containers", to: "pages#containers"
  get "utilities", to: "pages#utilities"
  get "typography", to: "pages#typography"
  get "layout", to: "pages#layout"
  get "layout_metadata", to: "pages#layout_metadata"
  get "layout_navigation", to: "pages#layout_navigation"
  get "layout_header", to: "pages#layout_header"
  get "layout_panel", to: "pages#layout_panel"
  get "layout_logos", to: "pages#layout_logos"
  get "layout_icons", to: "pages#layout_icons"
  get "layout_colors", to: "pages#layout_colors"
  get "layout_head", to: "pages#layout_head"
  get "layout_breadcrumbs", to: "pages#layout_breadcrumbs"
  get "tabs", to: "pages#tabs"
  get "modals", to: "pages#modals"
  get "conversations", to: "pages#conversations"
  get "devise", to: "pages#devise"
  get "forms_helper", to: "pages#forms_helper"
  get "form_errors", to: "pages#form_errors"
  get "integrations", to: "pages#integrations"
  get "pagy", to: "pages#pagy_integration", as: :pagy
  get "ransack", to: "pages#ransack_integration", as: :ransack
  get "search", to: "pages#search", as: :search
  get "test_icon_url_override", to: "pages#test_icon_url_override"
  get "test_panel_icon_light_only", to: "pages#test_panel_icon_light_only"
  get "test_panel_icon_dark_only", to: "pages#test_panel_icon_dark_only"
  get "test_logo_override", to: "pages#test_logo_override"
  get "test_head_injection", to: "pages#test_head_injection"
  get "test_header_actions", to: "pages#test_header_actions"
  get "test_header_actions_replaced", to: "pages#test_header_actions_replaced"
end
