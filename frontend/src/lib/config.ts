const WHATSAPP_STORAGE_KEY = "kid-store-whatsapp-number";

export const DEFAULT_WHATSAPP_NUMBER = "9647501234567";

export function getWhatsAppNumber(): string {
  try {
    return localStorage.getItem(WHATSAPP_STORAGE_KEY) || DEFAULT_WHATSAPP_NUMBER;
  } catch {
    return DEFAULT_WHATSAPP_NUMBER;
  }
}

export function setWhatsAppNumber(number: string): void {
  localStorage.setItem(WHATSAPP_STORAGE_KEY, number);
}

export function isWhatsAppEnabled(): boolean {
  return import.meta.env.VITE_WHATSAPP_ENABLED === "true";
}

