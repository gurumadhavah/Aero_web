"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { format } from "date-fns"; // <-- 2. Import format
import { useToast } from "@/hooks/use-toast";

// 3. Update the Event interface to use Timestamp
interface Event {
  id: string;
  name: string;
  date: Timestamp;
  location: string;
  description: string;
  imageUrl: string;
  registrationLink?: string;
}

export function ViewEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, "events"));
    const eventsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Event[];
    // Sort by date, most recent first
    eventsData.sort((a, b) => b.date.toMillis() - a.date.toMillis());
    setEvents(eventsData);
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteDoc(doc(db, "events", id));
        toast({ title: "Success", description: "Event deleted." });
        fetchEvents(); // Refresh the list
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not delete event.",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>{event.name}</TableCell>
              {/* --- THIS IS THE FIX --- */}
              <TableCell>{format(event.date.toDate(), "PPP")}</TableCell>
              <TableCell>{event.location}</TableCell>
              <TableCell>
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  width={100}
                  height={50}
                  className="rounded object-cover"
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(event.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}