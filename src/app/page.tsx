import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BrainCircuit, Hammer, Award } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const testimonials = [
    {
      name: "Founder Name 1",
      role: "Co-Founder & Former Captain",
      quote: "Starting SJECAero was about creating a space for passionate students to turn theory into reality. Seeing how the club has grown and the incredible projects it now undertakes is immensely proud.",
      avatarUrl: "/images/team/founder1.png",
    },
    {
      name: "Founder Name 2",
      role: "Co-Founder & Former Technical Head",
      quote: "We dreamed of a club that would push the boundaries of aeromodelling at SJEC. The dedication and innovation I see in the members today have surpassed all our initial expectations.",
      avatarUrl: "/images/team/founder2.png",
    },
    {
      name: "Faculty Coordinator Name",
      role: "Founding Faculty Coordinator",
      quote: "SJECAero provides an invaluable platform for practical learning and teamwork. It has consistently been a hub of creativity and technical excellence within the college.",
      avatarUrl: "/images/team/faculty.png",
    },
  ];

  const whyJoin = [
    {
      icon: <BrainCircuit className="h-10 w-10 text-primary" />,
      title: "Innovation",
      description: "Push the boundaries of aerial technology with cutting-edge research and development."
    },
    {
      icon: <Hammer className="h-10 w-10 text-primary" />,
      title: "Hands-On Experience",
      description: "Go from concept to reality. Design, build, and test your own RC aircraft and drones."
    },
    {
      icon: <Award className="h-10 w-10 text-primary" />,
      title: "Competitions",
      description: "Represent SJEC and showcase your skills at prestigious national-level aeromodelling competitions."
    }
  ];

  return (
    <div className="flex flex-col min-h-[100dvh] overflow-x-hidden">
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center text-center">
        <Image
          src="/images/back2.png"
          alt="Hero background"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0 opacity-80"
          data-ai-hint="dark dramatic airplane"
        />
        <div className="relative z-10 container px-4 md:px-6 animate-fade-in-up">
          <h1 className="font-headline text-5xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none text-primary">
            SJEC Aero
          </h1>
          <p className="max-w-[700px] mx-auto text-foreground/80 md:text-xl my-6">
            Designing, building, and flying the future of aerospace technology.
          </p>
          <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/projects">
                Explore Our Fleet
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
              <Link href="/recruitment">
                Join The Club
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* 👇 PADDING REDUCED ON THIS SECTION 👇 */}
      <section id="about" className="w-full py-12 md:py-20 bg-background">
        <div className="container px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl text-primary">About SJEC Aero</h2>
              <p className="mt-4 text-foreground/80 text-lg">
                SJEC AERO is an aeromodelling club of St. Joseph Engineering College, established with an aim to create innovation in the field of aviation with regard to Unmanned Aerial Vehicles (RC planes and drones). The tagline of the club is &quot;The lower you fall, the higher you fly&quot;, which is an epitome of how the club has taken shape over time.
              </p>
              <p className="mt-4 text-foreground/80">
                We take part in various Aeromodelling competitions across India. Apart from competitions, we conduct research in this field and develop products beneficial to the society. We also conduct workshops to those interested in aeromodelling.
              </p>
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <Image
                src="/images/reallogo.JPG"
                width="600"
                height="400"
                alt="About Us Image"
                data-ai-hint="students working drone"
                className="rounded-xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

       {/* 👇 PADDING REDUCED ON THIS SECTION 👇 */}
       <section id="why-join" className="w-full py-12 md:py-20 bg-secondary/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center animate-fade-in-up">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl text-primary">Why Join Us?</h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed">
                Become part of a team that's passionate about shaping the future of aviation.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3 mt-12">
            {whyJoin.map((item, index) => (
              <Card key={item.title} className="text-center p-6 bg-card border-primary/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary animate-fade-in-up" style={{ animationDelay: `${(index + 1) * 0.2}s` }}>
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold font-headline">{item.title}</h3>
                <p className="text-sm text-foreground/80 mt-2">{item.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 👇 PADDING REDUCED ON THIS SECTION 👇 */}
      <section id="testimonials" className="w-full py-12 md:py-20">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center animate-fade-in-up">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold font-headline tracking-tighter sm:text-4xl text-primary">Words from Our Founders</h2>
              <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed">
                Hear from the people who started it all.
              </p>
            </div>
          </div>
          <div className="mx-auto grid gap-8 sm:grid-cols-1 lg:grid-cols-3 mt-12">
            {testimonials.map((testimonial, index) => (
              <Card key={testimonial.name} className="bg-card border-primary/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary animate-fade-in-up" style={{ animationDelay: `${(index + 1) * 0.2}s` }}>
                <CardContent className="p-6 text-center">
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
        </div>
      </section>

      {/* 👇 PADDING REDUCED ON THIS SECTION 👇 */}
      <section id="contact" className="w-full py-12 md:py-20 bg-secondary/50">
        <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 animate-fade-in-up">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold font-headline tracking-tighter md:text-4xl text-primary">Ready to Take Flight?</h2>
            <p className="mx-auto max-w-[600px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Join our club to start your journey in aerospace, or reach out if you have questions. We'd love to hear from you.
            </p>
          </div>
          <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
             <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/recruitment">
                Apply Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
              <Link href="/contact">
                Contact Us
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}