export const DEFAULT_WHATSAPP_NUMBER = "9647501234567";

export function isWhatsAppEnabled(): boolean {
  return import.meta.env.VITE_WHATSAPP_ENABLED === "true";
}
