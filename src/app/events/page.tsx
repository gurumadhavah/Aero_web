"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, where, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Event {
  id: string;
  title: string;
  date: Timestamp;
  location: string;
  description: string;
  imageUrl: string;
  registrationLink?: string;
}

export default function EventsPage() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const now = new Date();
        const q = query(
          collection(db, "events"),
          where("date", ">=", now),
          orderBy("date", "asc")
        );
        const querySnapshot = await getDocs(q);
        const eventsData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Event))
          // --- THIS IS THE FIX ---
          // It ensures we only try to render items that have a valid imageUrl.
          .filter(item => item.imageUrl && typeof item.imageUrl === 'string');
          
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl text-primary">Upcoming Events</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          Join us for workshops, competitions, and guest lectures.
        </p>
      </div>

      {loading ? (
        <div className="space-y-8">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      ) : events.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Content Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This page will showcase the club's events, rendered dynamically from our records. Check back soon for updates!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {events.map((event) => (
            <Card key={event.id} className="grid md:grid-cols-3 overflow-hidden bg-card border-primary/20">
              <div className="md:col-span-1">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline text-primary">{event.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(event.date.toDate(), "PPP")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <p className="text-foreground/80">{event.description}</p>
                  {event.registrationLink && (
                    <Button asChild>
                      <Link href={event.registrationLink} target="_blank" rel="noopener noreferrer">
                        Register Now
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}