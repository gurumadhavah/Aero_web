// src/components/dashboard/AnnouncementForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
  isGlobal: z.boolean().default(false),
  sendEmail: z.boolean().default(false),
});

export function AnnouncementForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", content: "", isGlobal: false, sendEmail: false },
  });

  const isClubOnly = !form.watch("isGlobal");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // 1. Add announcement to Firestore
      await addDoc(collection(db, "announcements"), {
        title: values.title,
        content: values.content,
        type: values.isGlobal ? "global" : "club-only",
        createdAt: serverTimestamp(),
      });

      // 2. If it's a club announcement and email is requested, call the Cloud Function
      if (!values.isGlobal && values.sendEmail) {
        const functions = getFunctions();
        const sendAnnouncementEmail = httpsCallable(functions, 'sendAnnouncementEmail');
        await sendAnnouncementEmail({ title: values.title, content: values.content });
      }

      toast({ title: "Success!", description: "Your announcement has been posted." });
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
        <CardTitle>Create Announcement</CardTitle>
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
            <FormField control={form.control} name="isGlobal" render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Global Announcement</FormLabel>
                  <FormDescription>If checked, this will be visible to the public on the homepage.</FormDescription>
                </div>
                <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              </FormItem>
            )} />
            {isClubOnly && (
              <FormField control={form.control} name="sendEmail" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Send Email Notification</FormLabel>
                    <FormDescription>Notify all registered club members via email.</FormDescription>
                  </div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            )}
            <Button type="submit" disabled={loading}>{loading ? "Posting..." : "Post Announcement"}</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
