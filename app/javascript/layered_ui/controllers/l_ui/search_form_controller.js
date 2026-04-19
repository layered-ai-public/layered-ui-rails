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

  rewriteLink(event) {
    const link = event.target.closest(".l-ui-container--pagy a[href]")
    if (!link) return

    const url = new URL(link.href, window.location.origin)
    const linkKeys = new Set(url.searchParams.keys())
    const current = new URLSearchParams(window.location.search)

    for (const [key, value] of current) {
      if (!linkKeys.has(key)) url.searchParams.append(key, value)
    }

    link.href = url.pathname + url.search
  }

  #otherParams() {
    const currentParams = new URLSearchParams(window.location.search)
    const scope = this.scopeValue
    const result = new URLSearchParams()

    for (const [key, value] of currentParams) {
      if (key === scope || key.startsWith(scope + "[") || key === "commit" || key === "page" || key === this.#pageParam) continue
      result.append(key, value)
    }

    return result
  }

  get #pageParam() {
    const scope = this.scopeValue
    return scope.endsWith("_q") ? scope.slice(0, -2) + "_page" : null
  }
}
