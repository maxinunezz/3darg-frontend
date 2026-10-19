import type { Metadata } from "next";
import { AccountSettingsContent } from "@/components/account-settings-content";

export const metadata: Metadata = {
  title: "Mis datos | 3DARG",
};

export default function AccountPage() {
  return <AccountSettingsContent profileHref="/profile" loginHref="/login" />;
}
