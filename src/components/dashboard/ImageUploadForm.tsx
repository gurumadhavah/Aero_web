"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().optional(),
  file: z.custom<File>(val => val instanceof File, "An image file is required."),
  sortId: z.coerce.number().optional(),
});

interface ImageUploadFormProps {
  storagePath: string;
  collectionName: string;
}

export function ImageUploadForm({ storagePath, collectionName }: ImageUploadFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      file: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !values.file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `${storagePath}/${Date.now()}_${values.file.name}`);
      
      const uploadTask = await uploadBytes(storageRef, values.file);
      const downloadURL = await getDownloadURL(uploadTask.ref);
      setUploadProgress(100);

      await addDoc(collection(db, collectionName), {
        title: values.title,
        description: values.description,
        imageUrl: downloadURL,
        mediaType: 'image',
        sortId: values.sortId || Date.now(),
        fileName: values.file.name,
        createdAt: serverTimestamp(),
        uploaderUid: user.uid,
      });

      toast({ title: "Success!", description: "Image has been uploaded." });
      form.reset();
    } catch (error) {
      console.error("Error uploading image: ", error);
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Image Title</FormLabel><FormControl><Input placeholder="e.g., Aero Design Competition 2025" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description (Optional)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="sortId" render={({ field }) => (
          <FormItem><FormLabel>Sort Order (Optional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="file" render={({ field }) => (
            <FormItem>
                <FormLabel>Image File</FormLabel>
                <FormControl>
                    <Input type="file" accept="image/png, image/jpeg, image/webp"
                    onChange={(event) => {
                        field.onChange(event.target.files ? event.target.files[0] : undefined);
                    }}/>
                </FormControl>
                <FormMessage />
            </FormItem>
        )} />

        {isUploading && <Progress value={uploadProgress} className="w-full" />}
        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Image"}
        </Button>
      </form>
    </Form>
  );
}