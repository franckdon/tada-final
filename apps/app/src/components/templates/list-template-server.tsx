import { prisma } from "@/lib/prisma";
import { NoResults } from "./empty-states";
import { Fragment } from "react";
import { ListTemplates } from "./list-templates";

const pageSize = 10;
const maxItems = 100000;

interface FetchTemplatesParams {
  orgId: string;
  query?: string;
  from: number; // Starting page number
  to: number; // Ending page number
  pageSize: number;
  sort?: string[];
  tab?: "internal" | "external";
}

function fetchTemplates({
  orgId,
  query,
  from,
  to,
  pageSize,
  tab,
  sort = [],
}: FetchTemplatesParams) {
  const whereClause = {
    ...(tab && tab === "internal" && { organizationId: orgId }),
    ...(query && { name: { contains: query } }),
    ...(tab && { internal: tab === "internal" }),
  };

  const orderByClause = sort.map((s) => ({ [s]: "asc" }));

  const skip = from * pageSize;
  const take = (to - from + 1) * pageSize;
  return prisma.template.findMany({
    where: whereClause,
    orderBy: orderByClause,
    skip,
    take,
  });
}

export async function ListTemplateServer({
  orgId,
  query,
  sort,
  page,
  tab,
}: {
  orgId: string;
  query?: string;
  sort?: string[];
  page: number;
  tab?: "internal" | "external";
}) {
  const hasFilters = Object.values({ query }).some((value) => value !== null);
  const templates = await fetchTemplates({
    orgId,
    query,
    from: 0,
    to: hasFilters ? maxItems : page > 0 ? pageSize : pageSize - 1,
    pageSize,
    sort,
    tab,
  });

  async function loadMore({ from, to }: { from: number; to: number }) {
    "use server";

    return fetchTemplates({
      orgId,
      query,
      from: from + 1,
      to,
      pageSize,
      sort,
      tab,
    });
  }

  const hasNextPage = Boolean(
    templates.length && templates.length / (page + 1) > pageSize
  );

  return (
    <Fragment>
      {templates.length > 0 ? (
        <ListTemplates
          templates={templates}
          hasNextPage={hasNextPage}
          loadMore={loadMore}
          pageSize={pageSize}
          orgId={orgId}
        />
      ) : (
        <NoResults />
      )}
    </Fragment>
  );
}
