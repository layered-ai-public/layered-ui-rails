export function announce(message, controller) {
  const liveRegion = document.getElementById("l-ui-live-region")
  if (liveRegion) {
    liveRegion.textContent = message
    clearTimeout(controller._announceTimeout)
    controller._announceTimeout = setTimeout(() => {
      liveRegion.textContent = ""
    }, 3000)
  }
}

export function clearAnnounceTimeout(controller) {
  clearTimeout(controller._announceTimeout)
}
