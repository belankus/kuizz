'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { setAccessToken } from '@/lib/auth';

function CallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            setAccessToken(token);
            router.replace('/dashboard');
        } else {
            router.replace('/login?error=oauth_failed');
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Memproses login...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense>
            <CallbackContent />
        </Suspense>
    );
}
