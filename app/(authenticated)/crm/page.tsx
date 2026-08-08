import { getEmployees } from "@/lib/actions/people";
import { PageHeader } from "@/components/shared/page-header";
import { Pagination } from "@/components/shared/pagination";
import { SearchForm } from "@/components/shared/search-form";
import { CrmClient } from "@/features/crm/client";

export default async function CrmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const data = await getEmployees({
    search: sp.search,
    status: sp.status,
    page: Number(sp.page ?? 1),
    pageSize: 10,
  });
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="CRM — Employees" description="Staff records, roles and permission matrix" />
      <div className="flex flex-wrap items-center gap-2 px-4 lg:px-6">
        <SearchForm placeholder="Search name, email, phone…" />
      </div>
      <CrmClient employees={data.items} statusFilter={sp.status} />
      <div className="px-4 lg:px-6">
        <Pagination total={data.total} page={data.page} pageSize={data.pageSize} searchParams={sp} />
      </div>
    </div>
  );
}
