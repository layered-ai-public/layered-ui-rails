import { Controller } from "@hotwired/stimulus"

// When multiple scoped Ransack collections share one page, preserves other
// scopes' params across form submits (preserve), clear links (clear), and
// pagination clicks (rewriteLink).
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
