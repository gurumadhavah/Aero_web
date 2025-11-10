"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "lucide-react";
import { format } from "date-fns"; // <-- Make sure this is imported
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Interface for your event data
interface Event {
  id: string;
  name: string;
  date: Timestamp;
  description: string;
  imageUrl: string;
  registrationLink?: string;
}

// Helper function
const getStartOfTodayTimestamp = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Timestamp.fromDate(today);
};

export default function EventsPage() {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchEvents = async () => {
      try {
        const startOfToday = getStartOfTodayTimestamp();
        const q = query(
          collection(db, "events"),
          where("date", ">=", startOfToday)
        );

        const querySnapshot = await getDocs(q);

        const eventsData = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
              description: data.description,
              imageUrl: data.imageUrl,
              date: data.date,
              registrationLink: data.registrationLink,
            } as Event;
          })
          .filter((item) => item.imageUrl && typeof item.imageUrl === "string")
          .sort((a, b) => {
            return a.date.toMillis() - b.date.toMillis();
          });

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
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl text-primary">
          Upcoming Events
        </h1>
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
            <CardTitle>No Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              There are no upcoming events scheduled at this time. Please check
              back soon for updates!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {events.map((event) => (
            <Card
              key={event.id}
              className="grid md:grid-cols-3 overflow-hidden bg-card border-primary/20"
            >
              <div className="md:col-span-1">
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline text-primary">
                    {event.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {/* --- THIS IS THE FIX --- */}
                      {/* Convert the Timestamp to a Date, then format it */}
                      <span>{format(event.date.toDate(), "PPP")}</span>
                    </div>
                  </div>
                  <p className="text-foreground/80">{event.description}</p>
                  {event.registrationLink && (
                    <Button asChild>
                      <Link
                        href={event.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
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