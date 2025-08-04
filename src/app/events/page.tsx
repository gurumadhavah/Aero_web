import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EventsPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">Upcoming Events</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          Join us for workshops, competitions, and guest lectures.
        </p>
      </div>
       <Card>
        <CardHeader>
            <CardTitle>Content Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
            <p>This page will showcase the club's events, rendered dynamically from our records. Check back soon for updates!</p>
        </CardContent>
       </Card>
    </div>
  );
}
