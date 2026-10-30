import type { Metadata } from "next";
import LandingPage from "./landing-page";

export const metadata: Metadata = {
  title: "Kuizz - The Multiplayer Quiz Platform",
  description:
    "Host live quizzes, compete with friends, and master any subject in real-time.",
};

export default function Page() {
  return <LandingPage />;
}