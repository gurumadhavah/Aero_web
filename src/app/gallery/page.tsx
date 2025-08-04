import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function GalleryPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">Gallery</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          A visual journey through our projects, events, and moments.
        </p>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Content Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
            <p>This page will showcase photos and videos from club activities, rendered dynamically from our storage. Check back soon for updates!</p>
        </CardContent>
      </Card>
    </div>
  );
}
