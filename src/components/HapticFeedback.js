export const triggerVibration = (pattern = [200, 100, 200]) => {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  } else {
    // Vibration API not supported, degrade gracefully.
    console.warn("Vibration API not supported on this device.");
  }
};
