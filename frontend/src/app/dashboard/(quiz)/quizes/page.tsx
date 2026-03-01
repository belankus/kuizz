import QuizesComponent from "./QuizesComponent";

export default function QuizesPage() {
  const apiUrl = process.env.API_URL;
  return <QuizesComponent apiUrl={apiUrl || ""} />;
}
