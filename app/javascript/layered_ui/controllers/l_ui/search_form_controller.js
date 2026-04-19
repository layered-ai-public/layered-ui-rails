import { Controller } from "@hotwired/stimulus"

// Preserves query params from other search scopes when a scoped form submits
// or its clear link is clicked.
//
// When multiple Ransack collections share one page, each form only knows about
// its own fields. This controller reads the current URL at submit time and
// injects hidden inputs for params that belong to other scopes, so the
// resulting URL reflects the full state of all collections. The clear action
// rewrites the clear link's href to include the same preserved params.
export default class extends Controller {
  static values = { scope: String }

  preserve(event) {
    this.element.querySelectorAll("[data-l-ui-preserved]").forEach(el => el.remove())

    for (const [key, value] of this.#otherParams()) {
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = key
      input.value = value
      input.setAttribute("data-l-ui-preserved", "")
      this.element.appendChild(input)
    }
  }

  clear(event) {
    const link = event.currentTarget
    const preserved = this.#otherParams()
    const base = link.href.split("?")[0]
    const qs = preserved.toString()
    link.href = qs ? `${base}?${qs}` : base
  }

  #otherParams() {
    const currentParams = new URLSearchParams(window.location.search)
    const scope = this.scopeValue
    const result = new URLSearchParams()

    for (const [key, value] of currentParams) {
      if (key === scope || key.startsWith(scope + "[") || key === "commit" || key === "page" || key.endsWith("_page")) continue
      result.append(key, value)
    }

    return result
  }
}
