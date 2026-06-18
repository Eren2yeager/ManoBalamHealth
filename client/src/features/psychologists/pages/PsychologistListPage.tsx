import { PsychologistList } from "../components/PsychologistList";

export const PsychologistListPage = () => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Find Your Therapist</h1>
        <PsychologistList />
      </div>
    </div>
  );
};
