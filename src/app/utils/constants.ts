export const ParcelStatuses = [
  "pending",
  "in-transit",
  "delivered",
  "cancelled",
] as const;
export type IParcelStatus = (typeof ParcelStatuses)[number];
