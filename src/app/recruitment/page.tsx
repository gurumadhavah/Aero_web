"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).refine(email => email.endsWith("@sjec.ac.in") || email.endsWith("@gmail.com"), {
    message: "Email must be a valid @sjec.ac.in or @gmail.com address.",
  }),
  yearOfStudy: z.string().min(1, { message: "Year of study is required." }),
  branch: z.string().min(1, { message: "Branch is required." }),
  reason: z.string().min(20, { message: "Please elaborate a bit more (min 20 characters)." }),
});

export default function RecruitmentPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isRecruitmentActive, setIsRecruitmentActive] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      yearOfStudy: "",
      branch: "",
      reason: "",
    },
  });

  React.useEffect(() => {
    const fetchRecruitmentStatus = async () => {
      try {
        const docRef = doc(db, "settings", "recruitment");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().active === true) {
          setIsRecruitmentActive(true);
        } else {
          setIsRecruitmentActive(false);
        }
      } catch (error) {
        console.error("Error fetching recruitment status:", error);
        setIsRecruitmentActive(false);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecruitmentStatus();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
        await addDoc(collection(db, "recruitment"), {
            ...values,
            submittedAt: serverTimestamp(),
        });
        toast({
          title: "Application Submitted!",
          description: "Thank you for your interest. We will get back to you soon.",
        });
        form.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        toast({
          title: "Submission Failed",
          description: "Could not submit your application. Please try again.",
          variant: "destructive",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="container py-12 text-center">Loading...</div>;
  }

  if (!isRecruitmentActive) {
    return (
      <div className="container py-12 px-4 md:px-6">
        <Card className="mx-auto max-w-2xl bg-card border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline text-primary">Recruitment Closed</CardTitle>
            <CardDescription>
              Our recruitment drive is currently closed. Please check back later or follow our social media for announcements.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-12 px-4 md:px-6">
      <Card className="mx-auto max-w-2xl bg-card border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-primary">Join SJEC Aero</CardTitle>
          <CardDescription>
            Ready to build the future of flight? Fill out the form below to apply.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="yearOfStudy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year of Study</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 2nd Year" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="branch"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branch</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Computer Science And Engineering" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why do you want to join SJEC Aero?</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us about your passion for aerospace, relevant skills, or what you hope to learn." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting} className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}