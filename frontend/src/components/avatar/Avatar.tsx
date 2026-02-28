"use client";

import { useEffect, useState } from "react";
import {
  AvatarDisplay,
  AvatarConfig,
  getConsistentAvatar,
} from "./AvatarBuilder";
import { getUserFromToken, apiFetch } from "@/lib/auth";

interface AvatarProps {
  /**
   * Optional manual config. If provided, overrides auto-loading.
   */
  config?: AvatarConfig | null;
  /**
   * Optional fallback seed to generate a consistent avatar if local storage is empty
   * and no config is provided.
   */
  fallbackSeed?: string;
  size?: number;
}

export default function Avatar({
  config,
  fallbackSeed,
  size = 80,
}: AvatarProps) {
  const [resolvedConfig, setResolvedConfig] = useState<AvatarConfig | null>(
    null,
  );

  useEffect(() => {
    // 1. If an explicit config is passed, always prioritize it.
    if (config) {
      setResolvedConfig(config);
      return;
    }

    const loadAvatar = async () => {
      // 2. Check if user is logged in
      const user = getUserFromToken();
      if (user) {
        try {
          const res = await apiFetch("/users/me");
          if (res.ok) {
            const data = await res.json();
            if (data?.avatar) {
              setResolvedConfig(data.avatar as AvatarConfig);
              return;
            }
          }
        } catch (error) {
          console.error("Failed to fetch user avatar", error);
        }
      }

      // 3. If not logged in or fetching failed, check local storage (Guest)
      try {
        const stored = localStorage.getItem("guestAvatar");
        if (stored) {
          setResolvedConfig(JSON.parse(stored));
          return;
        }
      } catch (e) {
        console.error("Failed to parse guestAvatar from localStorage", e);
      }

      // 4. Fallback to seed if provided
      if (fallbackSeed) {
        setResolvedConfig(getConsistentAvatar(fallbackSeed));
        return;
      }

      // 5. Default blank fallback
      setResolvedConfig(getConsistentAvatar("kuizz-default"));
    };

    loadAvatar();
  }, [config, fallbackSeed]);

  // Prevent SSR Hydration mismatches by rendering empty or skeleton until mounted
  if (!resolvedConfig) {
    return (
      <div
        style={{ width: size, height: size }}
        className="animate-pulse rounded-full bg-gray-200 dark:bg-gray-800"
      />
    );
  }

  return <AvatarDisplay config={resolvedConfig} size={size} />;
}
