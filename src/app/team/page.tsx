// src/app/team/page.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { Linkedin } from "lucide-react"; // 👈 CHANGE THIS LINE
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  aiHint: string;
  LinkedIn?: string;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const q = query(collection(db, "team"), orderBy("id", "asc"));
        const querySnapshot = await getDocs(q);
        
        const members = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TeamMember));
        setTeamMembers(members);
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl text-primary">Meet the Team</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          The brilliant minds behind SJECAero's success.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex flex-col items-center space-y-4 p-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))
        ) : (
          teamMembers.map((member) => (
            <Card key={member.id} className="text-center bg-card border-primary/20 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:border-primary flex flex-col">
              <CardHeader className="pb-2">
                <Avatar className="w-24 h-24 mx-auto mb-4 border-2 border-primary/50">
                  <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint={member.aiHint} className="object-cover" />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-xl font-headline">{member.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center flex-grow pt-2">
                <p className="text-primary">{member.role}</p>
                {member.LinkedIn && (
                  <div className="mt-4">
                    <Button asChild variant="ghost" size="icon">
                      <Link href={member.LinkedIn} target="_blank" rel="noopener noreferrer" aria-label={`${member.name}'s LinkedIn Profile`}>
                        {/* 👇 CHANGE THIS LINE */}
                        <Linkedin className="h-6 w-6 text-foreground/70 hover:text-primary" />
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}