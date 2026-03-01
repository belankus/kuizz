"use client";

import { useEffect } from "react";
import { apiFetch } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserModelType } from "@repo/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function UsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Current User Query
  const { data: currentUser, isLoading: loadingMe } = useQuery<UserModelType>({
    queryKey: ["auth-me"],
    queryFn: async () => {
      const res = await apiFetch("/auth/me");
      if (!res.ok) {
        router.push("/login");
        throw new Error("Unauthorized");
      }
      return res.json();
    },
  });

  // Users List Query
  const { data: users = [], isLoading: loadingUsers } = useQuery<
    UserModelType[]
  >({
    queryKey: ["users-list"],
    queryFn: async () => {
      const res = await apiFetch("/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
    enabled: currentUser?.role === "SUPERADMIN",
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiFetch(`/users/${userId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus user");
      return res.json();
    },
    onSuccess: () => {
      toast.success("User dihapus");
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const roleMutation = useMutation({
    mutationFn: async ({
      userId,
      newRole,
    }: {
      userId: string;
      newRole: "USER" | "SUPERADMIN";
    }) => {
      const res = await apiFetch(`/users/${userId}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) throw new Error("Gagal mengubah role");
      return res.json();
    },
    onSuccess: () => {
      toast.success("Role berhasil diubah");
      queryClient.invalidateQueries({ queryKey: ["users-list"] });
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  useEffect(() => {
    if (currentUser && currentUser.role !== "SUPERADMIN") {
      toast.error("Akses ditolak");
      router.push("/dashboard");
    }
  }, [currentUser, router]);

  const handleDeleteUser = (userId: string) => {
    if (!confirm("Yakin ingin menghapus user ini?")) return;
    deleteMutation.mutate(userId);
  };

  const handleChangeRole = (userId: string, newRole: "USER" | "SUPERADMIN") => {
    roleMutation.mutate({ userId, newRole });
  };

  if (loadingMe || (currentUser?.role === "SUPERADMIN" && loadingUsers)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="border-brand-500 h-8 w-8 animate-spin rounded-full border-b-2" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "SUPERADMIN") return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Manajemen User
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {users.length} user terdaftar
        </p>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-gray-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                User
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                Role
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                Provider
              </th>
              <th className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                Bergabung
              </th>
              <th className="px-6 py-3 text-right font-medium text-gray-500 dark:text-gray-400">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.name || "—"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "SUPERADMIN"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 capitalize dark:text-gray-400">
                  {user.provider || "email"}
                </td>
                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {user.id !== currentUser?.id && (
                      <>
                        <button
                          onClick={() =>
                            handleChangeRole(
                              user.id,
                              user.role === "SUPERADMIN"
                                ? "USER"
                                : "SUPERADMIN",
                            )
                          }
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          {user.role === "SUPERADMIN"
                            ? "Jadikan USER"
                            : "Jadikan SUPERADMIN"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="rounded-lg bg-red-500 px-3 py-1.5 text-xs text-white transition hover:bg-red-600"
                        >
                          Hapus
                        </button>
                      </>
                    )}
                    {user.id === currentUser?.id && (
                      <span className="text-xs text-gray-400 italic">Anda</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
