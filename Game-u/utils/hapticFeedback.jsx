import * as Haptics from '../utils/mock-haptics';

// Light impact feedback
export const lightImpact = () => {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
  } catch (error) {
    console.error("Error with haptic feedback:", error)
  }
}

// Medium impact feedback
export const mediumImpact = () => {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
  } catch (error) {
    console.error("Error with haptic feedback:", error)
  }
}

// Heavy impact feedback
export const heavyImpact = () => {
  try {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
  } catch (error) {
    console.error("Error with haptic feedback:", error)
  }
}

// Success notification feedback
export const successNotification = () => {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
  } catch (error) {
    console.error("Error with haptic feedback:", error)
  }
}

// Warning notification feedback
export const warningNotification = () => {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)
  } catch (error) {
    console.error("Error with haptic feedback:", error)
  }
}

// Error notification feedback
export const errorNotification = () => {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
  } catch (error) {
    console.error("Error with haptic feedback:", error)
  }
}

// Selection feedback
export const selectionFeedback = () => {
  try {
    Haptics.selectionAsync()
  } catch (error) {
    console.error("Error with haptic feedback:", error)
  }
}

