"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  aiHint: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchProjects = async () => {
      try {
        // You can add an orderBy clause if you have a sortId field
        const q = query(collection(db, "projects"));
        const querySnapshot = await getDocs(q);
        const projectsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Project));
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl text-primary">Our Projects</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          A showcase of the innovative projects designed and built by SJECAero members.
        </p>
      </div>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 3 }).map((_, index) => (
             <Card key={index}>
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
             </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
         <Card>
          <CardHeader>
            <CardTitle>Content Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This page will showcase the club's projects, rendered dynamically from our records. Check back soon for updates!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Dialog key={project.id}>
              <DialogTrigger asChild>
                <Card className="bg-card border-primary/20 overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary">
                  <CardHeader className="p-0">
                    <Image
                      src={project.imageUrl}
                      alt={project.title}
                      width={600}
                      height={400}
                      className="aspect-video object-cover"
                      data-ai-hint={project.aiHint}
                    />
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-primary font-semibold">{project.category}</p>
                    <CardTitle className="text-xl font-headline mt-1">{project.title}</CardTitle>
                    <p className="text-muted-foreground mt-2 text-sm">{project.description}</p>
                  </CardContent>
                </Card>
              </DialogTrigger>
              <DialogContent className="max-w-3xl bg-card border-primary/20">
                <DialogHeader className="text-left">
                   <Image
                      src={project.imageUrl}
                      alt={project.title}
                      width={800}
                      height={450}
                      className="aspect-video object-cover rounded-md mb-4"
                      data-ai-hint={project.aiHint}
                    />
                  <DialogTitle className="text-3xl font-headline text-primary">{project.title}</DialogTitle>
                  <DialogDescription asChild>
                    <div className="text-base text-foreground/90 pt-4">
                        <p>{project.fullDescription}</p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}
    </div>
  );
}