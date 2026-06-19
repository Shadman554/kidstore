export const DEFAULT_WHATSAPP_NUMBER = "9647501234567";

export function isWhatsAppEnabled(): boolean {
  const val = import.meta.env.VITE_WHATSAPP_ENABLED;
  // Enabled by default unless explicitly set to "false"
  return val !== "false";
}
