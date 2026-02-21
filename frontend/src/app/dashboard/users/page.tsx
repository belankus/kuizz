'use client';

import { useEffect, useState } from 'react';
import { apiFetch, User, logout, getAccessToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    async function loadUsers() {
        // Get current user first
        const meRes = await apiFetch('/auth/me');
        if (!meRes.ok) {
            router.push('/login');
            return;
        }
        const me = await meRes.json();
        setCurrentUser(me);

        if (me.role !== 'SUPERADMIN') {
            toast.error('Akses ditolak');
            router.push('/dashboard');
            return;
        }

        const res = await apiFetch('/users');
        if (res.ok) {
            const data = await res.json();
            setUsers(data);
        }
        setLoading(false);
    }

    async function handleDeleteUser(userId: string) {
        if (!confirm('Yakin ingin menghapus user ini?')) return;
        const res = await apiFetch(`/users/${userId}`, { method: 'DELETE' });
        if (res.ok) {
            toast.success('User dihapus');
            setUsers((prev) => prev.filter((u) => u.id !== userId));
        } else {
            toast.error('Gagal menghapus user');
        }
    }

    async function handleChangeRole(userId: string, newRole: 'USER' | 'SUPERADMIN') {
        const res = await apiFetch(`/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role: newRole }),
        });
        if (res.ok) {
            toast.success('Role berhasil diubah');
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
            );
        } else {
            toast.error('Gagal mengubah role');
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manajemen User</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {users.length} user terdaftar
                </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                            <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">User</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Role</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Provider</th>
                            <th className="text-left px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Bergabung</th>
                            <th className="text-right px-6 py-3 font-medium text-gray-500 dark:text-gray-400">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{user.name || '—'}</p>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'SUPERADMIN'
                                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}
                                    >
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400 capitalize">
                                    {(user as any).provider || 'email'}
                                </td>
                                <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                    {new Date((user as any).createdAt).toLocaleDateString('id-ID')}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {user.id !== currentUser?.id && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        handleChangeRole(
                                                            user.id,
                                                            user.role === 'SUPERADMIN' ? 'USER' : 'SUPERADMIN'
                                                        )
                                                    }
                                                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition"
                                                >
                                                    {user.role === 'SUPERADMIN' ? 'Jadikan USER' : 'Jadikan SUPERADMIN'}
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    className="text-xs px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"
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
