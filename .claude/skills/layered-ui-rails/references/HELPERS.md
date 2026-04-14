# View helpers

All helpers are prefixed `l_ui_` and are available in all views automatically.

## Navigation

```ruby
l_ui_navigation_item(label, path, active: nil, &block)
```

- `label` (String) - link text
- `path` (String) - URL
- `active` (Boolean, optional) - force active state; defaults to `current_page?` check
- `&block` - optional nested navigation items

```erb
<% content_for :l_ui_navigation_items do %>
  <%= l_ui_navigation_item("Home", root_path) %>
  <%= l_ui_navigation_item("Products", products_path, active: true) do %>
    <%= l_ui_navigation_item("Electronics", electronics_path) %>
    <%= l_ui_navigation_item("Clothing", clothing_path) %>
  <% end %>
<% end %>
```

## Breadcrumbs

```ruby
l_ui_breadcrumbs(&block)
l_ui_breadcrumb_item(label, path = nil)
```

- `label` (String) - breadcrumb text
- `path` (String, optional) - URL; omit for the current page (sets `aria-current="page"`)

```erb
<%= l_ui_breadcrumbs do %>
  <%= l_ui_breadcrumb_item("Home", root_path) %>
  <%= l_ui_breadcrumb_item("Users", users_path) %>
  <%= l_ui_breadcrumb_item("Alice") %>
<% end %>
```

## Pagination (requires pagy gem)

```ruby
l_ui_pagy(pagy)
```

- `pagy` (Pagy) - the pagy object from controller
- Returns `nil` if pagy is not installed or there is only one page

```erb
<%= l_ui_pagy(@pagy) %>
```

## Search form (requires ransack gem)

```ruby
l_ui_search_form(query, url: nil, fields: [], predicate: :cont, combinator: :or,
                 label: "Search", placeholder: nil, button: "Search",
                 clear: nil, turbo_frame: nil, html: {}, &block)
```

- `query` (Ransack::Search) - the `@q` object from controller
- `url` (String, required) - form action URL
- `fields` (Array<Symbol>) - fields to search (simple mode)
- `predicate` (Symbol) - ransack predicate, default `:cont`
- `combinator` (Symbol) - `:or` or `:and` for multiple fields
- `label` (String) - hidden label for the search input
- `placeholder` (String) - input placeholder
- `button` (String) - submit button text
- `clear` (String|Boolean) - clear button text; `true` for default, `false` to hide
- `turbo_frame` (String) - turbo frame to target
- `html` (Hash) - additional form HTML attributes
- `&block` - custom form markup (overrides simple mode)

Simple mode:

```erb
<%= l_ui_search_form(@q, url: users_path, fields: [:name, :email],
    placeholder: "Search users", clear: true, turbo_frame: "users") %>
```

Custom mode:

```erb
<%= l_ui_search_form(@q, url: users_path) do |f| %>
  <%= render "layered_ui/shared/search_field", form: f, field: :name_cont, label: "Name" %>
  <%= render "layered_ui/shared/search_select", form: f, field: :status_eq,
      label: "Status", options: ["Active", "Inactive"], include_blank: "Any" %>
  <%= f.submit "Search", class: "l-ui-button--primary" %>
<% end %>
```

## Sort link (requires ransack gem)

```ruby
l_ui_sort_link(query, attribute, label = nil, default_order: nil,
               turbo_frame: nil, html: {})
```

- `query` (Ransack::Search) - the `@q` object
- `attribute` (Symbol) - model attribute to sort by
- `label` (String, optional) - custom header text; defaults to humanised attribute name
- `default_order` (Symbol) - `:asc` or `:desc` on first click
- `turbo_frame` (String) - turbo frame target
- `html` (Hash) - additional HTML attributes

Returns a `<th>` element with sort link and ARIA sort attributes.

```erb
<table class="l-ui-table">
  <thead class="l-ui-table__header">
    <tr>
      <%= l_ui_sort_link(@q, :name) %>
      <%= l_ui_sort_link(@q, :created_at, "Joined", default_order: :desc, turbo_frame: "users") %>
    </tr>
  </thead>
</table>
```

## Authentication

```ruby
l_ui_user_signed_in?   # Returns true if current user is present
l_ui_current_user      # Returns the current user object
l_ui_devise_installed? # Returns true if Devise is loaded
```

Configure the current user method:

```ruby
# config/initializers/layered_ui.rb
Layered::Ui.current_user_method = :current_member
```

## Shared partials

### Form errors summary

```erb
<%= render "layered_ui/shared/form_errors", item: @user %>
```

### Individual field error

```erb
<%= render "layered_ui/shared/field_error", object: @user, field: :email %>
```

### Form label

```erb
<%= render "layered_ui/shared/label", form: f, field: :email, name: "Email", required: true %>
```

### Search field (inside `l_ui_search_form` block)

```erb
<%= render "layered_ui/shared/search_field", form: f, field: :name_cont,
    label: "Name", placeholder: "Enter name" %>
```

### Search select (inside `l_ui_search_form` block)

```erb
<%= render "layered_ui/shared/search_select", form: f, field: :status_eq,
    label: "Status", options: ["Active", "Inactive"], include_blank: "Any" %>
```
