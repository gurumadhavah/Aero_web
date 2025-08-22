"use client";

import * as React from "react";
import Image from "next/image";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Award, Users, Maximize } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Achievement {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
  rank?: string;
  participants?: string[];
  sortId?: number; // Added for robust sorting
}

export default function AchievementsPage() {
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // This query fetches all achievements. Sorting is handled below.
    const q = query(collection(db, "achievements"));

    // Use onSnapshot for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let achievementsData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Achievement))
        // --- THIS IS THE FIX ---
        // It ensures we only try to render items that have a valid imageUrl.
        .filter(item => item.imageUrl && typeof item.imageUrl === 'string');

      // Client-side sorting to prevent errors from missing fields
      achievementsData.sort((a, b) => {
        const sortA = a.sortId ?? Infinity; // Treat achievements without a sortId as last
        const sortB = b.sortId ?? Infinity;
        return sortA - sortB;
      });
      
      setAchievements(achievementsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching achievements in real-time:", error);
      setLoading(false);
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">Our Achievements</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          Celebrating the milestones and successes of our talented members.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="flex flex-col">
              <Skeleton className="h-48 w-full" />
              <CardHeader><Skeleton className="h-4 w-1/2 mb-2" /><Skeleton className="h-6 w-3/4" /></CardHeader>
              <CardContent><Skeleton className="h-4 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      ) : achievements.length === 0 ? (
        <div className="text-center py-16">
            <h2 className="text-2xl font-semibold">No Achievements Yet</h2>
            <p className="text-foreground/80 mt-2">Check back soon to see our club's accomplishments!</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {achievements.map((achievement) => (
            <Dialog key={achievement.id}>
              <DialogTrigger asChild>
                <Card className="group overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl bg-card border-primary/20">
                  <div className="relative">
                    <Image
                      src={achievement.imageUrl}
                      alt={achievement.title}
                      width={600}
                      height={400}
                      className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                        <Maximize className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                  <CardHeader>
                    <p className="text-sm text-primary font-semibold">{achievement.date}</p>
                    <CardTitle className="text-xl font-headline mt-1 truncate">{achievement.title}</CardTitle>
                    {achievement.rank && (
                        <CardDescription className="flex items-center gap-2 pt-1 font-medium">
                            <Award className="h-5 w-5 text-primary/80" />
                            {achievement.rank}
                        </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </DialogTrigger>

              <DialogContent className="max-w-3xl bg-card border-primary/20">
                <Image
                  src={achievement.imageUrl}
                  alt={achievement.title}
                  width={800}
                  height={450}
                  className="w-full h-auto max-h-[450px] object-cover rounded-t-lg"
                />
                <DialogHeader className="p-6 text-left">
                  <DialogTitle className="text-3xl font-headline text-primary">{achievement.title}</DialogTitle>
                  <DialogDescription asChild>
                    <div className="text-base text-foreground/90 space-y-4 pt-4">
                      <p>{achievement.description}</p>
                      {achievement.participants && achievement.participants.length > 0 && (
                        <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2"><Users className="h-5 w-5"/> Participants</h4>
                            <div className="flex flex-wrap gap-2">
                                {achievement.participants.map(name => (
                                    <Badge key={name} variant="secondary">{name}</Badge>
                                ))}
                            </div>
                        </div>
                      )}
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