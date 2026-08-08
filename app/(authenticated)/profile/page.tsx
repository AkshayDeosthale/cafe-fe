import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/misc";
import { currentEmployee, employeePermissions } from "@/lib/permissions";
import { formatDate, inr } from "@/lib/utils/format";


// ponytail: shows mock current employee. Swap with Clerk <UserProfile /> at launch.
export default function ProfilePage() {
  const me = currentEmployee();

  if (!me) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <PageHeader title="Profile" />
        <p className="px-4 text-muted-foreground lg:px-6">No employee record.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <PageHeader title="Profile" description="Your staff record and access" />
      <div className="grid max-w-2xl gap-4 px-4 lg:px-6">
        <Card>
          <CardHeader className="flex-row items-center gap-4">
            <Avatar className="size-14">
              <AvatarFallback className="text-lg">{me.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{me.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{me.designation} · {me.department}</p>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <div><span className="text-muted-foreground">Email:</span> {me.email}</div>
            <div><span className="text-muted-foreground">Phone:</span> {me.phone}</div>
            <div><span className="text-muted-foreground">Joined:</span> {formatDate(me.joiningDate)}</div>
            <div><span className="text-muted-foreground">Salary:</span> {inr(me.salary)}/mo</div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Status:</span> <StatusBadge status={me.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Role:</span>
              <Badge variant="outline" className="capitalize">{me.role}</Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Effective Permissions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-1.5">
            {employeePermissions(me).map((p) => (
              <Badge key={p} variant="secondary">{p}</Badge>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
