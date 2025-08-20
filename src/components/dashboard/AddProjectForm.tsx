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
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  title: z.string().min(1, { message: "Project title is required." }),
  description: z.string().min(1, { message: "Project description is required." }),
  status: z.enum(['ongoing', 'completed']),
  imageFile: z.custom<File>(val => val instanceof File, "An image file is required."),
});

export function AddProjectForm({ onProjectAdded }: { onProjectAdded: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "ongoing",
      imageFile: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setUploadProgress(0);

    try {
      // 1. Upload Image to Firebase Storage
      const imageRef = ref(storage, `project_images/${Date.now()}_${values.imageFile.name}`);
      const uploadTask = await uploadBytes(imageRef, values.imageFile);
      setUploadProgress(100);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      // 2. Add Project data to Firestore
      await addDoc(collection(db, "projects"), {
        title: values.title,
        description: values.description,
        status: values.status,
        imageUrl: downloadURL,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Project Added Successfully!",
        description: `${values.title} has been added.`,
      });
      form.reset();
      onProjectAdded(); // Callback to refresh the list
    } catch (error) {
      console.error("Error adding new project:", error);
      toast({ title: "Error", description: "Could not add the new project.", variant: "destructive" });
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input placeholder="Project Name" {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the project..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                    <SelectItem value="ongoing">Ongoing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )} />
            <FormField control={form.control} name="imageFile" render={({ field }) => (
                <FormItem>
                    <FormLabel>Project Image</FormLabel>
                    <FormControl>
                        <Input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(event) => field.onChange(event.target.files ? event.target.files[0] : undefined)}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
        {loading && <Progress value={uploadProgress} className="w-full" />}
        <Button type="submit" disabled={loading}>{loading ? "Adding Project..." : "Add Project"}</Button>
      </form>
    </Form>
  );
}