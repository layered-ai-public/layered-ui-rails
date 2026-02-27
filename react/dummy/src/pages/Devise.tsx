import { PageHeader } from "../components/PageHeader"

export default function Devise() {
  return (
    <>
      <PageHeader
        title="Devise"
        description="Devise is fully supported but entirely optional. The engine works without any authentication system."
      />

      <h2 className="l-ui-utility--mt-2xl">When Devise is installed</h2>

      <p className="l-ui-utility--mt-md">The engine automatically detects Devise and provides:</p>

      <ul className="l-ui-list l-ui-utility--mt-lg">
        <li>Styled sign in, registration, and password reset, confirmation, and unlock views</li>
        <li>Header links that adapt to authentication state</li>
        <li>User info display in sidebar when signed in</li>
      </ul>

      <h2 className="l-ui-utility--mt-2xl">Installation</h2>

      <p className="l-ui-utility--mt-md">Add Devise to your application:</p>
      <code className="l-ui-surface l-ui-utility--mt-md">bundle add devise</code>

      <p className="l-ui-utility--mt-lg">Run the Devise installer and generate a User model:</p>
      <code className="l-ui-surface l-ui-utility--mt-md">bin/rails generate devise:install</code>
      <code className="l-ui-surface l-ui-utility--mt-md">bin/rails generate devise User</code>
      <code className="l-ui-surface l-ui-utility--mt-md">bin/rails db:migrate</code>

      <p className="l-ui-utility--mt-lg">Add friendly routes to your <code>routes.rb</code>:</p>
      <code className="l-ui-surface l-ui-utility--mt-md">{`devise_for :users, path: "", path_names: { sign_in: "login", sign_up: "register", sign_out: "logout" }`}</code>

      <h2 className="l-ui-utility--mt-2xl">Configuration</h2>

      <p className="l-ui-utility--mt-md">The engine uses <code>current_user</code> by default. If your app uses a different method, configure it in an initializer:</p>
      <code className="l-ui-surface l-ui-utility--mt-md">Layered::Ui.current_user_method = :current_admin</code>

      <p className="l-ui-utility--mt-lg">The sidebar displays the signed-in user's email. If your user model has a <code>name</code> attribute, it will be displayed as well. To support this, add a name column to your users migration:</p>
      <code className="l-ui-surface l-ui-utility--mt-md">add_column :users, :name, :string</code>

      <p className="l-ui-utility--mt-lg">Then permit the name parameter in your <code>ApplicationController</code>:</p>
      <code className="l-ui-surface l-ui-utility--mt-md">{`before_action :configure_permitted_parameters, if: :devise_controller?

protected

def configure_permitted_parameters
  devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
end`}</code>

      <h2 className="l-ui-utility--mt-2xl">Helper methods</h2>

      <p className="l-ui-utility--mt-md">These helpers allow your views to work with or without Devise:</p>

      <div className="l-ui-container--table l-ui-utility--mt-lg">
        <table className="l-ui-table">
          <caption className="l-ui-sr-only">Devise helpers</caption>
          <thead className="l-ui-table__header">
            <tr>
              <th className="l-ui-table__header-cell" scope="col">Helper</th>
              <th className="l-ui-table__header-cell" scope="col">Description</th>
            </tr>
          </thead>
          <tbody className="l-ui-table__body">
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l_ui_devise_installed?</code></th>
              <td className="l-ui-table__cell">Returns true if Devise is available</td>
            </tr>
            <tr>
              <th className="l-ui-table__cell--primary" scope="row"><code>l_ui_user_signed_in?</code></th>
              <td className="l-ui-table__cell">Safe wrapper for <code>user_signed_in?</code> that returns false when Devise is not installed</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
