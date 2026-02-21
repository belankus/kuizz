import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Kuizz — Platform Quiz Interaktif',
    description: 'Buat dan main kuis interaktif bersama tim. Platform quiz real-time yang seru untuk semua.',
};

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
            {/* ─── Navbar ─────────────────────────────────────────────────────────── */}
            <nav className="sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <span className="text-2xl font-bold text-brand-500 tracking-tight">Kuizz</span>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-500 transition-colors px-4 py-2"
                        >
                            Masuk
                        </Link>
                        <Link
                            href="/register"
                            className="text-sm font-semibold bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-lg transition-colors"
                        >
                            Mulai Gratis
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ─── Hero ────────────────────────────────────────────────────────────── */}
            <main className="flex-1">
                <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center">
                    {/* Badge */}
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-medium mb-8">
                        <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                        Platform Quiz Real-time
                    </span>

                    <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                        Buat Kuis yang{' '}
                        <span className="text-brand-500">Seru</span>
                        <br />& Interaktif
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        Kuizz memudahkan kamu membuat, mengelola, dan memainkan kuis bersama siapa saja &mdash;
                        secara real-time dan menyenangkan.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/register"
                            className="w-full sm:w-auto px-8 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl text-base transition-all shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5"
                        >
                            Mulai Sekarang — Gratis
                        </Link>
                        <Link
                            href="/dashboard"
                            className="w-full sm:w-auto px-8 py-3.5 border border-gray-200 dark:border-gray-700 hover:border-brand-300 dark:hover:border-brand-700 text-gray-700 dark:text-gray-300 font-semibold rounded-xl text-base transition-all hover:-translate-y-0.5"
                        >
                            Lihat Dashboard →
                        </Link>
                    </div>
                </section>

                {/* ─── Features ─────────────────────────────────────────────────────── */}
                <section className="max-w-6xl mx-auto px-6 py-16">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            {
                                icon: '⚡',
                                title: 'Real-time & Cepat',
                                desc: 'Jawaban tersinkronisasi langsung ke semua pemain tanpa delay. Pengalaman bermain yang smooth.',
                            },
                            {
                                icon: '🎨',
                                title: 'Mudah Dibuat',
                                desc: 'Buat kuis dengan berbagai tipe soal — pilihan ganda, benar/salah — dalam hitungan menit.',
                            },
                            {
                                icon: '📊',
                                title: 'Statistik Detail',
                                desc: 'Pantau performa tiap peserta, skor, dan jawaban mereka dengan laporan yang lengkap.',
                            },
                        ].map((f) => (
                            <div
                                key={f.title}
                                className="p-8 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:border-brand-200 dark:hover:border-brand-800 transition-colors group"
                            >
                                <div className="text-4xl mb-4">{f.icon}</div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-500 transition-colors">
                                    {f.title}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ─── CTA ───────────────────────────────────────────────────────────── */}
                <section className="max-w-6xl mx-auto px-6 py-16">
                    <div className="rounded-3xl bg-brand-500 px-10 py-16 text-center relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10" />
                        <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/10" />

                        <h2 className="relative text-3xl sm:text-4xl font-bold text-white mb-4">
                            Siap mulai bermain?
                        </h2>
                        <p className="relative text-brand-100 mb-8 text-lg max-w-lg mx-auto">
                            Bergabung sekarang dan buat kuis pertama kamu dalam waktu kurang dari 5 menit.
                        </p>
                        <Link
                            href="/register"
                            className="relative inline-flex items-center px-8 py-3.5 bg-white hover:bg-gray-50 text-brand-600 font-bold rounded-xl text-base transition-all shadow-lg hover:-translate-y-0.5"
                        >
                            Daftar Sekarang
                        </Link>
                    </div>
                </section>
            </main>

            {/* ─── Footer ──────────────────────────────────────────────────────────── */}
            <footer className="border-t border-gray-100 dark:border-gray-800 py-8">
                <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <span className="text-brand-500 font-bold text-xl">Kuizz</span>
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} Kuizz. Dibuat dengan ❤️
                    </p>
                    <div className="flex gap-6 text-sm text-gray-500 dark:text-gray-400">
                        <Link href="/login" className="hover:text-brand-500 transition-colors">Masuk</Link>
                        <Link href="/register" className="hover:text-brand-500 transition-colors">Daftar</Link>
                        <Link href="/dashboard" className="hover:text-brand-500 transition-colors">Dashboard</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
