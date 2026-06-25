import { Navigate, useParams } from "react-router-dom";

export function AboutDetailPage() {
  const { slug = "" } = useParams();
  return <Navigate to={`/about#${slug}`} replace />;
}
