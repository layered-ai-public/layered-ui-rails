import { PageHeader } from "../components/PageHeader"
import { CodeModal } from "../components/CodeModal"

export default function Forms() {
  return (
    <>
      <PageHeader
        title="Forms"
        description="Form styles with accessible labels, inputs, and validation states."
      />

      <h2 className="l-ui-utility--mt-2xl">Example form</h2>

      <form className="l-ui-form l-ui-utility--mt-lg" action="#" method="post">
        <div className="l-ui-form__group">
          <label className="l-ui-label" htmlFor="name">
            Full name
            <span className="l-ui-form__required" aria-hidden="true"> *</span>
            <span className="l-ui-sr-only">(required)</span>
          </label>
          <input type="text" id="name" name="name" className="l-ui-form__field" placeholder="Enter your full name" required autoComplete="name" />
        </div>

        <div className="l-ui-form__group">
          <label className="l-ui-label" htmlFor="email">
            Email address
            <span className="l-ui-form__required" aria-hidden="true"> *</span>
            <span className="l-ui-sr-only">(required)</span>
          </label>
          <input type="email" id="email" name="email" className="l-ui-form__field" placeholder="you@example.com" required autoComplete="email" />
          <div className="l-ui-form__hint">
            We'll never share your email with anyone else.
          </div>
        </div>

        <div className="l-ui-form__group">
          <label className="l-ui-label" htmlFor="role">
            Role
            <span className="l-ui-form__required" aria-hidden="true"> *</span>
            <span className="l-ui-sr-only">(required)</span>
          </label>
          <div className="l-ui-select-wrapper">
            <select id="role" name="role" className="l-ui-select" required>
              <option value="">Select a role</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
        </div>

        <div className="l-ui-form__group">
          <label className="l-ui-label" htmlFor="bio">Bio</label>
          <textarea id="bio" name="bio" className="l-ui-form__field" rows={4} placeholder="Tell us a little about yourself" />
          <div className="l-ui-form__hint">
            Optional: A brief description of yourself.
          </div>
        </div>

        <div className="l-ui-form__group--large-gap">
          <button type="submit" className="l-ui-button--primary l-ui-button--full">
            Submit
          </button>
        </div>
      </form>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-forms-form" heading="Form">
          <code className="l-ui-surface">{`<form class="l-ui-form">
  <div class="l-ui-form__group">
    <label class="l-ui-label" for="name">
      Full name
      <span class="l-ui-form__required">*</span>
    </label>
    <input type="text" class="l-ui-form__field">
  </div>

  <div class="l-ui-form__group">
    <label class="l-ui-label" for="role">Role</label>
    <div class="l-ui-select-wrapper">
      <select class="l-ui-select">
        <option value="">Select a role</option>
      </select>
    </div>
  </div>

  <button type="submit" class="l-ui-button--primary">
    Submit
  </button>
</form>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Checkbox inputs</h2>

      <div className="l-ui-form__group l-ui-utility--mt-lg">
        <label className="l-ui-label">Preferences</label>
        <div className="l-ui-container--checkbox l-ui-utility--mt-lg">
          <input type="checkbox" id="newsletter" name="newsletter" defaultChecked />
          <label className="l-ui-label--checkbox" htmlFor="newsletter">Subscribe to newsletter</label>
        </div>
        <div className="l-ui-container--checkbox l-ui-utility--mt-lg">
          <input type="checkbox" id="updates" name="updates" />
          <label className="l-ui-label--checkbox" htmlFor="updates">Receive product updates</label>
        </div>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-forms-checkboxes" heading="Checkboxes">
          <code className="l-ui-surface">{`<div class="l-ui-container--checkbox">
  <input type="checkbox" id="opt" value="1">
  <label class="l-ui-label--checkbox" for="opt">Option</label>
</div>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Switch inputs</h2>

      <div className="l-ui-form__group">
        <label className="l-ui-switch">
          <input type="checkbox" className="l-ui-switch__input" role="switch" defaultChecked />
          <span className="l-ui-switch__track"></span>
          Enable notifications
        </label>
      </div>

      <div className="l-ui-form__group">
        <label className="l-ui-switch">
          <input type="checkbox" className="l-ui-switch__input" role="switch" defaultChecked disabled />
          <span className="l-ui-switch__track"></span>
          Disabled (checked)
        </label>
      </div>

      <div className="l-ui-form__group l-ui-utility--mt-lg">
        <label className="l-ui-switch">
          <input type="checkbox" className="l-ui-switch__input" role="switch" />
          <span className="l-ui-switch__track"></span>
          Enable marketing emails
        </label>
      </div>

      <div className="l-ui-form__group">
        <label className="l-ui-switch">
          <input type="checkbox" className="l-ui-switch__input" role="switch" disabled />
          <span className="l-ui-switch__track"></span>
          Disabled (unchecked)
        </label>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-forms-switch" heading="Switch inputs">
          <code className="l-ui-surface">{`<label class="l-ui-switch">
  <input type="checkbox" class="l-ui-switch__input" role="switch">
  <span class="l-ui-switch__track"></span>
  Enable notifications
</label>`}</code>
        </CodeModal>
      </div>

      <h2 className="l-ui-utility--mt-2xl">Radio inputs</h2>

      <div className="l-ui-form__group l-ui-utility--mt-lg">
        <label className="l-ui-label">Notification frequency</label>
        <div className="l-ui-radio__group">
          <div className="l-ui-radio__item l-ui-utility--mt-md">
            <input type="radio" id="notify-daily" name="notify" value="daily" className="l-ui-radio__input" />
            <label className="l-ui-radio__label" htmlFor="notify-daily">Daily</label>
          </div>
          <div className="l-ui-radio__item l-ui-utility--mt-lg">
            <input type="radio" id="notify-weekly" name="notify" value="weekly" className="l-ui-radio__input" />
            <label className="l-ui-radio__label" htmlFor="notify-weekly">Weekly</label>
          </div>
          <div className="l-ui-radio__item l-ui-utility--mt-lg">
            <input type="radio" id="notify-never" name="notify" value="never" className="l-ui-radio__input" />
            <label className="l-ui-radio__label" htmlFor="notify-never">Never</label>
          </div>
        </div>
      </div>

      <div className="l-ui-utility--mt-xl">
        <CodeModal id="modal-forms-radio" heading="Radio inputs">
          <code className="l-ui-surface">{`<div class="l-ui-radio__group">
  <div class="l-ui-radio__item">
    <input type="radio" class="l-ui-radio__input">
    <label class="l-ui-radio__label">Option</label>
  </div>
</div>`}</code>
        </CodeModal>
      </div>
    </>
  )
}
