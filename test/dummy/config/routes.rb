Rails.application.routes.draw do
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
  get "layouts", to: "pages#layouts"
  get "content", to: "pages#content"
  get "tabs", to: "pages#tabs"
  get "conversations", to: "pages#conversations"
  get "devise", to: "pages#devise"
  get "form_errors", to: "pages#form_errors"
  get "integrations", to: "pages#integrations"
  get "pagy", to: "pages#pagy_integration", as: :pagy
end
