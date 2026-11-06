export type CredStatus = "valid" | "expiring" | "expired" | "no-expiry";

export function credentialStatus(expiresAt: Date | null, now = new Date()): { status: CredStatus; days: number | null } {
  if (!expiresAt) return { status: "no-expiry", days: null };
  const days = Math.ceil((expiresAt.getTime() - now.getTime()) / 86_400_000);
  return { status: days < 0 ? "expired" : days <= 60 ? "expiring" : "valid", days };
}

export const STATUS_BADGE: Record<CredStatus, [string, string]> = {
  valid: ["badge-green", "Valid"],
  expiring: ["badge-amber", "Expiring soon"],
  expired: ["badge-red", "Expired"],
  "no-expiry": ["badge-gray", "No expiry"],
};

export const COMMON_CREDENTIALS = [
  "CSTS", "H2S Alive", "Standard First Aid & CPR", "WHMIS", "Ground Disturbance Level 2", "Fall Protection", "Confined Space Entry",
  "TDG", "CWB Welder Certificate", "CGSB NDT Level II (MT)", "CGSB NDT Level II (UT)", "CGSB NDT Level II (RT)", "CWB Level 2 Welding Inspector",
  "IRATA Level 2", "SPRAT Level 2", "API 510", "API 570", "Driver's Abstract / Class 5",
];
