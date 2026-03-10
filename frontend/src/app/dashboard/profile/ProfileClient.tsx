"use client";

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { apiFetch } from "@/lib/auth";
import { toast } from "sonner";
import { handleError } from "@/lib/handle-error";
import { handleApiError } from "@/lib/api-error-handler";
import AvatarBuilder, {
  AvatarDisplay,
} from "@/components/avatar/AvatarBuilder";
import { Loader2, User2, KeyRound, Palette, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AvatarModel } from "@/types";
import DetailSkeleton from "@/components/dashboard/skeletons/DetailSkeleton";

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar: AvatarModel | null;
  createdAt: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit profile state
  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Avatar state
  const [avatarConfig, setAvatarConfig] = useState<AvatarModel | null>(null);
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiFetch("/users/me");
      await handleApiError(res);
      const data: UserProfile = await res.json();
      setProfile(data);
      setName(data.name ?? "");
      setAvatarConfig(data.avatar ?? null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await apiFetch("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
      });
      await handleApiError(res);
      toast.success("Profile updated!");
      setProfile((p) => (p ? { ...p, name } : p));
    } catch (err) {
      handleError(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await apiFetch("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({ oldPassword, newPassword }),
        headers: { "Content-Type": "application/json" },
      });
      await handleApiError(res);
      toast.success("Password changed!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      handleError(err);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveAvatar = async () => {
    if (!avatarConfig) return;
    setSavingAvatar(true);
    try {
      const res = await apiFetch("/users/me/avatar", {
        method: "PATCH",
        body: JSON.stringify({ avatar: avatarConfig }),
        headers: { "Content-Type": "application/json" },
      });
      await handleApiError(res);
      toast.success("Avatar saved!");
    } catch (err) {
      handleError(err);
    } finally {
      setSavingAvatar(false);
    }
  };

  if (loading) {
    return <DetailSkeleton />;
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="My Profile" />

      {/* Profile Info Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
            <User2 size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Profile Information
            </h3>
            <p className="text-sm text-gray-500">Update your display name</p>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          {avatarConfig && <AvatarDisplay config={avatarConfig} size={64} />}
          <div>
            <p className="text-xl font-bold text-gray-800 dark:text-white/90">
              {profile?.name ?? "No name set"}
            </p>
            <p className="text-sm text-gray-500">{profile?.email}</p>
            <Badge
              className={
                profile?.role === "SUPERADMIN"
                  ? "mt-1 bg-purple-50 text-purple-700"
                  : "mt-1 bg-indigo-50 text-indigo-700"
              }
            >
              {profile?.role}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Display Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              value={profile?.email}
              disabled
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            />
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={savingProfile}
          className="mt-4 flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {savingProfile ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save Profile
        </button>
      </div>

      {/* Change Password Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-900/40 dark:text-orange-300">
            <KeyRound size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              Change Password
            </h3>
            <p className="text-sm text-gray-500">
              Leave blank to keep current password
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Current Password",
              val: oldPassword,
              set: setOldPassword,
            },
            { label: "New Password", val: newPassword, set: setNewPassword },
            {
              label: "Confirm New Password",
              val: confirmPassword,
              set: setConfirmPassword,
            },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
              </label>
              <input
                type="password"
                value={val}
                onChange={(e) => set(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                placeholder="••••••••"
              />
            </div>
          ))}
        </div>

        <button
          onClick={handleSavePassword}
          disabled={savingPassword || !oldPassword || !newPassword}
          className="mt-4 flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
        >
          {savingPassword ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <KeyRound size={16} />
          )}
          Change Password
        </button>
      </div>

      {/* Avatar Builder Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/3">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-50 text-pink-600 dark:bg-pink-900/40 dark:text-pink-300">
            <Palette size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
              My Avatar
            </h3>
            <p className="text-sm text-gray-500">
              Customize your avatar — shown when you join a game
            </p>
          </div>
        </div>

        <AvatarBuilder initial={avatarConfig} onChange={setAvatarConfig} />

        <button
          onClick={handleSaveAvatar}
          disabled={savingAvatar || !avatarConfig}
          className="mt-6 flex items-center gap-2 rounded-lg bg-pink-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:opacity-50"
        >
          {savingAvatar ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save size={16} />
          )}
          Save Avatar
        </button>
      </div>
    </div>
  );
}
