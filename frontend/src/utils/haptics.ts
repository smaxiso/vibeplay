export function triggerHaptic() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(50)
    } catch (e) {
      // Ignore errors on unsupported devices
    }
  }
}
