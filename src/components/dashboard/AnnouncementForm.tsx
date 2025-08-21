// src/components/dashboard/AnnouncementForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

// Schema is simplified, removing the boolean switches
const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
});

export function AnnouncementForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", content: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      await addDoc(collection(db, "announcements"), {
        title: values.title,
        content: values.content,
        type: "club-only",
        createdAt: serverTimestamp(),
      });

      // 2. Always call the Cloud Function to send the email
      const functions = getFunctions();
      const sendAnnouncementEmail = httpsCallable(functions, 'sendAnnouncementEmail');
      await sendAnnouncementEmail({ title: values.title, content: values.content });

      toast({ title: "Success!", description: "Your announcement has been posted and sent to all members." });
      form.reset();
    } catch (error: any) {
      console.error("Error posting announcement:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Club Announcement</CardTitle>
        <CardDescription>
          This will be posted in the members' portal and an email will be sent to all registered club members.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem><FormLabel>Content</FormLabel><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem>
            )} />
            
            {/* The Switch components for 'Global' and 'Send Email' have been removed */}
            
            <Button type="submit" disabled={loading}>{loading ? "Posting..." : "Post Announcement"}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}