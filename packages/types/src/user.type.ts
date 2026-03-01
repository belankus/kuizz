export interface UserModelType {
  id: string;
  email: string;
  name: string | null;
  role: "USER" | "SUPERADMIN";
  provider: string | null;
  createdAt: Date;
}
