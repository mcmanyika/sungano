export interface Volunteer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  province: string;
  interest: string;
  message: string;
  registeredAt: Date | null;
}

export interface VolunteerInput {
  fullName: string;
  email: string;
  phone: string;
  province: string;
  interest: string;
  message?: string;
}

export const VOLUNTEER_PROVINCES = [
  "Bulawayo",
  "Harare",
  "Manicaland",
  "Mashonaland Central",
  "Mashonaland East",
  "Mashonaland West",
  "Masvingo",
  "Matabeleland North",
  "Matabeleland South",
  "Midlands",
  "Diaspora",
] as const;

export const VOLUNTEER_INTERESTS = [
  "Civic Education",
  "Community Mobilisation",
  "Communications & Media",
  "Legal Support",
  "Youth Outreach",
  "Women & Gender",
  "Logistics & Events",
  "General Support",
] as const;

export function formatVolunteerDate(date: Date | null): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
