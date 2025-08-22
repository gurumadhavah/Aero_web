"use client";

import * as React from "react";
import Link from "next/link";
import { LinkedinIcon } from "lucide-react"; // Corrected icon import
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
  status: 'core' | 'member' | 'alumni'; // Added status field
}

// --- Reusable Card Components ---

// Existing card for Core Members
const CoreMemberCard = ({ member }: { member: TeamMember }) => (
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
              <LinkedinIcon className="h-6 w-6 text-foreground/70 hover:text-primary" />
            </Link>
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

// New horizontal card for Members and Alumni
const MemberCard = ({ member }: { member: TeamMember }) => (
    <div key={member.id} className="flex items-center gap-4 p-3 bg-card border border-border rounded-lg">
        <Avatar className="w-12 h-12 border-2 border-primary/30">
            <AvatarImage src={member.avatarUrl} alt={member.name} className="object-cover" />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-foreground/90">{member.name}</span>
    </div>
);


export default function TeamPage() {
  const [coreMembers, setCoreMembers] = React.useState<TeamMember[]>([]);
  const [currentMembers, setCurrentMembers] = React.useState<TeamMember[]>([]);
  const [alumniMembers, setAlumniMembers] = React.useState<TeamMember[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const q = query(collection(db, "team"), orderBy("id", "asc"));
        const querySnapshot = await getDocs(q);
        
        const allMembers = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as TeamMember))
          // --- THIS IS THE FIX ---
          // It ensures we only try to render members that have a valid avatarUrl.
          .filter(member => member.avatarUrl && typeof member.avatarUrl === 'string');

        // Filter members into their respective groups
        setCoreMembers(allMembers.filter(m => m.status === 'core'));
        setCurrentMembers(allMembers.filter(m => m.status === 'member'));
        setAlumniMembers(allMembers.filter(m => m.status === 'alumni'));

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
          The brilliant minds behind SJEC Aero's success.
        </p>
      </div>

      {/* Core Team Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold font-headline tracking-tighter text-center mb-8">Core Committee</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex flex-col items-center space-y-4 p-4"><Skeleton className="h-24 w-24 rounded-full" /><div className="space-y-2"><Skeleton className="h-6 w-40" /><Skeleton className="h-4 w-28" /></div></div>
                ))
            ) : (
                coreMembers.map((member) => <CoreMemberCard key={member.id} member={member} />)
            )}
        </div>
      </section>

      {/* Current Members Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold font-headline tracking-tighter text-center mb-8">Our Members</h2>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading ? (
                Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-3"><Skeleton className="h-12 w-12 rounded-full" /><Skeleton className="h-4 w-24" /></div>
                ))
            ) : (
                currentMembers.map((member) => <MemberCard key={member.id} member={member} />)
            )}
        </div>
      </section>

      {/* Alumni Section */}
      <section>
        <h2 className="text-3xl font-bold font-headline tracking-tighter text-center mb-8">Our Alumni</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
           {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-3"><Skeleton className="h-12 w-12 rounded-full" /><Skeleton className="h-4 w-24" /></div>
                ))
            ) : (
                alumniMembers.map((member) => <MemberCard key={member.id} member={member} />)
            )}
        </div>
      </section>
    </div>
  );
}