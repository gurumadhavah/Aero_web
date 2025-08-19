"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(3, "Title is required."),
  date: z.string().min(3, "Date is required."),
  location: z.string().min(3, "Location is required."),
  description: z.string().min(10, "Description is required."),
  registrationLink: z.string().url().optional().or(z.literal('')),
  imageFile: z.custom<File>(val => val instanceof File, "An image file is required."),
});

export function AddEventForm({ onEventAdded }: { onEventAdded?: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      date: "",
      location: "",
      description: "",
      registrationLink: "",
      imageFile: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !values.imageFile) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `events/${Date.now()}_${values.imageFile.name}`);
      const uploadTask = await uploadBytes(storageRef, values.imageFile);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      await addDoc(collection(db, "events"), {
        title: values.title,
        date: values.date,
        location: values.location,
        description: values.description,
        registrationLink: values.registrationLink,
        imageUrl: downloadURL,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Success!", description: "Event has been added." });
      form.reset();
      if (onEventAdded) onEventAdded();
    } catch (error) {
      console.error("Error adding event: ", error);
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Event Title</FormLabel><FormControl><Input placeholder="Annual Drone Workshop" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem><FormLabel>Event Date</FormLabel><FormControl><Input placeholder="e.g., September 25, 2025" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="location" render={({ field }) => (
          <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="SJEC Campus, Main Auditorium" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Details about the event..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="registrationLink" render={({ field }) => (
          <FormItem><FormLabel>Registration Link (Optional)</FormLabel><FormControl><Input placeholder="https://forms.gle/..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="imageFile" render={({ field }) => (
          <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                  <Input type="file" accept="image/png, image/jpeg, image/webp"
                  onChange={(event) => field.onChange(event.target.files?.[0])}/>
              </FormControl>
              <FormMessage />
          </FormItem>
        )} />
        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Add Event"}
        </Button>
      </form>
    </Form>
  );
}