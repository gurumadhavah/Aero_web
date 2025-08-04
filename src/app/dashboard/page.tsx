import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">Member Dashboard</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          Welcome back! This is your personal hub for all club activities.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Features Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This area is for authenticated members. Soon, you'll be able to see announcements, submit requests, and manage your profile here. Core team members will have additional administrative tools.</p>
        </CardContent>
      </Card>
    </div>
  );
}
