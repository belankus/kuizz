import { Metadata } from "next/dist/types";
import QuizesComponent from "./QuizesComponent";


export const metadata: Metadata = {
  title: "My Quizzes | Kuizz",
  description: "Manage, view, edit and share your quizzes on Kuizz",
};

export default function QuizesPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return <QuizesComponent apiUrl={apiUrl} />;
}
