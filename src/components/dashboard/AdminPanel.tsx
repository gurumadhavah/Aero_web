// src/components/dashboard/AdminPanel.tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManageMembers } from "./ManageMembers";
import { ViewSubmissions } from "./ViewSubmissions";
import { ViewProjects } from "./ViewProjects";
import { ViewAchievements } from "./ViewAchievements";
import { ViewEvents } from "./ViewEvents";
import { ViewGallery } from "./ViewGallery";
import { ViewAnnouncements } from "./ViewAnnouncements";
// --- NEW IMPORT ---
import ViewContactMessages from "./ViewContactMessages";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

export function AdminPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard</CardTitle>
        <CardDescription>Manage your website's content and view user interactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8">
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="gallery">Gallery</TabsTrigger>
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            {/* --- NEW TAB TRIGGER --- */}
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="mt-4">
            <ManageMembers />
          </TabsContent>
          <TabsContent value="recruitment" className="mt-4">
            <ViewSubmissions
              collectionName="recruitment_submissions"
              title="Recruitment Submissions"
              description="View and manage recruitment form submissions."
              headers={["Name", "Email", "Role", "Submitted At"]}
            />
          </TabsContent>
          <TabsContent value="projects" className="mt-4">
            <ViewProjects />
          </TabsContent>
          <TabsContent value="achievements" className="mt-4">
            <ViewAchievements />
          </TabsContent>
          <TabsContent value="events" className="mt-4">
            <ViewEvents />
          </TabsContent>
          <TabsContent value="gallery" className="mt-4">
            <ViewGallery />
          </TabsContent>
          <TabsContent value="announcements" className="mt-4">
            <ViewAnnouncements />
          </TabsContent>
          
          {/* --- NEW TAB CONTENT --- */}
          <TabsContent value="messages" className="mt-4">
            <ViewContactMessages />
          </TabsContent>

        </Tabs>
      </CardContent>
    </Card>
  );
}

export default AdminPanel;