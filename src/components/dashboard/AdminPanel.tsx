// src/components/dashboard/AdminPanel.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminForm } from "./AdminForm";
import { achievementSchema, eventSchema, gallerySchema } from "@/lib/schemas";

// --- Configuration for each form ---
const achievementFields = [
  { name: "title", label: "Title", placeholder: "SAE Aero Design 2024" },
  { name: "date", label: "Date", placeholder: "March 2024" },
  { name: "rank", label: "Rank/Award (Optional)", placeholder: "1st Place" },
  { name: "imageUrl", label: "Image Path", placeholder: "/images/achievements/sae2024.jpg" },
  { name: "description", label: "Description", placeholder: "A brief summary of the achievement...", type: "textarea" },
];

const eventFields = [
  { name: "title", label: "Event Title", placeholder: "Annual Drone Workshop" },
  { name: "date", label: "Event Date", type: "date" },
  { name: "location", label: "Location", placeholder: "SJEC Campus, Main Auditorium" },
  { name: "imageUrl", label: "Image Path", placeholder: "/images/events/workshop2024.png" },
  { name: "registrationLink", label: "Registration Link (Optional)", placeholder: "https://forms.gle/..." },
  { name: "description", label: "Description", placeholder: "Details about the upcoming event...", type: "textarea" },
];

const galleryFields = [
    { name: "title", label: "Title", placeholder: "V-TOL Flight Test" },
    { name: "mediaType", label: "Media Type", type: "select", options: ["image", "video"] },
    { name: "imageUrl", label: "Image Path (or Thumbnail)", placeholder: "/images/gallery/vtol_test.jpg" },
    { name: "videoUrl", label: "YouTube/Vimeo URL (if video)", placeholder: "https://www.youtube.com/watch?v=..." },
    { name: "description", label: "Description (Optional)", placeholder: "A short caption for the media...", type: "textarea" },
];


export function AdminPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Management</CardTitle>
        <CardDescription>Add new achievements, events, or gallery items to the website.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="achievements">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
          </TabsList>
          <TabsContent value="achievements">
            <AdminForm
              collectionName="achievements"
              formSchema={achievementSchema}
              fields={achievementFields}
              formTitle="Add New Achievement"
            />
          </TabsContent>
          <TabsContent value="events">
             <AdminForm
              collectionName="events"
              formSchema={eventSchema}
              fields={eventFields}
              formTitle="Add New Event"
            />
          </TabsContent>
           <TabsContent value="gallery">
             <AdminForm
              collectionName="gallery"
              formSchema={gallerySchema}
              fields={galleryFields}
              formTitle="Add New Gallery Item"
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}