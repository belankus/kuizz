import { Metadata } from "next";
import React from "react";
import ProfileClient from "./ProfileClient";

export const metadata: Metadata = {
  title: "Profile | Kuizz",
  description: "Edit your Kuizz profile, password, and custom avatar",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
