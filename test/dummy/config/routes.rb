Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  devise_for :users, path: "", path_names: { sign_in: "login", sign_up: "register", sign_out: "logout" }

  root "pages#welcome"

  get "buttons", to: "pages#buttons"
  get "icons", to: "pages#icons"
  get "notices", to: "pages#notices"
  get "badges", to: "pages#badges"
  get "links", to: "pages#links"
  get "surfaces", to: "pages#surfaces"
  get "tables", to: "pages#tables"
  get "pagination", to: "pages#pagination"
  get "forms", to: "pages#forms"
  get "containers", to: "pages#containers"
  get "utilities", to: "pages#utilities"
  get "typography", to: "pages#typography"
  get "layout", to: "pages#layout"
  get "layout_metadata", to: "pages#layout_metadata"
  get "layout_navigation", to: "pages#layout_navigation"
  get "layout_panel", to: "pages#layout_panel"
  get "layout_logos", to: "pages#layout_logos"
  get "layout_icons", to: "pages#layout_icons"
  get "layout_colors", to: "pages#layout_colors"
  get "layout_head", to: "pages#layout_head"
  get "tabs", to: "pages#tabs"
  get "conversations", to: "pages#conversations"
  get "devise", to: "pages#devise"
  get "form_errors", to: "pages#form_errors"
  get "integrations", to: "pages#integrations"
  get "pagy", to: "pages#pagy_integration", as: :pagy
  get "ransack", to: "pages#ransack_integration", as: :ransack
  get "test_icon_url_override", to: "pages#test_icon_url_override"
  get "test_logo_override", to: "pages#test_logo_override"
  get "test_head_injection", to: "pages#test_head_injection"
end
