import Link from "next/link";
import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Kuizz - The Multiplayer Quiz Platform",
  description:
    "Host live quizzes, compete with friends, and master any subject in real-time.",
};

export default function LandingPage() {
  return (
    <div
      className={`${nunito.className} flex min-h-screen flex-col bg-(--surface) text-(--text-dark)`}
      style={
        {
          "--primary": "#46178F",
          "--secondary": "#1368CE",
          "--accent": "#FFC000",
          "--accent-hover": "#e0a800",
          "--surface": "#F2F2F2",
          "--text-dark": "#333333",
          "--card-bg": "#FFFFFF",
        } as React.CSSProperties
      }
    >
      <style>{`
                .logo-font, h1, h2, h3 {
                    font-family: ${fredoka.style.fontFamily}, sans-serif;
                }
                .hero-pattern {
                    background-color: var(--primary);
                    background-image: radial-gradient(circle at 20% 20%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) 20%, transparent 20%),
                                      radial-gradient(circle at 80% 80%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.05) 20%, transparent 20%);
                    background-size: 100px 100px;
                }
                .blob-shape {
                    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
                }
                .btn-shadow {
                    box-shadow: 0 4px 0 rgba(0,0,0,0.2);
                    transition: all 0.1s ease-in-out;
                }
                .btn-shadow:active {
                    box-shadow: 0 0 0 rgba(0,0,0,0.2);
                    transform: translateY(4px);
                }
            `}</style>

      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <nav className="bg-primary sticky top-0 z-50 flex items-center justify-between px-6 py-4 text-white shadow-md md:px-12">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-accent text-4xl">
            stadia_controller
          </span>
          <span className="logo-font text-3xl font-bold tracking-wide">
            Kuizz
          </span>
        </div>
        <div className="hidden gap-8 text-lg font-semibold md:flex">
          <Link
            className="hover:text-accent transition-colors"
            href="/dashboard"
          >
            Play
          </Link>
          <Link
            className="hover:text-accent transition-colors"
            href="/dashboard"
          >
            Explore
          </Link>
          <Link
            className="hover:text-accent transition-colors"
            href="/dashboard"
          >
            Create
          </Link>
        </div>
        <div className="flex gap-4">
          <Link
            className="hover:text-accent hidden rounded-full border-2 border-white px-5 py-2 font-bold transition-colors hover:bg-white md:block"
            href="/login"
          >
            Log in
          </Link>
          <Link
            className="btn-shadow bg-accent text-primary hover:bg-accent-hover rounded-full px-5 py-2 font-bold transition-colors"
            href="/register"
          >
            Sign up
          </Link>
        </div>
      </nav>

      <header className="hero-pattern relative overflow-hidden px-6 pt-16 pb-32 text-white">
        <div className="bg-secondary absolute top-10 left-10 h-32 w-32 rounded-full opacity-20 blur-2xl"></div>
        <div className="bg-accent absolute right-10 bottom-10 h-48 w-48 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 h-12 w-12 rotate-45 rounded-md border-4 border-white opacity-20"></div>
        <div className="absolute right-1/4 bottom-20 h-8 w-8 rounded-full bg-white opacity-20"></div>

        <div className="relative z-10 container mx-auto grid items-center gap-12 md:grid-cols-2">
          <div className="text-center md:text-left">
            <h1 className="mb-6 text-5xl leading-tight font-bold md:text-7xl">
              Make learning <br />
              <span className="text-accent">awesome!</span>
            </h1>
            <p className="mx-auto mb-8 max-w-lg text-xl text-gray-200 md:mx-0 md:text-2xl">
              Host live quizzes, compete with friends, and master any subject in
              real-time.
            </p>
            <div className="mx-auto flex max-w-md flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl md:mx-0 md:flex-row">
              <input
                className="focus:ring-secondary grow rounded-xl border-none bg-gray-100 px-6 py-4 text-center text-2xl font-bold text-gray-800 placeholder-gray-400 outline-none focus:ring-2 md:text-left"
                placeholder="Game PIN"
                type="text"
              />
              <button className="btn-shadow bg-text-dark rounded-xl px-8 py-4 text-xl font-bold whitespace-nowrap text-white transition-colors hover:bg-black">
                Join Game
              </button>
            </div>
            <div className="mt-6">
              <span className="text-sm opacity-80">Or want to host?</span>
              <Link
                className="decoration-accent hover:text-accent ml-2 font-bold underline decoration-4 underline-offset-4 transition-colors"
                href="/dashboard"
              >
                Create your own quiz
              </Link>
            </div>
          </div>

          <div className="relative hidden h-[500px] md:block">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-text-dark relative w-full max-w-md rotate-3 transform overflow-hidden rounded-[40px] bg-white p-8 shadow-2xl">
                <div className="bg-secondary absolute top-0 right-0 left-0 flex h-32 items-center justify-center rounded-t-[40px]">
                  <span className="material-symbols-outlined animate-bounce text-6xl text-white">
                    emoji_events
                  </span>
                </div>
                <div className="mt-28 text-center">
                  <h3 className="mb-2 text-2xl font-bold">Weekly Trivia</h3>
                  <div className="mb-6 flex justify-center gap-2">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                      12 Questions
                    </span>
                    <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
                      Live
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 rounded-xl border-l-8 border-red-500 bg-gray-100 p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 font-bold text-white">
                        A
                      </div>
                      <span className="text-lg font-bold">Mount Everest</span>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border-l-8 border-blue-500 bg-gray-100 p-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 font-bold text-white">
                        B
                      </div>
                      <span className="text-lg font-bold">K2</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-accent absolute top-20 right-0 rotate-12 animate-pulse rounded-2xl p-4 shadow-lg">
              <span className="material-symbols-outlined text-primary text-4xl">
                timer
              </span>
            </div>
            <div className="absolute bottom-20 left-10 -rotate-6 rounded-2xl bg-white p-4 shadow-lg">
              <span className="text-primary text-xl font-bold">4,250 pts</span>
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-20 -mt-16 rounded-t-[50px] bg-white py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-primary mb-16 text-center text-4xl font-bold">
            How Kuizz Works
          </h2>
          <div className="grid gap-12 md:grid-cols-3">
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-purple-100 transition-transform duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-primary text-6xl">
                  edit_document
                </span>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-800">
                1. Create
              </h3>
              <p className="px-4 text-gray-600">
                Build your own quizzes in minutes with our intuitive editor. Add
                images, multiple choice, and custom timers.
              </p>
            </div>
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 transition-transform duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-secondary text-6xl">
                  podium
                </span>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-800">2. Host</h3>
              <p className="px-4 text-gray-600">
                Launch a live game on a big screen. Players join using their
                phones with a unique PIN code.
              </p>
            </div>
            <div className="group text-center">
              <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-yellow-100 transition-transform duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined text-6xl text-yellow-600">
                  celebration
                </span>
              </div>
              <h3 className="mb-3 text-2xl font-bold text-gray-800">3. Play</h3>
              <p className="px-4 text-gray-600">
                Answer questions on your device. The faster you answer, the more
                points you get. Aim for the podium!
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface py-20">
        <div className="container mx-auto px-6">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <h2 className="text-text-dark mb-2 text-4xl font-bold">
                Featured Quizzes
              </h2>
              <p className="text-lg text-gray-600">
                Top picks for you to play right now
              </p>
            </div>
            <Link
              className="text-secondary hidden items-center gap-1 font-bold hover:underline md:flex"
              href="/dashboard"
            >
              See all
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-xl">
              <div className="flex h-40 items-center justify-center bg-linear-to-br from-purple-500 to-indigo-600 transition-transform duration-500 group-hover:scale-105">
                <span className="material-symbols-outlined text-6xl text-white opacity-50">
                  science
                </span>
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-start justify-between">
                  <span className="rounded-md bg-purple-100 px-2 py-1 text-xs font-bold tracking-wider text-purple-600 uppercase">
                    Science
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="material-symbols-outlined mr-1 text-base">
                      help
                    </span>{" "}
                    15
                  </div>
                </div>
                <h3 className="group-hover:text-primary mb-1 text-lg font-bold transition-colors">
                  General Science Trivia
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  Test your knowledge on physics, biology and more.
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                    <img
                      alt="User"
                      className="h-full w-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5G6DFltrFrY2u5-vdiYJMWJe0I0IzoPVwRRhi0UM8ci1GlooQE-xDbEa2DrymV88YE1vvHmRq1DO4ZtuNFQrArCcRdbbz6cbUQsG1zpMFBIZUT_LiOUSrF6j9eaynPmE7vJLTywjQmWKRzVW55cfzK7NzDubycKCEhP_3qZQjGHKIALqvWg7qWTmDVxkVUalNow7Ue3C_aq3UAH09Isua0uEpfMmv7yyvJfPFxlzpU_cufzSUX13hSGqjGvB1xImf4hjlWEN1TYpS"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    Dr. Science
                  </span>
                </div>
              </div>
            </div>
            <div className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-xl">
              <div className="bg-linear-gradient-to-br flex h-40 items-center justify-center from-pink-500 to-rose-600 transition-transform duration-500 group-hover:scale-105">
                <span className="material-symbols-outlined text-6xl text-white opacity-50">
                  movie
                </span>
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-start justify-between">
                  <span className="rounded-md bg-pink-100 px-2 py-1 text-xs font-bold tracking-wider text-pink-600 uppercase">
                    Movies
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="material-symbols-outlined mr-1 text-base">
                      help
                    </span>{" "}
                    10
                  </div>
                </div>
                <h3 className="group-hover:text-primary mb-1 text-lg font-bold transition-colors">
                  90s Cinema Classics
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  How well do you remember the golden era of film?
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                    <img
                      alt="User"
                      className="h-full w-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDFAI5QArmznnkLyNMgl9hGC6rsdCbNaWvXHlUbjH6m8VLfSHGvme090ByPT-nu9UN1dZOsujrF55JolTXooU_kMBo3mql2c8fIU3-PEAa-OF9ImAtNZ88CnwWALo0Lxjpr1Xk_JgBtyNw4HMltULihXuJOKXyYQXavyLc7ZMj1MqIjUje7n6S21_pWzii0M22ThBBpW34Ec6T5gagPrX9SUbB1UjHcSskr0lKivNkazYRsTU0WWTQMWPGmu9dilo31KbVqjcg6FSo_"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    MovieBuff99
                  </span>
                </div>
              </div>
            </div>
            <div className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-xl">
              <div className="bg-linear-gradient-to-br flex h-40 items-center justify-center from-teal-400 to-green-500 transition-transform duration-500 group-hover:scale-105">
                <span className="material-symbols-outlined text-6xl text-white opacity-50">
                  public
                </span>
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-start justify-between">
                  <span className="rounded-md bg-teal-100 px-2 py-1 text-xs font-bold tracking-wider text-teal-600 uppercase">
                    Geography
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="material-symbols-outlined mr-1 text-base">
                      help
                    </span>{" "}
                    20
                  </div>
                </div>
                <h3 className="group-hover:text-primary mb-1 text-lg font-bold transition-colors">
                  World Capitals
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  Can you name the capital of every country?
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                    <img
                      alt="User"
                      className="h-full w-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7IaG5aloOen6YoG_EnQvtcS0JmMJFv4ixbQ_7qywkjDIkf4EtUcFCfzsqEfzADA-uxFLpAp9xcjnFcGLBTGXbXyjWS_OLbA82YGE9FVwNNKXAGVkTzBzMgxrKDIVloanPjLe_jNtuwItbA1VfpxwEBpWRb7wCZ5UYHC3LHZtSH7H9oozLJoelaKegCx3Udpb46_7DDjoYyNRYwX3job56whAWVnaTe5O-XZ47137rp75xqK05rdfTo0ukwgXNYo2vBHMHiVZPnCzZ"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    GeoMaster
                  </span>
                </div>
              </div>
            </div>
            <div className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-xl">
              <div className="bg-linear-gradient-to-br flex h-40 items-center justify-center from-yellow-400 to-orange-500 transition-transform duration-500 group-hover:scale-105">
                <span className="material-symbols-outlined text-6xl text-white opacity-50">
                  pets
                </span>
              </div>
              <div className="p-5">
                <div className="mb-2 flex items-start justify-between">
                  <span className="rounded-md bg-orange-100 px-2 py-1 text-xs font-bold tracking-wider text-orange-600 uppercase">
                    Animals
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="material-symbols-outlined mr-1 text-base">
                      help
                    </span>{" "}
                    8
                  </div>
                </div>
                <h3 className="group-hover:text-primary mb-1 text-lg font-bold transition-colors">
                  Cute Animals 101
                </h3>
                <p className="mb-4 text-sm text-gray-500">
                  Identify these adorable creatures.
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                    <img
                      alt="User"
                      className="h-full w-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAWuyC8s6hhTll9Rp1GGghR2FDqmuhCz6guE_9CsAKVXsFYa58QrJ3fczEAhB70Hn0sBc6Ew2Tnbz2fRMY-WtTT8Nb_BlcguTODAIZELm-pIPpZ3v24t2ZZavAZhAmzaNVTeyyCIyJ9coZjq5p-vfXyYM3G9V-N4QrkTvcozlmu9mRMmKr4F04AMl75ISEBK3q1oiZkvzCRF9oGJL4HgvUNxZQVfMg8eXOcGwSlbcD4g8mm0SLuNnghXJ_Cja8Mm7OZzd3MZA0BHp5Z"
                    />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    PetLover
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center md:hidden">
            <button className="border-secondary text-secondary rounded-full border-2 bg-white px-6 py-2 font-bold">
              See all quizzes
            </button>
          </div>
        </div>
      </section>

      <section className="px-6 py-20">
        <div className="bg-primary relative container mx-auto max-w-5xl overflow-hidden rounded-[40px] p-10 text-center text-white md:p-16">
          <div
            className="absolute top-0 left-0 h-full w-full opacity-10"
            style={{
              backgroundImage: "radial-gradient(white 2px, transparent 2px)",
              backgroundSize: "30px 30px",
            }}
          ></div>
          <div className="relative z-10">
            <h2 className="mb-6 text-3xl font-bold md:text-5xl">
              Ready to create your own game?
            </h2>
            <p className="mx-auto mb-10 max-w-2xl text-xl text-purple-200 md:text-2xl">
              Join thousands of teachers, students, and quiz enthusiasts
              creating awesome learning experiences.
            </p>
            <Link
              href="/register"
              className="btn-shadow bg-accent text-primary hover:bg-accent-hover inline-block rounded-full px-10 py-4 text-xl font-bold transition-colors"
            >
              Get Started for Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="mt-auto bg-[#2a0e57] pt-16 pb-8 text-white">
        <div className="container mx-auto px-6">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1">
              <div className="mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-accent text-3xl">
                  stadia_controller
                </span>
                <span className="logo-font text-2xl font-bold">Kuizz</span>
              </div>
              <p className="text-sm leading-relaxed text-purple-300">
                A real-time, interactive multiplayer quiz application for fun
                learning and assessment.
              </p>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-bold">Discover</h4>
              <ul className="space-y-2 text-purple-200">
                <li>
                  <Link
                    className="transition-colors hover:text-white"
                    href="/dashboard"
                  >
                    Featured
                  </Link>
                </li>
                <li>
                  <Link
                    className="transition-colors hover:text-white"
                    href="/dashboard"
                  >
                    Search
                  </Link>
                </li>
                <li>
                  <Link
                    className="transition-colors hover:text-white"
                    href="/dashboard"
                  >
                    Categories
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-bold">About</h4>
              <ul className="space-y-2 text-purple-200">
                <li>
                  <Link className="transition-colors hover:text-white" href="#">
                    Our Story
                  </Link>
                </li>
                <li>
                  <Link className="transition-colors hover:text-white" href="#">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link className="transition-colors hover:text-white" href="#">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-lg font-bold">Help</h4>
              <ul className="space-y-2 text-purple-200">
                <li>
                  <Link className="transition-colors hover:text-white" href="#">
                    Support Center
                  </Link>
                </li>
                <li>
                  <Link className="transition-colors hover:text-white" href="#">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link className="transition-colors hover:text-white" href="#">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-purple-900 pt-8 text-sm text-purple-400 md:flex-row">
            <p>© 2024 Kuizz Inc. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="cursor-pointer hover:text-white">
                <i className="material-symbols-outlined">public</i>
              </span>
              <span className="cursor-pointer hover:text-white">
                <i className="material-symbols-outlined">mail</i>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
