// Configuration options
const config = {
  debugMode: true, // Enable/disable debug logging
  visualFeedback: true, // Show visual feedback in development
  logTimestamps: true, // Include timestamps in logs
  simulateDelay: true, // Simulate realistic haptic delays
  trackUsage: true, // Track haptic usage for analytics
}

// Usage tracking
const usageStats = {
  impact: { light: 0, medium: 0, heavy: 0 },
  notification: { success: 0, warning: 0, error: 0 },
  selection: 0,
  lastUsed: null,
}

// Helper functions
const getTimestamp = () => {
  if (!config.logTimestamps) return ""
  return `[${new Date().toISOString().split("T")[1].slice(0, -1)}]`
}

const simulateHapticDelay = () => {
  if (!config.simulateDelay) return Promise.resolve()
  const delay = Math.random() * 10 + 5 // 5-15ms delay to simulate hardware response
  return new Promise((resolve) => setTimeout(resolve, delay))
}

const showVisualFeedback = (type, intensity) => {
  if (!config.visualFeedback || typeof document === "undefined") return

  // Only run in browser environment
  try {
    const feedbackEl = document.getElementById("haptic-feedback") || createFeedbackElement()

    // Set color based on type
    let color
    switch (type) {
      case "impact":
        color = intensity === "light" ? "#4CAF50" : intensity === "medium" ? "#FFC107" : "#F44336"
        break
      case "notification":
        color = intensity === "success" ? "#4CAF50" : intensity === "warning" ? "#FFC107" : "#F44336"
        break
      case "selection":
        color = "#2196F3"
        break
      default:
        color = "#9C27B0"
    }

    // Flash the feedback element
    feedbackEl.style.backgroundColor = color
    feedbackEl.style.opacity = "0.7"

    setTimeout(() => {
      feedbackEl.style.opacity = "0"
    }, 150)
  } catch (e) {
    // Silently fail if we're not in a browser environment
  }
}

const createFeedbackElement = () => {
  if (typeof document === "undefined") return null

  const el = document.createElement("div")
  el.id = "haptic-feedback"
  el.style.position = "fixed"
  el.style.bottom = "20px"
  el.style.right = "20px"
  el.style.width = "20px"
  el.style.height = "20px"
  el.style.borderRadius = "50%"
  el.style.backgroundColor = "#000"
  el.style.opacity = "0"
  el.style.transition = "opacity 150ms ease-out"
  el.style.zIndex = "9999"
  document.body.appendChild(el)
  return el
}

const trackHapticUsage = (type, intensity) => {
  if (!config.trackUsage) return

  usageStats.lastUsed = new Date()

  if (type === "impact") {
    usageStats.impact[intensity]++
  } else if (type === "notification") {
    usageStats.notification[intensity]++
  } else if (type === "selection") {
    usageStats.selection++
  }
}

// Main haptic functions
export const impactAsync = async (style) => {
  const intensity = style || ImpactFeedbackStyle.Medium

  if (config.debugMode) {
    console.log(`${getTimestamp()} Haptic impact triggered with style: ${intensity}`)
  }

  trackHapticUsage("impact", intensity)
  showVisualFeedback("impact", intensity)

  return simulateHapticDelay()
}

export const notificationAsync = async (type) => {
  const notificationType = type || NotificationFeedbackType.Success

  if (config.debugMode) {
    console.log(`${getTimestamp()} Haptic notification triggered with type: ${notificationType}`)
  }

  trackHapticUsage("notification", notificationType)
  showVisualFeedback("notification", notificationType)

  return simulateHapticDelay()
}

export const selectionAsync = async () => {
  if (config.debugMode) {
    console.log(`${getTimestamp()} Haptic selection triggered`)
  }

  trackHapticUsage("selection")
  showVisualFeedback("selection")

  return simulateHapticDelay()
}

// Additional haptic patterns (for future compatibility)
export const vibrateAsync = async (pattern = []) => {
  if (config.debugMode) {
    console.log(`${getTimestamp()} Haptic vibration triggered with pattern: ${JSON.stringify(pattern)}`)
  }

  showVisualFeedback("vibrate")

  return simulateHapticDelay()
}

// Get usage statistics for debugging
export const getHapticUsageStats = () => {
  return { ...usageStats }
}

// Reset usage statistics
export const resetHapticUsageStats = () => {
  usageStats.impact = { light: 0, medium: 0, heavy: 0 }
  usageStats.notification = { success: 0, warning: 0, error: 0 }
  usageStats.selection = 0
  usageStats.lastUsed = null

  if (config.debugMode) {
    console.log(`${getTimestamp()} Haptic usage statistics reset`)
  }

  return true
}

// Configure mock haptics
export const configureMockHaptics = (options = {}) => {
  Object.assign(config, options)

  if (config.debugMode) {
    console.log(`${getTimestamp()} Mock haptics configured:`, config)
  }

  return config
}

// Constants
export const ImpactFeedbackStyle = {
  Light: "light",
  Medium: "medium",
  Heavy: "heavy",
  Soft: "soft", // Additional style for future compatibility
  Rigid: "rigid", // Additional style for future compatibility
}

export const NotificationFeedbackType = {
  Success: "success",
  Warning: "warning",
  Error: "error",
  Info: "info", // Additional type for future compatibility
}