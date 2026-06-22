import { Navigate, useParams } from "react-router-dom";
import { CommitteeGrid } from "../components/CommitteeGrid";
import { PublicPageLayout } from "../components/PublicPageLayout";
import { organizationContent } from "../content/organization.content";

export function OrganizationDetailPage() {
  const { slug = "" } = useParams();
  const page = organizationContent[slug];
  if (!page) return <Navigate to="/organization/executive-committee" replace />;
  return (
    <PublicPageLayout page={page} section="Organization">
      <CommitteeGrid members={page.members} />
    </PublicPageLayout>
  );
}

