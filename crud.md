# Extend managed resources with new/edit CRUD actions

## Context

The managed resource pattern currently provides convention-over-configuration index views (search, sort, pagination) with zero host app code. The user wants to extend this to cover new/edit/create/update actions, so a developer can get full CRUD by adding a class method to their model, without writing controllers or views.

The central tension: the index action works generically (all models have columns), but forms are model-specific (different fields, validations, associations). The approach below resolves this by having models declare their form fields via `l_ui_managed_fields`, from which the engine auto-derives strong params, renders fields by type, and handles the full create/update lifecycle.

### Scope decisions

- **No `show` action.** Index-to-edit is the standard pattern for admin UIs. A read-only detail view can be added later behind a `l_ui_managed_show_fields` method if needed.
- **Turbo strategy.** Form views render as full pages (no Turbo Frame wrapping). `form_with` submits via Turbo by default in Rails 7+; successful saves use standard `redirect_to` (Turbo handles this as a visit). Validation failures re-render with `status: :unprocessable_entity`, which Turbo renders in-place correctly. Destroy uses a standard `button_to` with `method: :delete` and `data-turbo-confirm` for browser-native confirmation.

---

## Phase 1 - Model concern (`app/models/concerns/layered/ui/managed_resource.rb`)

Add new class methods (all with safe defaults for backwards compatibility):

| Method | Default | Purpose |
|--------|---------|---------|
| `l_ui_managed_fields` | `[]` | Array of field hashes defining form fields. Empty = CRUD disabled. |
| `l_ui_managed_permitted_params` | Auto-derived from fields | Array of symbols for `params.permit(...)`. Override for nested attrs. |
| `l_ui_managed_build_record(controller)` | `self.new` | How to build a new record. Override for scoped builds (e.g. `current_user.posts.build`). |
| `l_ui_managed_scope(controller)` | `self.all` | Scope for finding records. Also used in index action. |
| `l_ui_managed_after_save_path(controller, record)` | Index path | Redirect target after create/update. |

**Field hash options:**
- `attribute:` (Symbol, required) - model attribute
- `as:` (Symbol, auto-detected from column type) - `:string`, `:text`, `:email`, `:number`, `:date`, `:datetime`, `:select`, `:checkbox`, `:hidden`
- `label:` (String, auto-humanised) - custom label
- `required:` (Boolean, `false`) - marks field as required
- `hint:` (String, nil) - help text
- `collection:` (Array or Proc, nil) - for `:select` fields, `[["Label", value], ...]` or `-> { Model.pluck(:name, :id) }`. Procs are called at render time in the view context.
- `placeholder:` (String, nil)

Any additional keys (e.g. `include_blank:`, `rows:`) are passed through to the underlying Rails form helper.

**Type auto-detection** from `columns_hash`: text->`:text`, integer/float/decimal->`:number`, boolean->`:checkbox`, date->`:date`, datetime->`:datetime`, else->`:string`. Falls back to `:string` for virtual attributes or attributes not present in `columns_hash` (e.g. `attr_accessor`, delegated attributes, store accessors).

**Permitted params auto-derivation**: extract `attribute` from each field hash. Safe because the developer explicitly listed the fields.

Use `l_ui_managed_scope(controller)` in the existing index action too (replace `@model.ransack(...)` with `@model.l_ui_managed_scope(self).ransack(...)`).

---

## Phase 2 - Form helper (`app/helpers/layered/ui/managed_form_helper.rb`) [NEW FILE]

Analogous to `ManagedTableHelper`. Two public methods:

**`l_ui_managed_form(record, fields:, url:, method: nil)`** - renders a complete `<form>` with all fields, error summary, and submit button. Standalone helper for host apps that want managed form rendering in their own controllers.

**`l_ui_managed_field(form, record, field_config)`** - renders a single field group (label + input + hint + error). Used by the form partial and available standalone.

Private `managed_field_input(form, record, config)` dispatches by `as:` type:
- `:string` / `:email` / `:number` / `:date` / `:datetime` -> `form.{type}_field` with `class: "l-ui-form__field"`
- `:text` -> `form.text_area` with `class: "l-ui-form__field"`, `rows: 4`
- `:select` -> wrapped in `div.l-ui-select-wrapper`, `form.select` with `class: "l-ui-select"`
- `:checkbox` -> `div.l-ui-container--checkbox` pattern
- `:hidden` -> `form.hidden_field`

All inputs get `aria-describedby` pointing to the field error element ID.

Register in `lib/layered/ui/engine.rb` alongside existing helpers.

---

## Phase 3 - Routing (`lib/layered/ui/routing.rb`)

Extend `l_ui_managed_resources` to generate full CRUD routes. Follow Rails singular/plural conventions - plural for collection routes, singular for member routes:

```
GET    /posts          -> index   (managed_posts_path)
GET    /posts/new      -> new     (new_managed_post_path)
POST   /posts          -> create  (managed_posts_path, POST)
GET    /posts/:id/edit -> edit    (edit_managed_post_path)
PATCH  /posts/:id      -> update  (managed_post_path)
DELETE /posts/:id      -> destroy (managed_post_path, DELETE)
```

Add `only:` keyword to limit actions. Default: `[:index, :new, :create, :edit, :update, :destroy]`.

Named route convention follows Rails: `managed_posts` (collection), `managed_post` (member), `new_managed_post`, `edit_managed_post`.

Scoped routes must compose correctly with the existing `prefix` logic: e.g. under `scope "/admin"`, routes become `new_managed_admin_post_path`, `edit_managed_admin_post_path(id)`, etc.

---

## Phase 4 - Controller (`app/controllers/layered/ui/managed_resource_controller.rb`)

Extract shared setup into `before_action :resolve_managed_resource`:
- Sets `@model`, `@managed_route_key`, `@columns`, all URL helpers
- Sets `@fields = @model.l_ui_managed_fields`
- Sets `@crud_enabled = @fields.any?`

Ransack/Pagy setup (`@q`, `@pagy`, `@records`) stays in the `index` action - CRUD actions don't need it.

Add `before_action :require_managed_fields, only: [:new, :create, :edit, :update, :destroy]` - raises routing error if fields empty, with a developer-friendly message (e.g. "Define `l_ui_managed_fields` on Post to enable CRUD actions").

New actions:

**`new`**: `@record = @model.l_ui_managed_build_record(self)`

**`create`**: Build record, assign `managed_resource_params`, save. Success: redirect to `@model.l_ui_managed_after_save_path(self, @record)` with `flash[:notice]` (e.g. "Post created"). Failure: re-render `new` with `status: :unprocessable_entity`.

**`edit`**: `@record = @model.l_ui_managed_scope(self).find(params[:id])`

**`update`**: Find record via scope, assign params, save. Success: redirect with `flash[:notice]` (e.g. "Post updated"). Failure: re-render `edit` with 422.

**`destroy`**: Find record via scope, call `destroy`. Redirect to index with `flash[:notice]` (e.g. "Post deleted").

Private `managed_resource_params`: `params.require(@model.model_name.param_key).permit(*@model.l_ui_managed_permitted_params)`

---

## Phase 5 - Views

**`app/views/layered/ui/managed_resource/new.html.erb`**:
- `<h1>` "New {model name}"
- Renders `_form` partial

**`app/views/layered/ui/managed_resource/edit.html.erb`**:
- `<h1>` "Edit {model name}"
- Renders `_form` partial

**`app/views/layered/ui/managed_resource/_form.html.erb`**:
- `form_with(model: @record, url: @form_url, class: "l-ui-form")`
- Renders existing `layered_ui/shared/form_errors` partial for the error summary
- Iterates `@fields`, calls `l_ui_managed_field` for each (which internally renders the existing `layered_ui/shared/label` and `layered_ui/shared/field_error` partials)
- Submit button: "Create" or "Save changes" based on `new_record?`

**Update `index.html.erb`**:
- Add "New" link when `@crud_enabled`
- Add actions column to the table when `@crud_enabled` with edit link and delete `button_to` (using `data-turbo-confirm: "Are you sure?"` for browser-native confirmation)

---

## Phase 6 - Dummy app and tests

Tests should be written alongside each phase, not batched at the end. The listing below groups them for clarity but each test file should be created when its corresponding phase is implemented.

**Post model** (`test/dummy/app/models/post.rb`):
- Add `l_ui_managed_fields` with title (string, required), body (text), user_id (select)
- Add `validates :title, presence: true`

**Unit tests** (`test/helpers/managed_form_helper_test.rb`) - write with Phase 2:
- Each field type renders correct HTML and CSS classes
- Label with required/optional
- Hint rendering
- Field error rendering
- Select with static and callable collections
- Type auto-detection
- Fallback to `:string` for unknown/virtual attributes

**Integration tests** (`test/integration/managed_resource_crud_test.rb`) - write with Phase 4:
- GET new renders form
- POST create with valid params redirects
- POST create with invalid params re-renders with 422
- GET edit renders form with existing values
- PATCH update with valid params redirects
- PATCH update with invalid params re-renders with 422
- DELETE destroy removes record and redirects to index
- DELETE destroy on missing record returns 404
- CRUD returns routing error when fields empty
- Verify existing index tests still pass with `l_ui_managed_scope` retrofit

**Update dummy docs page** (`test/dummy/app/views/pages/managed_resources.html.erb`) with CRUD setup instructions.

---

## Files to modify

| File | Action |
|------|--------|
| `app/models/concerns/layered/ui/managed_resource.rb` | Add field/param/scope/build methods |
| `app/controllers/layered/ui/managed_resource_controller.rb` | Add new/create/edit/update, extract before_actions |
| `lib/layered/ui/routing.rb` | Generate CRUD routes, add `only:` |
| `lib/layered/ui/engine.rb` | Register ManagedFormHelper |
| `app/helpers/layered/ui/managed_form_helper.rb` | **New** - form rendering helper |
| `app/views/layered/ui/managed_resource/new.html.erb` | **New** |
| `app/views/layered/ui/managed_resource/edit.html.erb` | **New** |
| `app/views/layered/ui/managed_resource/_form.html.erb` | **New** |
| `app/views/layered/ui/managed_resource/index.html.erb` | Add "New" button and edit links |
| `test/dummy/app/models/post.rb` | Add fields, validations |
| `test/dummy/app/views/pages/managed_resources.html.erb` | Update docs |
| `test/helpers/managed_form_helper_test.rb` | **New** |
| `test/integration/managed_resource_crud_test.rb` | **New** |

## Reuse

- Existing shared partials: `_form_errors.html.erb`, `_label.html.erb`, `_field_error.html.erb`
- Existing CSS: `.l-ui-form`, `.l-ui-form__group`, `.l-ui-form__field`, `.l-ui-label`, `.l-ui-select-wrapper`, `.l-ui-button--primary`
- Existing `Layered::Ui::Routing.register/lookup` registry pattern
- Existing `l_ui_managed_before_action` authentication pattern

## Edge cases

- **Namespaced models** (e.g. `Admin::Post`): `model_name.param_key` returns `admin_post`. Verify `form_with(model: @record, url: ...)` generates correct param nesting and that `params.require(:admin_post)` works.
- **Virtual attributes**: fields referencing `attr_accessor` or delegated attributes won't be in `columns_hash`. Type auto-detection falls back to `:string`.
- **Select with Proc collection**: the proc is called at render time via `.call` (not `instance_exec`), so it must be self-contained (e.g. `-> { User.pluck(:name, :id) }`).
- **Scoped routes**: under `scope "/admin"`, the scoped key becomes `admin_posts` and route helpers become `new_managed_admin_post_path`, etc. The routing phase must test this.

## Verification

1. `bundle exec rake test` - all existing tests pass, new tests pass
2. Boot dummy app, visit `/posts`, click "New", fill in form, submit - record created, redirected to index
3. Click "Edit" on a row, modify fields, submit - record updated
4. Submit invalid form (empty title) - re-rendered with error messages and 422
5. Click "Delete" on a row, confirm the browser dialog - record removed, redirected to index
6. Verify forms are accessible: labels linked to inputs, errors have `role="alert"`, required fields marked
7. Verify existing index search/sort/pagination still works after `l_ui_managed_scope` retrofit
