export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  SENDER = "SENDER",
  RECEIVER = "RECEIVER",
}

export interface IauthProvider {
  provider: "google" | "credentials";
  providerId: string;
  email?: string;
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
}

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: Role;
  authProvider?: IauthProvider[];
  status?: IsActive;
  address?: {
    street?: string;
    city?: string;
    district?: string;
    postalCode?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}
