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
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { getApplicationReceivedBody } from "@/lib/emailTemplates";
import { Skeleton } from "@/components/ui/skeleton";
import { recruitmentFormSchema } from "@/lib/schemas"; // Import the new schema

// Define options for interests
const interestsItems = [
  { id: "avionics", label: "Avionics and propulsion" },
  { id: "aircraft_fab", label: "Aircraft fabrication" },
  { id: "drone_fab", label: "Drone fabrication" },
  { id: "cad", label: "CAD software" },
  { id: "piloting", label: "Piloting" },
  { id: "graphic", label: "Graphic designing" },
  { id: "photo_video", label: "Photo/Video shooting" },
  { id: "video_edit", label: "Video editing" },
  { id: "web_dev", label: "Web development" },
  { id: "other", label: "Other" },
] as const;

export default function RecruitmentPage() {
  const { toast } = useToast();
  const [isRecruitmentOpen, setIsRecruitmentOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  // EmailJS Credentials
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  const genericTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_GENERIC!;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;
  
  // Fetch recruitment status
  React.useEffect(() => {
    const settingsDocRef = doc(db, "settings", "recruitment");
    const unsubscribe = onSnapshot(settingsDocRef, (doc) => {
      setIsRecruitmentOpen(doc.exists() && doc.data().active === true);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  // Use the new schema
  const form = useForm<z.infer<typeof recruitmentFormSchema>>({
    resolver: zodResolver(recruitmentFormSchema),
    defaultValues: {
      fullName: "",
      yearOfStudy: undefined,
      yearOther: "",
      branch: undefined,
      branchOther: "",
      mobileNumber: "",
      email: "",
      isHostelite: undefined,
      interests: [],
      interestOther: "",
    },
  });

  async function onSubmit(values: z.infer<typeof recruitmentFormSchema>) {
    if (!isRecruitmentOpen) {
      toast({ title: "Recruitment Closed", description: "Sorry, applications are closed.", variant: "destructive" });
      return;
    }
      
    try {
      /* const q = query(collection(db, "recruitment"), where("email", "==", values.email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        toast({ title: "Already Submitted", description: "You have already submitted an application with this email.", variant: "destructive" });
        return;
      }    */

      // Prepare data for Firestore, including conditional 'other' fields
      const dataToSave = {
        ...values,
        yearOfStudy: values.yearOfStudy === 'Other' ? `Other: ${values.yearOther}` : values.yearOfStudy,
        branch: values.branch === 'OTHER' ? `Other: ${values.branchOther}` : values.branch,
        interests: values.interests.map(interest => 
            interest === 'Other' ? `Other: ${values.interestOther}` : interest
        ),
        submittedAt: serverTimestamp(),
        status: 'submitted',
      };
      // Remove the separate 'other' fields before saving
      delete (dataToSave as any).yearOther;
      delete (dataToSave as any).branchOther;
      delete (dataToSave as any).interestOther;

      await addDoc(collection(db, "recruitment"), dataToSave);

      // Send confirmation email
    /*  const templateParams = {
        subject: "We've Received Your Application | SJEC Aero",
        html_body: getApplicationReceivedBody(values.fullName),
        to_email: values.email,
      };
      await emailjs.send(serviceId, genericTemplateId, templateParams, publicKey);
*/
      toast({
        title: "Application Submitted!",
        description: "Thank you! Your application has been submitted.",
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

  // Watch form values to conditionally show "Other" input fields
  const watchYear = form.watch("yearOfStudy");
  const watchBranch = form.watch("branch");
  const watchInterests = form.watch("interests");

  if (loading) {
    return (
      <div className="container py-12 px-4 md:px-6">
        <Card className="max-w-3xl mx-auto"><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="container py-12 px-4 md:px-6">
      {isRecruitmentOpen ? (
        // --- RECRUITMENT OPEN ---
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">SJEC AERO RECRUITMENT FORM 2025-26</CardTitle>
            <CardDescription className="text-center pt-2">
              Hello, Flight Enthusiast! Welcome to the SJEC Aero Club Recruitment Drive 2025–26!<br />
              Here’s your opportunity to be part of a passionate community exploring the science and art of flight. From building and flying RC planes to learning aerodynamics, propulsion, and design — we push the limits of innovation and teamwork. If you’re curious, creative, and ready to take off into the world of aviation technology, register now!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* 1. Name */}
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem>
                    <FormLabel>1. Name</FormLabel>
                    <FormControl><Input placeholder="Enter your full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* 2. Year of study */}
                <FormField control={form.control} name="yearOfStudy" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>2. Year of study</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="1st year" /></FormControl><FormLabel className="font-normal">1st year</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="2nd year" /></FormControl><FormLabel className="font-normal">2nd year</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Other" /></FormControl><FormLabel className="font-normal">Other</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl>
                     {watchYear === "Other" && (
                       <FormField control={form.control} name="yearOther" render={({ field }) => (
                         <FormItem className="pl-6">
                           <FormControl><Input placeholder="Please specify your year" {...field} /></FormControl>
                           <FormMessage />
                         </FormItem>
                       )} />
                     )}
                    <FormMessage />
                  </FormItem>
                )} />

                {/* 3. Branch */}
                <FormField control={form.control} name="branch" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>3. Branch</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid grid-cols-2 gap-2">
                        {["AIML", "CIVIL", "CSBS", "CSDS", "CSE", "ECE", "EEE", "MECH", "OTHER"].map(branch => (
                          <FormItem key={branch} className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value={branch} /></FormControl>
                            <FormLabel className="font-normal">{branch}</FormLabel>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    {watchBranch === "OTHER" && (
                       <FormField control={form.control} name="branchOther" render={({ field }) => (
                         <FormItem className="pl-6">
                           <FormControl><Input placeholder="Please specify your branch" {...field} /></FormControl>
                           <FormMessage />
                         </FormItem>
                       )} />
                     )}
                    <FormMessage />
                  </FormItem>
                )} />

                {/* 4. Mobile Number */}
                <FormField control={form.control} name="mobileNumber" render={({ field }) => (
                  <FormItem>
                    <FormLabel>4. Mobile Number</FormLabel>
                    <FormControl><Input type="tel" placeholder="Enter 10-digit number" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* 5. E-mail ID */}
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>5. E-mail ID</FormLabel>
                    <FormControl><Input type="email" placeholder="Enter your email" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* 6. Are you hostelite? */}
                <FormField control={form.control} name="isHostelite" render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>6. Are you hostelite?</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="Yes" /></FormControl><FormLabel className="font-normal">Yes</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="No" /></FormControl><FormLabel className="font-normal">No</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                {/* 7. Fields you are good at or interested in */}
                <FormField control={form.control} name="interests" render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">7. Select the fields you are good at or interested in</FormLabel>
                      <FormDescription>Select all that apply.</FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {interestsItems.map((item) => (
                        <FormField key={item.id} control={form.control} name="interests" render={({ field }) => (
                          <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.label)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item.label])
                                    : field.onChange(field.value?.filter((value) => value !== item.label));
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item.label}</FormLabel>
                          </FormItem>
                        )} />
                      ))}
                    </div>
                     {watchInterests?.includes("Other") && (
                       <FormField control={form.control} name="interestOther" render={({ field }) => (
                         <FormItem className="pt-2">
                           <FormControl><Input placeholder="Please specify your other interest(s)" {...field} /></FormControl>
                           <FormMessage />
                         </FormItem>
                       )} />
                     )}
                    <FormMessage />
                  </FormItem>
                )} />

                <Button type="submit" className="w-full" size="lg" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Submitting..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        // --- RECRUITMENT CLOSED ---
        <Card className="max-w-3xl mx-auto text-center">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Recruitment is Currently Closed</CardTitle>
                <CardDescription className="pt-2">
                    Thank you for your interest in SJEC Aero! We are not accepting new applications at this time.
                    {/* <br />  <br />
                    <strong className="text-primary">Registrations will open on October 22, 2025, at 6:00 PM IST.</strong> */}
                    <br />  <br />
                    Please check back then, or follow our social media channels for updates on our next recruitment drive.
                </CardDescription>
            </CardHeader>
        </Card>
      )}
    </div>
  );
}