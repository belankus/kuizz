import Link from "next/link";
import type { Metadata } from "next";
import { Fredoka, Nunito } from "next/font/google";
import {
  CircleQuestionMark,
  Clapperboard,
  Earth,
  FilePenLine,
  Globe,
  Lectern,
  Mail,
  Medal,
  Microscope,
  MoveRight,
  PartyPopper,
  PawPrint,
  SquareMousePointer,
  Timer,
} from "lucide-react";

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
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .kuizz-landing {
            --primary: #46178F;
            --secondary: #1368CE;
            --accent: #FFC000;
            --accent-hover: #e0a800;
            --surface: #F2F2F2;
            --text-dark: #333333;
            --card-bg: #FFFFFF;
            background-color: var(--surface);
            color: var(--text-dark);
            font-family: ${nunito.style.fontFamily}, sans-serif;
        }
        .kuizz-landing h1, .kuizz-landing h2, .kuizz-landing h3, .kuizz-landing .logo-font {
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
        `,
        }}
      />

      <div className="kuizz-landing flex min-h-screen flex-col">
        <nav className="sticky top-0 z-50 flex items-center justify-between bg-[var(--primary)] px-6 py-4 text-white shadow-md md:px-12">
          <div className="flex items-center gap-2">
            <SquareMousePointer className="text-accent text-[20px]" />
            <span className="logo-font text-3xl font-bold tracking-wide">
              Kuizz
            </span>
          </div>
          <div className="hidden gap-8 text-lg font-semibold md:flex">
            <Link
              className="transition-colors hover:text-[var(--accent)]"
              href="#"
            >
              Play
            </Link>
            <Link
              className="transition-colors hover:text-[var(--accent)]"
              href="#"
            >
              Explore
            </Link>
            <Link
              className="transition-colors hover:text-[var(--accent)]"
              href="/dashboard"
            >
              Create
            </Link>
          </div>
          <div className="flex gap-4">
            <Link
              className="hidden rounded-full border-2 border-white px-5 py-2 font-bold transition-colors hover:bg-white hover:text-[var(--primary)] md:block"
              href="/login"
            >
              Log in
            </Link>
            <Link
              className="btn-shadow rounded-full bg-[var(--accent)] px-5 py-2 font-bold text-[var(--primary)] transition-colors hover:bg-[var(--accent-hover)]"
              href="/register"
            >
              Sign up
            </Link>
          </div>
        </nav>

        <header className="hero-pattern relative overflow-hidden px-6 pt-16 pb-32 text-white">
          <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-[var(--secondary)] opacity-20 blur-2xl"></div>
          <div className="absolute right-10 bottom-10 h-48 w-48 rounded-full bg-[var(--accent)] opacity-20 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 h-12 w-12 rotate-45 rounded-md border-4 border-white opacity-20"></div>
          <div className="absolute right-1/4 bottom-20 h-8 w-8 rounded-full bg-white opacity-20"></div>
          <div className="relative z-10 container mx-auto grid items-center gap-12 md:grid-cols-2">
            <div className="text-center md:text-left">
              <h1 className="mb-6 text-5xl leading-tight font-bold md:text-7xl">
                Make learning <br />
                <span className="text-[var(--accent)]">awesome!</span>
              </h1>
              <p className="mx-auto mb-8 max-w-lg text-xl text-gray-200 md:mx-0 md:text-2xl">
                Host live quizzes, compete with friends, and master any subject
                in real-time.
              </p>
              <div className="mx-auto flex max-w-md flex-col gap-2 rounded-2xl bg-white p-2 shadow-xl md:mx-0 md:flex-row">
                <input
                  className="flex-grow rounded-xl border-none bg-gray-100 px-6 py-4 text-center text-2xl font-bold text-gray-800 placeholder-gray-400 outline-none focus:ring-2 focus:ring-[var(--secondary)] md:text-left"
                  placeholder="Game PIN"
                  type="text"
                />
                <button className="btn-shadow rounded-xl bg-[var(--text-dark)] px-8 py-4 text-xl font-bold whitespace-nowrap text-white transition-colors hover:bg-black">
                  Join Game
                </button>
              </div>
              <div className="mt-6">
                <span className="text-sm opacity-80">Or want to host?</span>
                <Link
                  className="ml-2 font-bold underline decoration-[var(--accent)] decoration-4 underline-offset-4 transition-colors hover:text-[var(--accent)]"
                  href="/dashboard"
                >
                  Create your own quiz
                </Link>
              </div>
            </div>
            <div className="relative hidden h-[500px] md:block">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full max-w-md rotate-3 transform overflow-hidden rounded-[40px] bg-white p-8 text-[var(--text-dark)] shadow-2xl">
                  <div className="absolute top-0 right-0 left-0 flex h-32 items-center justify-center rounded-t-[40px] bg-[var(--secondary)]">
                    <Medal className="text-white" size={64} />
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
              <div className="absolute top-20 right-0 rotate-12 animate-pulse rounded-xl bg-[var(--accent)] p-2 shadow-lg">
                <Timer className="text-primary" size={32} />
              </div>
              <div className="absolute bottom-20 left-10 -rotate-6 rounded-2xl bg-white p-4 shadow-lg">
                <span className="text-xl font-bold text-[var(--primary)]">
                  4,250 pts
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="relative z-20 -mt-16 rounded-t-[50px] bg-white py-20">
          <div className="container mx-auto px-6">
            <h2 className="mb-16 text-center text-4xl font-bold text-[var(--primary)]">
              How Kuizz Works
            </h2>
            <div className="grid gap-12 md:grid-cols-3">
              <div className="group text-center">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-purple-100 transition-transform duration-300 group-hover:scale-110">
                  <FilePenLine className="text-primary" size={64} />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-800">
                  1. Create
                </h3>
                <p className="px-4 text-gray-600">
                  Build your own quizzes in minutes with our intuitive editor.
                  Add images, multiple choice, and custom timers.
                </p>
              </div>
              <div className="group text-center">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 transition-transform duration-300 group-hover:scale-110">
                  <Lectern className="text-primary" size={64} />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-800">
                  2. Host
                </h3>
                <p className="px-4 text-gray-600">
                  Launch a live game on a big screen. Players join using their
                  phones with a unique PIN code.
                </p>
              </div>
              <div className="group text-center">
                <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-yellow-100 transition-transform duration-300 group-hover:scale-110">
                  <PartyPopper className="text-primary" size={64} />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-gray-800">
                  3. Play
                </h3>
                <p className="px-4 text-gray-600">
                  Answer questions on your device. The faster you answer, the
                  more points you get. Aim for the podium!
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[var(--surface)] py-20">
          <div className="container mx-auto px-6">
            <div className="mb-12 flex items-end justify-between">
              <div>
                <h2 className="mb-2 text-4xl font-bold text-[var(--text-dark)]">
                  Featured Quizzes
                </h2>
                <p className="text-lg text-gray-600">
                  Top picks for you to play right now
                </p>
              </div>
              <Link
                className="text-secondary hidden items-center gap-1 font-bold hover:underline md:flex"
                href="#"
              >
                See all
                <MoveRight className="text-secondary" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  id: 1,
                  subject: "Science",
                  subjectColorClass: "text-purple-600 bg-purple-100",
                  icon: <Microscope size={64} className="text-white" />,
                  questions: 15,
                  title: "General Science Trivia",
                  desc: "Test your knowledge on physics, biology and more.",
                  author: "Dr. Science",
                  bgGradient: "from-purple-500 to-indigo-600",
                  imgSrc:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuB5G6DFltrFrY2u5-vdiYJMWJe0I0IzoPVwRRhi0UM8ci1GlooQE-xDbEa2DrymV88YE1vvHmRq1DO4ZtuNFQrArCcRdbbz6cbUQsG1zpMFBIZUT_LiOUSrF6j9eaynPmE7vJLTywjQmWKRzVW55cfzK7NzDubycKCEhP_3qZQjGHKIALqvWg7qWTmDVxkVUalNow7Ue3C_aq3UAH09Isua0uEpfMmv7yyvJfPFxlzpU_cufzSUX13hSGqjGvB1xImf4hjlWEN1TYpS",
                },
                {
                  id: 2,
                  subject: "Movies",
                  subjectColorClass: "text-pink-600 bg-pink-100",
                  icon: <Clapperboard size={64} className="text-white" />,
                  questions: 10,
                  title: "90s Cinema Classics",
                  desc: "How well do you remember the golden era of film?",
                  author: "MovieBuff99",
                  bgGradient: "from-pink-500 to-rose-600",
                  imgSrc:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuDFAI5QArmznnkLyNMgl9hGC6rsdCbNaWvXHlUbjH6m8VLfSHGvme090ByPT-nu9UN1dZOsujrF55JolTXooU_kMBo3mql2c8fIU3-PEAa-OF9ImAtNZ88CnwWALo0Lxjpr1Xk_JgBtyNw4HMltULihXuJOKXyYQXavyLc7ZMj1MqIjUje7n6S21_pWzii0M22ThBBpW34Ec6T5gagPrX9SUbB1UjHcSskr0lKivNkazYRsTU0WWTQMWPGmu9dilo31KbVqjcg6FSo_",
                },
                {
                  id: 3,
                  subject: "Geography",
                  subjectColorClass: "text-teal-600 bg-teal-100",
                  icon: <Earth size={64} className="text-white" />,
                  questions: 20,
                  title: "World Capitals",
                  desc: "Can you name the capital of every country?",
                  author: "GeoMaster",
                  bgGradient: "from-teal-400 to-green-500",
                  imgSrc:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuA7IaG5aloOen6YoG_EnQvtcS0JmMJFv4ixbQ_7qywkjDIkf4EtUcFCfzsqEfzADA-uxFLpAp9xcjnFcGLBTGXbXyjWS_OLbA82YGE9FVwNNKXAGVkTzBzMgxrKDIVloanPjLe_jNtuwItbA1VfpxwEBpWRb7wCZ5UYHC3LHZtSH7H9oozLJoelaKegCx3Udpb46_7DDjoYyNRYwX3job56whAWVnaTe5O-XZ47137rp75xqK05rdfTo0ukwgXNYo2vBHMHiVZPnCzZ",
                },
                {
                  id: 4,
                  subject: "Animals",
                  subjectColorClass: "text-orange-600 bg-orange-100",
                  icon: <PawPrint size={64} className="text-white" />,
                  questions: 8,
                  title: "Cute Animals 101",
                  desc: "Identify these adorable creatures.",
                  author: "PetLover",
                  bgGradient: "from-yellow-400 to-orange-500",
                  imgSrc:
                    "https://lh3.googleusercontent.com/aida-public/AB6AXuAWuyC8s6hhTll9Rp1GGghR2FDqmuhCz6guE_9CsAKVXsFYa58QrJ3fczEAhB70Hn0sBc6Ew2Tnbz2fRMY-WtTT8Nb_BlcguTODAIZELm-pIPpZ3v24t2ZZavAZhAmzaNVTeyyCIyJ9coZjq5p-vfXyYM3G9V-N4QrkTvcozlmu9mRMmKr4F04AMl75ISEBK3q1oiZkvzCRF9oGJL4HgvUNxZQVfMg8eXOcGwSlbcD4g8mm0SLuNnghXJ_Cja8Mm7OZzd3MZA0BHp5Z",
                },
              ].map((quiz) => (
                <div
                  key={quiz.id}
                  className="group cursor-pointer overflow-hidden rounded-2xl bg-white shadow-sm transition-shadow hover:shadow-xl"
                >
                  <div
                    className={`h-40 bg-gradient-to-br ${quiz.bgGradient} flex items-center justify-center transition-transform duration-500 group-hover:scale-105`}
                  >
                    {quiz.icon}
                  </div>
                  <div className="p-5">
                    <div className="mb-2 flex items-start justify-between">
                      <span
                        className={`text-xs font-bold tracking-wider uppercase ${quiz.subjectColorClass} rounded-md px-2 py-1`}
                      >
                        {quiz.subject}
                      </span>
                      <div className="flex items-center rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-500">
                        <CircleQuestionMark
                          className="mr-1 text-base"
                          size={16}
                        />{" "}
                        {quiz.questions}
                      </div>
                    </div>
                    <h3 className="mb-1 text-lg font-bold transition-colors group-hover:text-[var(--primary)]">
                      {quiz.title}
                    </h3>
                    <p className="mb-4 text-sm text-gray-500">{quiz.desc}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt="User"
                          className="h-full w-full object-cover"
                          src={quiz.imgSrc}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {quiz.author}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <button className="rounded-full border-2 border-[var(--secondary)] bg-white px-6 py-2 font-bold text-[var(--secondary)]">
                See all quizzes
              </button>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="relative container mx-auto max-w-5xl overflow-hidden rounded-[40px] bg-[var(--primary)] p-10 text-center text-white md:p-16">
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
              <Link href="/register">
                <button className="btn-shadow rounded-full bg-[var(--accent)] px-10 py-4 text-xl font-bold text-[var(--primary)] transition-colors hover:bg-[var(--accent-hover)]">
                  Get Started for Free
                </button>
              </Link>
            </div>
          </div>
        </section>

        <footer className="mt-auto bg-[#2a0e57] pt-16 pb-8 text-white">
          <div className="container mx-auto px-6">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4">
              <div className="col-span-2 md:col-span-1">
                <div className="mb-4 flex items-center gap-2">
                  <SquareMousePointer className="text-accent text-[20px]" />
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
                      href="#"
                    >
                      Featured
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="transition-colors hover:text-white"
                      href="#"
                    >
                      Search
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="transition-colors hover:text-white"
                      href="#"
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
                    <Link
                      className="transition-colors hover:text-white"
                      href="#"
                    >
                      Our Story
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="transition-colors hover:text-white"
                      href="#"
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="transition-colors hover:text-white"
                      href="#"
                    >
                      Blog
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-lg font-bold">Help</h4>
                <ul className="space-y-2 text-purple-200">
                  <li>
                    <Link
                      className="transition-colors hover:text-white"
                      href="#"
                    >
                      Support Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="transition-colors hover:text-white"
                      href="#"
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      className="transition-colors hover:text-white"
                      href="#"
                    >
                      Terms of Service
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col items-center justify-between gap-4 border-t border-purple-900 pt-8 text-sm text-purple-400 md:flex-row">
              <p>
                © {new Date().getFullYear()} Kuizz Inc. All rights reserved.
              </p>
              <div className="flex gap-4">
                <Link className="hover:text-white" href="#">
                  <Globe size={24} />
                </Link>
                <Link className="hover:text-white" href="#">
                  <Mail size={24} />
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
