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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
  sortId: z.coerce.number().min(1, "Sort ID is required."),
  title: z.string().min(3, "Title is required."),
  mediaType: z.enum(['image', 'video'], { required_error: "Media type is required." }),
  description: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal('')),
  imageFile: z.custom<File>().refine(file => file instanceof File, { message: "An image file for the thumbnail is required." }),
}).refine(data => {
    // If media type is video, a video URL is required
    return data.mediaType !== 'video' || (!!data.videoUrl);
}, {
    message: "A YouTube/Vimeo URL is required for video types.",
    path: ["videoUrl"],
});

export function AddGalleryItemForm({ onItemAdded }: { onItemAdded?: () => void }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sortId: 100,
      title: "",
      mediaType: "image",
      description: "",
      videoUrl: "",
      imageFile: undefined,
    },
  });

  const mediaType = form.watch("mediaType");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !values.imageFile) return;
    setIsUploading(true);
    try {
      // Always upload the image file (it serves as thumbnail for videos)
      const storageRef = ref(storage, `gallery/${Date.now()}_${values.imageFile.name}`);
      const uploadTask = await uploadBytes(storageRef, values.imageFile);
      const downloadURL = await getDownloadURL(uploadTask.ref);
      console.log("Generated Image URL during upload:", downloadURL);
      await addDoc(collection(db, "gallery"), {
        sortId: values.sortId,
        title: values.title,
        mediaType: values.mediaType,
        description: values.description,
        imageUrl: downloadURL, // This is the image or the thumbnail
        videoUrl: values.mediaType === 'video' ? values.videoUrl : '',
        createdAt: serverTimestamp(),
      });

      toast({ title: "Success!", description: "Gallery item has been added." });
      form.reset();
      if (onItemAdded) onItemAdded();
    } catch (error) {
      console.error("Error adding gallery item: ", error);
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="sortId" render={({ field }) => (
          <FormItem><FormLabel>Sort ID</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="V-TOL Flight Test" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="mediaType" render={({ field }) => (
          <FormItem><FormLabel>Media Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />
        
        {mediaType === 'video' && (
          <FormField control={form.control} name="videoUrl" render={({ field }) => (
            <FormItem><FormLabel>YouTube/Vimeo URL</FormLabel><FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl><FormMessage /></FormItem>
          )} />
        )}
        
        <FormField control={form.control} name="imageFile" render={({ field }) => (
          <FormItem>
            <FormLabel>{mediaType === 'video' ? 'Thumbnail Image' : 'Image File'}</FormLabel>
            <FormControl>
                <Input type="file" accept="image/png, image/jpeg, image/webp"
                onChange={(event) => field.onChange(event.target.files?.[0])}/>
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea placeholder="A short caption..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />

        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Add Gallery Item"}
        </Button>
      </form>
    </Form>
  );
}