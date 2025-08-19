// src/app/(auth)/login/page.tsx
"use client"

import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "@/hooks/use-toast"

// --- Read environment variables with fallbacks ---
const allowedDomain = process.env.NEXT_PUBLIC_ALLOWED_EMAIL_DOMAIN || "@sjec.ac.in";
const loginRedirectUrl = process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL || "/dashboard";
const registerPageUrl = process.env.NEXT_PUBLIC_REGISTER_PAGE_URL || "/register";

// Schema now uses the environment variable for the domain check
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).refine(email => email.endsWith(allowedDomain) || email.endsWith("@gmail.com"), {
    message: `Email must be a valid ${allowedDomain} or @gmail.com address.`,
  }),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
})

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push(loginRedirectUrl);
    } catch (error) {
      console.error("Error signing in:", error);

      // --- Improved Error Handling ---
      let description = "An unknown error occurred. Please try again.";
      if (error instanceof FirebaseError) {
        switch (error.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
          case 'auth/wrong-password':
            description = "Invalid email or password. Please check your credentials and try again.";
            break;
          case 'auth/too-many-requests':
            description = "Access to this account has been temporarily disabled due to many failed login attempts. You can reset your password or try again later.";
            break;
          default:
            description = "An error occurred while signing in. Please try again later.";
            break;
        }
      }
      toast({ title: "Login Failed", description, variant: "destructive" });
    }
  }

  return (
    <Card className="mx-auto max-w-sm w-full bg-card border-primary/20">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">Member Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
            <Button type="submit" className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href={registerPageUrl} className="underline text-primary">
            Register
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}