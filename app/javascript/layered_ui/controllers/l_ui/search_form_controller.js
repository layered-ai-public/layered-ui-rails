import { Controller } from "@hotwired/stimulus"

// Preserves query params from other search scopes when a scoped form submits.
//
// When multiple Ransack collections share one page, each form only knows about
// its own fields. This controller reads the current URL at submit time and
// injects hidden inputs for params that belong to other scopes, so the
// resulting URL reflects the full state of all collections.
export default class extends Controller {
  static values = { scope: String }

  preserve(event) {
    this.element.querySelectorAll("[data-l-ui-preserved]").forEach(el => el.remove())

    const currentParams = new URLSearchParams(window.location.search)
    const scope = this.scopeValue

    for (const [key, value] of currentParams) {
      if (key.startsWith(scope) || key === "commit") continue

      const input = document.createElement("input")
      input.type = "hidden"
      input.name = key
      input.value = value
      input.setAttribute("data-l-ui-preserved", "")
      this.element.appendChild(input)
    }
  }
}
