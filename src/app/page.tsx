"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { BrainCircuit, Hammer, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { ScrollingTestimonials } from "@/components/ui/ScrollingTestimonials";

// --- Interfaces for Testimonials ---
interface FixedTestimonial {
  id: string;
  name: string;
  role: string;
  quote: string;
  avatarUrl: string;
}

// --- Centralized Environment Variables ---
const envConfig = {
    backgroundImageUrl: process.env.NEXT_PUBLIC_BACKGROUND_IMAGE_URL,
    // Using the dynamic image you provided for this section

    aboutUsImageUrl: process.env.NEXT_PUBLIC_REAL_LOGO_URL,
};

export default function Home() {
  const [fixedTestimonials, setFixedTestimonials] = React.useState<FixedTestimonial[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchFixedTestimonials = async () => {
      setLoading(true);
      try {
        const q = query(
            collection(db, "testimonials"),
            where("isFixed", "==", true),
            orderBy("createdAt")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as FixedTestimonial))
          .filter(item => item.avatarUrl && typeof item.avatarUrl === 'string');

        setFixedTestimonials(data);
      } catch (error) {
        console.error("Error fetching fixed testimonials:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFixedTestimonials();
  }, []);

  const corePillars = [
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: "Innovation",
      description: "Pushing the boundaries of aerial technology with cutting-edge research and development."
    },
    {
      icon: <Hammer className="h-10 w-10 text-primary" />,
      title: "Hands-On Experience",
      description: "Go from concept to reality. Design, build, and test your own RC aircraft and drones."
    },
    {
      icon: <Award className="h-10 w-10 text-primary" />,
      title: "Competitions",
      description: "Representing SJEC and showcasing skills at prestigious national-level aeromodelling competitions."
    }
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] overflow-x-hidden">
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center text-center">
        {envConfig.backgroundImageUrl && (
            <Image
                src={envConfig.backgroundImageUrl}
                alt="Hero background"
                layout="fill"
                objectFit="cover"
                className="absolute inset-0 z-0 opacity-80"
                priority
            />
        )}
        <div className="relative z-10 container px-4 md:px-6 animate-fade-in-up">
          <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none text-primary">
            SJEC Aero
          </h1>
          <p className="max-w-[700px] mx-auto text-foreground/80 md:text-xl my-6">
            Designing, building, and flying the future of aerospace technology.
          </p>
          <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/projects">Explore Our Fleet</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* === THIS IS THE UPDATED "ABOUT" SECTION === */}
      <section id="about" className="w-full py-12 md:py-20 bg-background animate-fade-in-up">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl text-primary">Where Imagination Takes Flight</h2>
              <p className="mt-4 text-foreground/80 text-lg leading-relaxed">
                We are more than a club; we are a launchpad. Here at SJEC Aero, engineering transcends the classroom, transforming into a tangible symphony of aerodynamics, electronics, and sheer passion. We are a vibrant community of innovators, builders, and dreamers who believe that the sky is not the limit, but the beginning. 
              </p>
              <p className="mt-4 text-foreground/80">
                In our workspace, raw concepts and lines of code are meticulously crafted into powerful, custom-built aircraft, each one a testament to our relentless pursuit of flight.
              </p>
            </div>
            <div className="animate-fade-in-up flex flex-col items-center" style={{ animationDelay: '0.4s' }}>
              {envConfig.aboutUsImageUrl && (
                <Image
                    src={envConfig.aboutUsImageUrl}
                    width={600}
                    height={400}
                    alt="A custom-built RC aircraft soaring through the sky"
                    className="rounded-xl shadow-2xl object-cover"
                />
              )}
              <p className="mt-6 text-center font-headline text-2xl italic text-primary">
                &quot;The lower you fall, the higher you fly&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="experience" className="w-full py-12 md:py-20 bg-secondary/50 ">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center animate-fade-in-up">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl text-primary">The Aero Experience</h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed">
                From blueprint to blue skies, here's what our members are passionate about.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12 animate-fade-in-up">
            {corePillars.map((item, index) => (
              <Card key={item.title} className="text-center p-6 bg-card border-primary/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary animate-fade-in-up" style={{ animationDelay: `${(index + 1) * 0.2}s` }}>
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold font-headline">{item.title}</h3>
                <p className="text-sm text-foreground/80 mt-2">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="w-full py-12 md:py-20">
        <div className="container px-4 md:px-6 animate-fade-in-up">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl text-primary">Words from Our Community</h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed">
                Hear from the people who have been part of our journey.
              </p>
            </div>
          </div>
          
          <div className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-1 lg:grid-cols-2 mt-12">
            {fixedTestimonials.map((testimonial, index) => (
              <Card key={testimonial.id} className="bg-card border-primary/20 flex flex-col transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary animate-fade-in-up" style={{ animationDelay: `${(index + 1) * 0.2}s` }}>
                <CardContent className="p-6 text-center flex-grow">
                    <p className="text-foreground/80 italic">&quot;{testimonial.quote}&quot;</p>
                </CardContent>
                <CardHeader className="pt-0 flex flex-col items-center">
                  <Avatar className="w-16 h-16 mb-4 border-2 border-primary/50">
                    <AvatarImage src={testimonial.avatarUrl} alt={testimonial.name} className="object-cover" />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-lg font-headline">{testimonial.name}</CardTitle>
                  <p className="text-sm text-primary">{testimonial.role}</p>
                </CardHeader>
              </Card>
            ))}
          </div>
          <ScrollingTestimonials />
        </div>
      </section>

      <section id="contact" className="w-full py-12 md:py-20 bg-secondary/50">
       <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 animate-fade-in-up">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold font-headline tracking-tighter md:text-4xl text-primary">Ready to Take Flight?</h2>
            <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Reach out if you have questions. We'd love to hear from you.
            </p>
          </div>
          <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}