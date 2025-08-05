// src/app/(auth)/register/page.tsx
"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  fullName: z.string().min(1, { message: "Full name is required." }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).refine(email => email.endsWith("@sjec.ac.in") || email.endsWith("@gmail.com"), {
    message: "Email must be a valid @sjec.ac.in or @gmail.com address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
})

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Step 1: Check if a user is ALREADY registered with this email
      const usersRef = collection(db, "users");
      const userQuery = query(usersRef, where("email", "==", values.email));
      const userSnapshot = await getDocs(userQuery);

      if (!userSnapshot.empty) {
        // A user document already exists for this email.
        toast({
          title: "Account Exists",
          description: "This email address has already been registered. Please log in instead.",
          variant: "destructive",
        });
        return; // Stop the process
      }

      // Step 2: If not registered, check if they are on the pre-approved members list.
      const membersRef = collection(db, "members");
      const memberQuery = query(membersRef, where("email", "==", values.email));
      const memberSnapshot = await getDocs(memberQuery);

      if (memberSnapshot.empty) {
        // Not an approved member, redirect them to the recruitment form.
        toast({
          title: "Not a Pre-approved Member",
          description: "This email is not on our members list. Please fill out the form to join our team.",
          variant: "destructive",
        });
        router.push("/recruitment");
        return; // Stop the process
      }

      // Step 3: If checks pass, proceed with creating the new user.
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Add their details to the 'users' collection.
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullName: values.fullName,
        email: values.email,
        role: "normal" // Assign a default role
      });

      toast({
        title: "Registration Successful!",
        description: "Welcome! You are now being redirected to the dashboard.",
      });
      router.push("/dashboard");

    } catch (error: any) {
      console.error("Error during registration:", error);
      toast({
        title: "An Error Occurred",
        description: "Could not complete registration. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Card className="mx-auto max-w-sm w-full bg-card border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Member Registration</CardTitle>
        <CardDescription>
          This registration is for existing, pre-approved members only.
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
                    <Input placeholder="John Doe" {...field} />
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
                    <Input placeholder="name@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              Create Account
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline text-primary">
            Login
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}