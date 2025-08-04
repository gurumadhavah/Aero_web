import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeamPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">Meet the Team</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          The brilliant minds behind SJECAero's success.
        </p>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Content Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
            <p>This page will showcase the club's team members, rendered dynamically from our records. Check back soon for updates!</p>
        </CardContent>
       </Card>
    </div>
  );
}
