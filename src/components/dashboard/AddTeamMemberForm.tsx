"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { collection, setDoc, doc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

const formSchema = z.object({
  name: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email(),
  role: z.string().min(1, { message: "Role is required." }),
  status: z.enum(['core', 'member', 'alumni']),
  id: z.coerce.number().min(1, { message: "A unique sort ID is required." }),
  avatarFile: z.custom<File>(val => val instanceof File, "An image file is required."),
  LinkedIn: z.string().url().optional().or(z.literal('')),
});

export function AddTeamMemberForm({ onMemberAdded }: { onMemberAdded: () => void }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      status: "member",
      id: 0,
      LinkedIn: "",
      avatarFile: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    setUploadProgress(0);

    try {
      const storage = getStorage();
      const avatarRef = ref(storage, `team_avatars/${Date.now()}_${values.avatarFile.name}`);
      const uploadTask = await uploadBytes(avatarRef, values.avatarFile);
      setUploadProgress(100);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      await setDoc(doc(db, "team", values.email), {
        name: values.name,
        email: values.email,
        role: values.role,
        status: values.status,
        id: values.id,
        avatarUrl: downloadURL,
        LinkedIn: values.LinkedIn,
        aiHint: `A photo of ${values.name}, who is a ${values.role}.`
      });

      await setDoc(doc(db, "members", values.email), {
        email: values.email,
        name: values.name,
        registered: false
      });

      toast({
        title: "Member Added Successfully!",
        description: `${values.name} has been added to the team and can now register.`,
      });
      form.reset();
      onMemberAdded();
    } catch (error) {
      console.error("Error adding new member:", error);
      toast({ title: "Error", description: "Could not add the new member.", variant: "destructive" });
    } finally {
      setLoading(false);
      setUploadProgress(0);
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
                <FormMessage />
                </FormItem>
            )} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="id" render={({ field }) => (
                <FormItem><FormLabel>Sort ID (Serial Number)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="avatarFile" render={({ field }) => (
                <FormItem>
                    <FormLabel>Member Photo</FormLabel>
                    <FormControl>
                        <Input
                            type="file"
                            accept="image/png, image/jpeg, image/webp"
                            onChange={(event) => {
                                field.onChange(event.target.files ? event.target.files[0] : undefined);
                            }}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )} />
        </div>
        <FormField control={form.control} name="LinkedIn" render={({ field }) => (
          <FormItem><FormLabel>LinkedIn URL (Optional)</FormLabel><FormControl><Input placeholder="https://linkedin.com/in/..." {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        {loading && <Progress value={uploadProgress} className="w-full" />}
        <Button type="submit" disabled={loading}>{loading ? "Adding..." : "Add New Team Member"}</Button>
      </form>
    </Form>
  );
}