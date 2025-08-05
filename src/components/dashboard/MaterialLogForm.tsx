// src/components/dashboard/MaterialLogForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  itemName: z.string().min(1, { message: "Item name is required." }),
  quantity: z.coerce.number().min(1, { message: "Quantity must be at least 1." }),
  condition: z.string().min(1, { message: "Condition is required." }),
  notes: z.string().optional(),
});

export function MaterialLogForm() {
  const { toast } = useToast();
  const { user, userProfile } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      quantity: 1,
      condition: "Returned - Good",
      notes: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userProfile) {
      toast({ title: "Error", description: "You must be logged in to submit.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(db, "materialLogs"), {
        ...values,
        memberName: userProfile.fullName,
        memberUid: user.uid,
        timestamp: serverTimestamp(),
      });
      toast({
        title: "Log Submitted!",
        description: "Your material usage has been recorded.",
      });
      form.reset();
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({ title: "Submission Failed", description: "Could not submit your log.", variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="itemName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item/Material Name</FormLabel>
              <FormControl><Input placeholder="e.g., Propeller, Servo Motor" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity Used</FormLabel>
              <FormControl><Input type="number" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Final Condition</FormLabel>
              <FormControl><Input placeholder="e.g., Returned - Good, Damaged, Consumed" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl><Textarea placeholder="Any additional details..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit Log</Button>
      </form>
    </Form>
  );
}