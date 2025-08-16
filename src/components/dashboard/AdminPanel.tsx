// src/components/dashboard/AdminPanel.tsx
"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { getFunctions, httpsCallable } from "firebase/functions";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminForm } from "./AdminForm";
import { achievementSchema, eventSchema, gallerySchema } from "@/lib/schemas";
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { EditModal } from "./EditModal";
import * as z from "zod";
import { AnnouncementForm } from "./AnnouncementForm";

// --- Form Field Configurations ---
const achievementFields = [ { name: "sortId", label: "Sort ID (e.g., 1, 2, 3)", placeholder: "1", type: "number" }, { name: "title", label: "Title", placeholder: "SAE Aero Design 2024" }, { name: "date", label: "Date", placeholder: "March 2024" }, { name: "rank", label: "Rank/Award (Optional)", placeholder: "1st Place" }, { name: "imageUrl", label: "Image Path", placeholder: "/images/achievements/sae2024.jpg" }, { name: "description", label: "Description", placeholder: "A brief summary...", type: "textarea" }, ];
const eventFields = [ { name: "title", label: "Event Title", placeholder: "Annual Drone Workshop" }, { name: "date", label: "Event Date", type: "date" }, { name: "location", label: "Location", placeholder: "SJEC Campus, Main Auditorium" }, { name: "imageUrl", label: "Image Path", placeholder: "/images/events/workshop2024.png" }, { name: "registrationLink", label: "Registration Link (Optional)", placeholder: "https://forms.gle/..." }, { name: "description", label: "Description", placeholder: "Details about the event...", type: "textarea" }, ];
const galleryFields = [ { name: "sortId", label: "Sort ID", placeholder: "1", type: "number"}, { name: "title", label: "Title", placeholder: "V-TOL Flight Test" }, { name: "mediaType", label: "Media Type", type: "select", options: ["image", "video"] }, { name: "imageUrl", label: "Image Path (or Thumbnail)", placeholder: "/images/gallery/vtol_test.jpg" }, { name: "videoUrl", label: "YouTube/Vimeo URL (if video)", placeholder: "https://www.youtube.com/watch?v=..." }, { name: "description", label: "Description (Optional)", placeholder: "A short caption...", type: "textarea" }, ];

// New Component specifically for managing announcements
const ManageAnnouncements = () => {
    const [items, setItems] = React.useState<any[]>([]);
    const { toast } = useToast();

    const fetchData = React.useCallback(async () => {
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, []);

    React.useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (docId: string) => {
        try {
            await deleteDoc(doc(db, "announcements", docId));
            toast({ title: "Success!", description: "Announcement has been deleted." });
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: "You do not have permission to delete this.", variant: "destructive" });
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader><CardTitle>Manage Existing Announcements</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-2">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                            <p className="font-medium">{item.title}</p>
                            <div className="flex items-center gap-2">
                                {/* Edit functionality would require a new EditModal specific for announcements */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

const ContentSection = ({ collectionName, formSchema, fields, formTitle }: any) => {
  const [items, setItems] = React.useState<any[]>([]);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  }, [collectionName]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (docId: string) => {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      toast({ title: "Success!", description: "Item has been deleted." });
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: "You do not have permission to delete this item.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 pt-6">
      <AdminForm collectionName={collectionName} formSchema={formSchema} fields={fields} formTitle={formTitle} onSubmitted={fetchData} />
      <Card>
        <CardHeader><CardTitle>Manage Existing Items</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex items-center justify-between rounded-lg border p-3">
                <p className="font-medium">{item.title}</p>
                <div className="flex items-center gap-2">
                  <EditModal collectionName={collectionName} docId={item.id} initialData={item} formSchema={formSchema} fields={fields} onEdited={fetchData} />
                  <AlertDialog>
                    <AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone and will permanently delete the item.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export function AdminPanel() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Content Management</CardTitle>
                <CardDescription>Add, edit, or delete content from the website.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="announcements">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="announcements">Announcements</TabsTrigger>
                        <TabsTrigger value="achievements">Achievements</TabsTrigger>
                        <TabsTrigger value="events">Events</TabsTrigger>
                        <TabsTrigger value="gallery">Gallery</TabsTrigger>
                    </TabsList>
                    <TabsContent value="announcements" className="pt-6">
                        <AnnouncementForm />
                        <ManageAnnouncements />
                    </TabsContent>
                    <TabsContent value="achievements">
                        <ContentSection
                            collectionName="achievements"
                            formSchema={achievementSchema}
                            fields={achievementFields}
                            formTitle="Add New Achievement"
                        />
                    </TabsContent>
                    <TabsContent value="events">
                        <ContentSection
                            collectionName="events"
                            formSchema={eventSchema}
                            fields={eventFields}
                            formTitle="Add New Event"
                        />
                    </TabsContent>
                    <TabsContent value="gallery">
                        <ContentSection
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