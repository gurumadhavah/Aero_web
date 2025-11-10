"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db, storage } from "@/lib/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { eventSchema } from "@/lib/schemas"; // <-- 1. IMPORT THE SCHEMA

// 2. Use the imported schema type
export function AddEventForm({ onEventAdded }: { onEventAdded?: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof eventSchema>>({ // <-- 3. Use the schema here
    resolver: zodResolver(eventSchema), // <-- 4. And here
    defaultValues: {
      name: "",
      date: "",
      location: "",
      description: "",
      registrationLink: "",
      imageFile: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof eventSchema>) {
    if (!user || !values.imageFile) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `events/${Date.now()}_${values.imageFile.name}`);
      const uploadTask = await uploadBytes(storageRef, values.imageFile);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      // Convert date string to Timestamp here
      const eventDate = new Date(values.date);
      const eventTimestamp = Timestamp.fromDate(eventDate);

      await addDoc(collection(db, "events"), {
        name: values.name, // Save as 'name'
        date: eventTimestamp, // Save as Timestamp
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
        <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Annual Drone Workshop" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>Event Date and Time</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="SJEC Campus, Main Auditorium" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Details about the event..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="registrationLink" render={({ field }) => (
            <FormItem>
              <FormLabel>Registration Link (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://forms.gle/..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField control={form.control} name="imageFile" render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
              <FormControl>
                <Input type="file" accept="image/png, image/jpeg, image/webp"
                  onChange={(event) => field.onChange(event.target.files?.[0])}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Add Event"}
        </Button>
      </form>
    </Form>
  );
}