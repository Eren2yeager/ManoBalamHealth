import { PsychologistList } from "../components/PsychologistList";
import "./psychologist-list-page.css";

export const PsychologistListPage = () => {
  return (
    <div className="psychologist-directory-page min-h-[calc(100dvh-4.5rem)] bg-[#f5f3ff]">
      <PsychologistList />
    </div>
  );
};
