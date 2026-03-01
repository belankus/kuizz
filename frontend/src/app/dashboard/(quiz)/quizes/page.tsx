import QuizesComponent from "./QuizesComponent";

export default function QuizesPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return <QuizesComponent apiUrl={apiUrl || ""} />;
}
