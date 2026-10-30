import type { Metadata } from "next";
import CreatePage from "./PageClientCreate";

export const metadata: Metadata = {
  title: "Quiz factory | Kuizz",
  description: "Create and manage your quizzes on Kuizz",
};

export default function Page() {
  return <CreatePage />;
}
