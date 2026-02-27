import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

export default function FormErrors() {
  return (
    <>
      <PageHeader
        title="Form errors"
        description="Error display patterns for form validation with accessible markup."
      />

      <h2 className="l-ui-utility--mt-2xl">Form-level errors</h2>

      <p className="l-ui-utility--mt-md">Display validation errors at the top of a form.</p>

      <div className="l-ui-form__errors l-ui-utility--mt-lg">
        <h3>2 errors were found:</h3>
        <ul className="l-ui-form__errors-list l-ui-utility--mt-lg">
          <li>Name can't be blank</li>
          <li>Email is invalid</li>
        </ul>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-form-errors" heading="Form errors">
          <code className="l-ui-surface">{`<div class="l-ui-form__errors">
  <h3>2 errors were found:</h3>
  <ul class="l-ui-form__errors-list l-ui-utility--mt-lg">
    <li>Name can't be blank</li>
    <li>Email is invalid</li>
  </ul>
</div>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Field-level errors</h2>

      <form className="l-ui-form l-ui-utility--mt-lg" action="#" method="post" onSubmit={(e) => e.preventDefault()}>
        <div className="l-ui-form__group">
          <label className="l-ui-label" htmlFor="error-email">
            Email address
            <span className="l-ui-form__required" aria-hidden="true">*</span>
            <span className="l-ui-sr-only">(required)</span>
          </label>
          <div className="field_with_errors">
            <input type="email" id="error-email" name="email" className="l-ui-form__field" defaultValue="invalid@email" required />
          </div>
          <span className="l-ui-form__field-error">This email is already registered</span>
        </div>

        <div className="l-ui-form__group">
          <label className="l-ui-label" htmlFor="error-password">
            Password
            <span className="l-ui-form__required" aria-hidden="true">*</span>
            <span className="l-ui-sr-only">(required)</span>
          </label>
          <div className="field_with_errors">
            <input type="password" id="error-password" name="password" className="l-ui-form__field" required />
          </div>
          <span className="l-ui-form__field-error">Password must be at least 8 characters</span>
        </div>

        <div className="l-ui-form__group--large-gap">
          <button type="submit" className="l-ui-button--primary l-ui-button--full">
            Submit
          </button>
        </div>
      </form>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-field-errors" heading="Field errors">
          <code className="l-ui-surface">{`<div class="l-ui-form__group">
  <label class="l-ui-label" for="email">Email</label>
  <div class="field_with_errors">
    <input type="email" class="l-ui-form__field">
  </div>
  <span class="l-ui-form__field-error">Error message</span>
</div>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Rails integration</h2>

      <p className="l-ui-utility--mt-md">The engine includes partials for rendering errors with Rails form builders:</p>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-rails-partials" heading="Rails partials">
          <code className="l-ui-surface">{`<!-- Form-level errors -->
<%= render "layered_ui/shared/form_errors", resource: @user %>

<!-- Field-level error -->
<%= render "layered_ui/shared/field_error",
    resource: @user, attribute: :email %>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">CSS classes</h2>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Form error CSS classes</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Class</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-form__errors</code></th>
              <td className="l-ui-table__cell">Container for form-level errors</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-form__errors-list</code></th>
              <td className="l-ui-table__cell">List of error messages</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>field_with_errors</code></th>
              <td className="l-ui-table__cell">Rails default wrapper (styled by engine)</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l-ui-form__field-error</code></th>
              <td className="l-ui-table__cell">Inline field error message</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
