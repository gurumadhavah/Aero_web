"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image";

interface Project {
  title: string;
  category: string;
  description: string;
  fullDescription: string;
  imageUrl: string;
  aiHint: string;
}

const projects: Project[] = [
  {
    title: "Project V-TOL",
    category: "RC Aircraft",
    description: "A hybrid aircraft with vertical takeoff and landing capabilities.",
    fullDescription: "Project V-TOL (Vertical Take-Off and Landing) is an innovative aircraft that combines the flight efficiency of a fixed-wing plane with the versatility of a multicopter. This allows it to operate in confined spaces without needing a runway, making it ideal for a variety of applications like surveillance, package delivery, and search and rescue missions. The team has engineered custom flight control algorithms to manage the complex transition between vertical and horizontal flight modes.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "VTOL plane",
  },
  {
    title: "Reconnaissance Drone",
    category: "UAV",
    description: "An autonomous drone for surveillance and data collection.",
    fullDescription: "The Reconnaissance Drone is designed for high-endurance autonomous missions. Equipped with a high-resolution camera and real-time data transmission, it can be used for aerial mapping, agricultural monitoring, and infrastructure inspection. Its advanced AI-powered object detection system can identify and track targets, providing valuable intelligence for various scenarios.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "surveillance drone"
  },
  {
    title: "Glider 'Pegasus'",
    category: "Glider",
    description: "A lightweight, high-endurance glider built for soaring.",
    fullDescription: "Pegasus is an unpowered glider designed for maximum flight time by leveraging thermal updrafts. Its aerodynamic design, featuring a high-aspect-ratio wing, minimizes drag and maximizes lift. The project focuses on understanding and applying principles of aerodynamics and materials science to create an efficient and elegant flying machine.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "glider plane"
  },
    {
    title: "Agri-copter",
    category: "Drone",
    description: "A custom drone for agricultural applications like crop spraying.",
    fullDescription: "The Agri-copter is a specialized quadcopter built to assist in modern farming. It features a payload system for carrying and dispersing pesticides or fertilizers with precision, reducing waste and environmental impact. The drone can be programmed to follow specific flight paths over fields, ensuring even coverage and improving crop yields. This project integrates mechanical design, electronics, and software to create a practical solution for agriculture.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "agricultural drone"
  },
];


export default function ProjectsPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl text-primary">Our Projects</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          A showcase of the innovative projects designed and built by SJECAero members.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, index) => (
          <Dialog key={index}>
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
              <DialogHeader>
                 <Image
                    src={project.imageUrl}
                    alt={project.title}
                    width={800}
                    height={450}
                    className="aspect-video object-cover rounded-md mb-4"
                    data-ai-hint={project.aiHint}
                  />
                <DialogTitle className="text-3xl font-headline text-primary">{project.title}</DialogTitle>
                <DialogDescription as="div" className="text-base text-foreground/90">
                  <p className="mt-4">{project.fullDescription}</p>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
