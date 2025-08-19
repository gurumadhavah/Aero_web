"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db, storage } from "@/lib/firebase"; // Make sure storage is exported from your firebase config
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
  sortId: z.coerce.number().min(1, "Sort ID is required."),
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  date: z.string().min(3, { message: "Date is required." }),
  rank: z.string().optional(),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  imageFile: z.custom<File>(val => val instanceof File, "An image file is required."),
});

export function AddAchievementForm({ onAchievementAdded }: { onAchievementAdded?: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sortId: 1,
      title: "",
      date: "",
      rank: "",
      description: "",
      imageFile: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !values.imageFile) return;
    setIsUploading(true);
    try {
      const storageRef = ref(storage, `achievements/${Date.now()}_${values.imageFile.name}`);
      const uploadTask = await uploadBytes(storageRef, values.imageFile);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      await addDoc(collection(db, "achievements"), {
        sortId: values.sortId,
        title: values.title,
        date: values.date,
        rank: values.rank,
        description: values.description,
        imageUrl: downloadURL,
        createdAt: serverTimestamp(),
        uploaderUid: user.uid,
      });

      toast({ title: "Success!", description: "Achievement has been added." });
      form.reset();
      if (onAchievementAdded) onAchievementAdded();
    } catch (error) {
      console.error("Error adding achievement: ", error);
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="sortId" render={({ field }) => (
          <FormItem><FormLabel>Sort ID (e.g., 1, 2, 3)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="SAE Aero Design 2024" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem><FormLabel>Date</FormLabel><FormControl><Input placeholder="March 2024" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="rank" render={({ field }) => (
          <FormItem><FormLabel>Rank/Award (Optional)</FormLabel><FormControl><Input placeholder="1st Place" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="A brief summary..." {...field} /></FormControl><FormMessage /></FormItem>
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
          {isUploading ? "Uploading..." : "Add Achievement"}
        </Button>
      </form>
    </Form>
  );
}