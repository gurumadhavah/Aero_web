import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Instagram, Linkedin, Mail, MapPin, Rocket, Target, Users } from "lucide-react";

export default function Home() {
  const featuredProjects = [
    {
      title: "Autonomous Surveillance Drone",
      description: "A cutting-edge drone with AI-powered object detection and tracking for aerial surveillance.",
      image: "https://placehold.co/600x400.png",
      aiHint: "surveillance drone"
    },
    {
      title: "VTOL RC Plane",
      description: "A hybrid aircraft combining the flight characteristics of a plane with vertical takeoff and landing.",
      image: "https://placehold.co/600x400.png",
      aiHint: "VTOL plane"
    },
    {
      title: "Aerodynamics Simulation Suite",
      description: "Development of a software suite for simulating and analyzing aerodynamic forces on custom aircraft designs.",
      image: "https://placehold.co/600x400.png",
      aiHint: "aerodynamics simulation"
    },
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] overflow-x-hidden">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-primary/10 to-background">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  Welcome to SJECAero
                </h1>
                <p className="max-w-[600px] text-foreground/80 md:text-xl">
                  The official hub for the SJEC AERO Club. We design, build, and fly the future of aerospace technology.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/projects">
                    Explore Projects
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
                  <Link href="/recruitment">
                    Join The Club
                  </Link>
                </Button>
              </div>
            </div>
            <Image
              src="https://placehold.co/600x400.png"
              width="600"
              height="400"
              alt="Hero RC Plane"
              data-ai-hint="rc plane"
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last animate-fade-in-up"
              style={{ animationDelay: '0.6s' }}
            />
          </div>
        </div>
      </section>

      <section id="about" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center animate-fade-in-up">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">About SJECAero</h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                SJECAero is more than just a club; it's a community of innovators, engineers, and aviation enthusiasts at SJEC dedicated to pushing the boundaries of aeronautics. We provide a platform for students to gain hands-on experience and turn theoretical knowledge into practical reality.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-2 mt-12">
            <div className="grid gap-1 text-center p-6 rounded-lg bg-card shadow-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Rocket className="h-12 w-12 mx-auto text-primary"/>
                <h3 className="text-lg font-bold font-headline">Our Mission</h3>
                <p className="text-sm text-foreground/80">To foster a culture of innovation and practical learning in aerospace engineering, empowering students to develop skills for the future.</p>
            </div>
            <div className="grid gap-1 text-center p-6 rounded-lg bg-card shadow-md animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                <Target className="h-12 w-12 mx-auto text-primary"/>
                <h3 className="text-lg font-bold font-headline">Our Vision</h3>
                <p className="text-sm text-foreground/80">To be a leading collegiate club in aerospace technology, recognized for our groundbreaking projects and contribution to the field.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="featured" className="w-full py-12 md:py-24 lg:py-32 bg-primary/5">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center animate-fade-in-up">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Featured Projects</h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Check out some of our latest and most exciting work.
              </p>
            </div>
          </div>
          <div className="mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            {featuredProjects.map((project, index) => (
              <Card key={project.title} className="overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl animate-fade-in-up" style={{ animationDelay: `${(index + 1) * 0.2}s` }}>
                <CardHeader className="p-0">
                  <Image
                    src={project.image}
                    width="600"
                    height="400"
                    alt={project.title}
                    data-ai-hint={project.aiHint}
                    className="aspect-video object-cover"
                  />
                </CardHeader>
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold font-headline">{project.title}</h3>
                  <p className="text-sm text-foreground/80 mt-2">{project.description}</p>
                  <Button variant="link" asChild className="p-0 h-auto mt-4 text-primary font-bold">
                    <Link href="/projects">
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center animate-fade-in-up">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-5xl">Get In Touch</h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Have questions or want to collaborate? Reach out to us.
              </p>
            </div>
          </div>
          <div className="mx-auto mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="flex flex-col items-center p-6 text-center shadow-md animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Mail className="h-10 w-10 text-primary mb-4"/>
              <h3 className="font-headline text-lg font-semibold">Email</h3>
              <p className="text-muted-foreground">sjec.aero@example.com</p>
            </Card>
            <Card className="flex flex-col items-center p-6 text-center shadow-md animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <MapPin className="h-10 w-10 text-primary mb-4"/>
              <h3 className="font-headline text-lg font-semibold">Location</h3>
              <Link href="https://maps.app.goo.gl/mdzLGFHTdY29koda6" target="_blank" rel="noopener noreferrer" className="text-muted-foreground underline">
                SJEC, Mangalore
              </Link>
            </Card>
            <Card className="flex flex-col items-center p-6 text-center shadow-md animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <Linkedin className="h-10 w-10 text-primary mb-4"/>
              <h3 className="font-headline text-lg font-semibold">LinkedIn</h3>
              <p className="text-muted-foreground">@sjec-aero-club</p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
