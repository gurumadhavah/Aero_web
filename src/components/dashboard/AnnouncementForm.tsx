"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs } from "firebase/firestore";
import emailjs from "emailjs-com";
import { getAnnouncementBody } from "@/lib/emailTemplates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Megaphone, Send } from "lucide-react";

const formSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters." }),
  content: z.string().min(10, { message: "Content must be at least 10 characters." }),
});

export function AnnouncementForm() {
  const { toast } = useToast();

  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  const genericTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_GENERIC!;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", content: "" },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // 1. Add announcement to Firestore
      await addDoc(collection(db, "announcements"), {
        ...values,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Posted!", description: "Your announcement has been posted successfully." });

      // 2. Fetch all users' emails
      const usersSnapshot = await getDocs(collection(db, "users"));
      const userEmails = usersSnapshot.docs.map(doc => doc.data().email).filter(Boolean);

      if (userEmails.length === 0) {
        toast({ title: "No members to notify.", description: "The announcement was posted, but there are no members with emails." });
        form.reset();
        return;
      }
      
      toast({ title: "Notifying Members...", description: `Sending emails to ${userEmails.length} members.` });

      // --- FIX: Use Promise.allSettled for more robust error handling ---
      const emailPromises = userEmails.map(email => {
        const templateParams = {
          subject: `SJECAero Announcement: ${values.title}`,
          html_body: getAnnouncementBody(values.title, values.content),
          to_email: email,
        };
        return emailjs.send(serviceId, genericTemplateId, templateParams, publicKey);
      });
      
      const results = await Promise.allSettled(emailPromises);

      // Check for any failed emails
      const failedEmails = results.filter(result => result.status === 'rejected');
      
      if (failedEmails.length > 0) {
        console.error("Some emails failed to send:", failedEmails);
        toast({
            title: "Partial Success",
            description: `${userEmails.length - failedEmails.length} of ${userEmails.length} emails were sent. Some notifications failed.`,
            variant: "destructive"
        });
      } else {
        toast({ title: "Success!", description: `Your announcement has been posted and all ${userEmails.length} members have been notified.` });
      }

      form.reset();

    } catch (error) {
      // This catch block will now only run for unexpected errors (e.g., Firestore fails)
      console.error("A critical error occurred: ", error);
      toast({
        title: "A Critical Error Occurred",
        description: "Could not post the announcement or fetch users. Please check the console.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Megaphone className="mr-2" /> Post a New Announcement</CardTitle>
        <CardDescription>This will be displayed on the member dashboard and sent via email to all registered members.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="e.g., Upcoming Workshop Details" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="content" render={({ field }) => (
              <FormItem>
                <FormLabel>Content</FormLabel>
                <FormControl><Textarea placeholder="Write the full details of your announcement here..." className="min-h-[150px]" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
               {isSubmitting ? "Posting & Notifying..." : <>Post and Notify Members <Send className="ml-2 h-4 w-4" /></>}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}