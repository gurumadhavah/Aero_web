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
  documentName: z.string().min(3, { message: "Document name must be at least 3 characters." }),
  description: z.string().optional(),
  file: z.custom<File>(val => val instanceof File, "A file is required."),
});

export function DocumentUploadForm() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      documentName: "",
      description: "",
      file: undefined, // THE FIX (Part 1): Add a default value for the file
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userProfile) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (!values.file) {
      toast({ title: "Error", description: "Please select a file to upload.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const storage = getStorage();
      const storageRef = ref(storage, `documents/${Date.now()}_${values.file.name}`);
      
      const uploadTask = await uploadBytes(storageRef, values.file);
      const downloadURL = await getDownloadURL(uploadTask.ref);
      setUploadProgress(100);

      await addDoc(collection(db, "documents"), {
        documentName: values.documentName,
        description: values.description,
        fileName: values.file.name,
        fileUrl: downloadURL,
        uploaderName: userProfile.fullName,
        uploaderUid: user.uid,
        createdAt: serverTimestamp(),
      });

      toast({ title: "Success!", description: "Document has been uploaded." });
      form.reset();
    } catch (error) {
      console.error("Error uploading document: ", error);
      toast({ title: "Upload Failed", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="documentName" render={({ field }) => (
          <FormItem>
            <FormLabel>Document Name</FormLabel>
            <FormControl><Input placeholder="e.g., Project Proposal, Budget Report" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Description (Optional)</FormLabel>
            <FormControl><Textarea placeholder="A brief description of the document's content." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        
        <FormField
            control={form.control}
            name="file"
            render={({ field }) => (
                <FormItem>
                <FormLabel>File</FormLabel>
                <FormControl>
                    <Input
                    type="file"
                    // THE FIX (Part 3): Remove the {...fileRef} prop
                    onChange={(event) => {
                        field.onChange(event.target.files ? event.target.files[0] : undefined);
                    }}
                    />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />

        {isUploading && <Progress value={uploadProgress} className="w-full" />}
        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Document"}
        </Button>
      </form>
    </Form>
  );
}