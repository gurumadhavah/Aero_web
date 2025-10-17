"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import emailjs from "emailjs-com";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where, doc, onSnapshot } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getApplicationReceivedBody } from "@/lib/emailTemplates";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton for loading state

const formSchema = z.object({
  fullName: z.string().min(1, "Full name is required."),
  email: z.string().email("Please enter a valid email address."),
  usn: z.string().min(10, "USN must be at least 10 characters.").max(10),
  yearOfStudy: z.string().min(1, "Year of study is required."),
  branch: z.string().min(1, "Branch is required."),
  reason: z.string().min(20, "Please provide a reason of at least 20 characters."),
});

export default function RecruitmentPage() {
  const { toast } = useToast();
  
  // --- NEW: State for recruitment status and loading ---
  const [isRecruitmentOpen, setIsRecruitmentOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // EmailJS Credentials
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  const genericTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_GENERIC!;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;
  
  // --- NEW: useEffect to fetch recruitment status ---
  React.useEffect(() => {
    const settingsDocRef = doc(db, "settings", "recruitment");
    const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
      if (doc.exists() && doc.data().active === true) {
        setIsRecruitmentOpen(true);
      } else {
        setIsRecruitmentOpen(false);
      }
      setLoading(false);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { fullName: "", email: "", usn: "", yearOfStudy: "", branch: "", reason: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Double-check if recruitment is still open before submitting
    if (!isRecruitmentOpen) {
        toast({ title: "Recruitment Closed", description: "Sorry, we are no longer accepting applications at this time.", variant: "destructive" });
        return;
    }
      
    try {
      const q = query(collection(db, "recruitment"), where("email", "==", values.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast({ title: "Already Submitted", description: "You have already submitted an application with this email address.", variant: "destructive" });
        return;
      }

      await addDoc(collection(db, "recruitment"), { ...values, submittedAt: serverTimestamp(), status: 'submitted' });

      const templateParams = {
        subject: "We've Received Your Application | SJEC Aero",
        html_body: getApplicationReceivedBody(values.fullName),
        to_email: values.email,
      };

      await emailjs.send(serviceId, genericTemplateId, templateParams, publicKey);

      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We've sent a confirmation to your email.",
      });
      form.reset();
    } catch (error: any) {
      console.error("Error submitting application: ", error);
      toast({
        title: "Submission Error",
        description: `Could not submit your application. ${error.text || ""}`,
        variant: "destructive",
      });
    }
  }

  // --- NEW: Loading State UI ---
  if (loading) {
    return (
      <div className="container py-12 px-4 md:px-6">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full mt-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // --- NEW: Conditional Rendering Logic ---
  return (
    <div className="container py-12 px-4 md:px-6">
      {isRecruitmentOpen ? (
        // SHOW THE FORM IF RECRUITMENT IS OPEN
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Join Our Team</CardTitle>
            <CardDescription>
              Passionate about aviation and engineering? Fill out the form below to apply.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="name@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <FormField control={form.control} name="usn" render={({ field }) => (
                    <FormItem>
                      <FormLabel>USN</FormLabel>
                      <FormControl><Input placeholder="4SO21CS001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="yearOfStudy" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year of Study</FormLabel>
                      <FormControl><Input placeholder="e.g., 2nd Year" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="branch" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl><Input placeholder="e.g., CSE" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="reason" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why do you want to join SJEC Aero?</FormLabel>
                    <FormControl><Textarea placeholder="Tell us about your passion for aerospace, relevant skills, or what you hope to learn..." className="min-h-[120px]" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full" size="lg">Submit Application</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        // SHOW THIS MESSAGE IF RECRUITMENT IS CLOSED
        <Card className="max-w-3xl mx-auto text-center">
            <CardHeader>
                <CardTitle>Recruitment is Currently Closed</CardTitle>
                <CardDescription>
                    We are not accepting new applications at this time. Please check back later or follow our social media for announcements about our next recruitment drive.
                </CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}