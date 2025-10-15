// Generate a unique device ID based on browser fingerprint
export function generateDeviceId(): string {
  if (typeof window === "undefined") return "";

  // Create a simple device fingerprint
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  ctx?.fillText("device-fingerprint", 2, 2);
  const canvasFingerprint = canvas.toDataURL();

  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    new Date().getTimezoneOffset(),
    canvasFingerprint.slice(-50), // Last 50 chars of canvas fingerprint
  ].join("|");

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(36);
}
