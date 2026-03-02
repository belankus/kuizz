import QuizesComponent from "./QuizesComponent";

export default function QuizesPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  return <QuizesComponent apiUrl={apiUrl} />;
}
