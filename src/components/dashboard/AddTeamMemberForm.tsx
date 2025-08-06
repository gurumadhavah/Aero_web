// src/components/dashboard/AddTeamMemberForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, setDoc, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email(),
  role: z.string().min(1, { message: "Role is required." }),
  status: z.enum(['core', 'member', 'alumni']),
  id: z.coerce.number().min(1, { message: "A unique sort ID is required." }),
  avatarUrl: z.string().min(1, { message: "Image path is required." }),
  LinkedIn: z.string().url().optional().or(z.literal('')),
});

export function AddTeamMemberForm({ onMemberAdded }: { onMemberAdded: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      status: "member",
      id: 100, // Start with a high number to avoid conflicts
      avatarUrl: "/images/team/default.png",
      LinkedIn: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // 1. Add the full profile to the 'team' collection for public display
      await addDoc(collection(db, "team"), values);

      // 2. Add the email to the 'members' collection to pre-approve for registration
      await setDoc(doc(db, "members", values.email), { email: values.email });

      toast({
        title: "Member Added Successfully!",
        description: `${values.name} has been added to the team and can now register.`,
      });
      form.reset();
      onMemberAdded(); // This will trigger a refresh of the member list
    } catch (error) {
      console.error("Error adding new member:", error);
      toast({ title: "Error", description: "Could not add the new member.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="member@sjec.ac.in" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem><FormLabel>Role / Position</FormLabel><FormControl><Input placeholder="Team Member" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem><FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="core">Core Member</SelectItem>
                        <SelectItem value="member">Current Member</SelectItem>
                        <SelectItem value="alumni">Alumni</SelectItem>
                    </SelectContent>
                </Select>
            <FormMessage /></FormItem>
            )} />
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="id" render={({ field }) => (
            <FormItem><FormLabel>Sort ID (Serial Number)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="avatarUrl" render={({ field }) => (
            <FormItem><FormLabel>Photo Path</FormLabel><FormControl><Input placeholder="/images/team/john_doe.png" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
        </div>
        <FormField control={form.control} name="LinkedIn" render={({ field }) => (
            <FormItem><FormLabel>LinkedIn URL (Optional)</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add New Team Member"}</Button>
      </form>
    </Form>
  );
}