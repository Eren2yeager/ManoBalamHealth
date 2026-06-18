import { CrisisResourceModel } from "./crisisResource.model";
import { GetCrisisResourcesQuery, CrisisResourceResponse } from "./crisis.types";

export class CrisisService {
  async getResources(
    query: GetCrisisResourcesQuery
  ): Promise<CrisisResourceResponse[]> {
    const filter = { isActive: true };
    if (query.jurisdiction) {
      // @ts-expect-error: Adding jurisdiction to filter
      filter.jurisdiction = query.jurisdiction;
    }

    const resources = await CrisisResourceModel.find(filter);
    return resources.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      description: r.description,
      phone: r.phone,
      website: r.website,
    }));
  }
}

export const crisisService = new CrisisService();
