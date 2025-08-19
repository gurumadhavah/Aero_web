// src/app/contact/page.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail, MapPin, Linkedin, Instagram, Send, User, Type } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; // Added serverTimestamp
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  subject: z.string().min(1, { message: "Subject is required." }),
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
});


export default function ContactPage() {
  const { toast } = useToast();
  
  // --- Read environment variables ---
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const collegeName = process.env.NEXT_PUBLIC_COLLEGE_NAME;
  const collegeLocationText = process.env.NEXT_PUBLIC_COLLEGE_LOCATION_TEXT;
  const mapsUrl = process.env.NEXT_PUBLIC_MAPS_URL;
  const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL;
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

 async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
        // IMPORTANT FIX: Added submittedAt field to save the timestamp
        await addDoc(collection(db, "contacts"), {
            ...values,
            submittedAt: serverTimestamp(),
        });

        toast({
          title: "Message Sent!",
          description: "Thank you for reaching out. We will get back to you shortly.",
        });
        form.reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        toast({
            title: "Error",
            description: "Could not send your message. Please try again.",
            variant: "destructive",
        });
    }
}

  return (
    <div className="container py-12 px-4 md:px-6 animate-fade-in-up">
       <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl text-primary">Get In Touch</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          Have a question, a proposal, or just want to say hello? We'd love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-12 max-w-6xl mx-auto">
        
        {/* Contact Info Section */}
        <div className="md:col-span-2 space-y-8">
            <h2 className="text-2xl font-bold font-headline text-primary/90">Contact Information</h2>
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full"><Mail className="h-6 w-6 text-primary" /></div>
                    <div>
                        <h3 className="font-semibold text-lg">Email</h3>
                        <p className="text-foreground/80">General Inquiries</p>
                        <Link href={`mailto:${contactEmail}`} className="text-primary hover:underline break-all">
                            {contactEmail}
                        </Link>
                    </div>
                </div>
                 <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full"><MapPin className="h-6 w-6 text-primary" /></div>
                    <div>
                        <h3 className="font-semibold text-lg">Our Location</h3>
                        <p className="text-foreground/80">{collegeName}</p>
                        <Link href={mapsUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {collegeLocationText}
                        </Link>
                    </div>
                </div>
                <div className="flex items-start gap-4">
                     <div className="p-3 bg-primary/10 rounded-full"><Linkedin className="h-6 w-6 text-primary" /></div>
                    <div>
                        <h3 className="font-semibold text-lg">Social Media</h3>
                        <p className="text-foreground/80">Follow our journey</p>
                         <div className="flex space-x-4 mt-1">
                            <Link href={linkedinUrl || "#"} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-primary hover:text-primary/80 transition-colors">
                            <Linkedin className="h-7 w-7" />
                            </Link>
                            <Link href={instagramUrl || "#"} target="_blank" aria-label="Instagram" className="text-primary hover:text-primary/80 transition-colors">
                                <Instagram className="h-7 w-7" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Contact Form Section */}
        <div className="md:col-span-3">
             <Card className="bg-card border-primary/20 p-4 sm:p-6">
                <CardContent className="p-0">
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField control={form.control} name="fullName" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="John Doe" {...field} className="pl-10"/></div></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input type="email" placeholder="name@example.com" {...field} className="pl-10"/></div></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        </div>
                        <FormField control={form.control} name="subject" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <FormControl><div className="relative"><Type className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" /><Input placeholder="Reason for your message" {...field} className="pl-10"/></div></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="message" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Your Message</FormLabel>
                            <FormControl><Textarea placeholder="Tell us more..." className="min-h-[120px]" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit" className="w-full text-lg bg-primary hover:bg-primary/90 text-primary-foreground" size="lg">
                            Send Message <Send className="ml-2 h-5 w-5"/>
                        </Button>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}