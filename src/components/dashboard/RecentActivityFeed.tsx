"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: { seconds: number; };
}

export function RecentActivityFeed() {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // This query gets the 3 most recent announcements
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(3));

    // Use onSnapshot to listen for real-time updates
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
      setAnnouncements(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching real-time announcements:", error);
      setLoading(false);
    });

    // Cleanup the listener when the component is no longer on screen
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return <p className="text-sm text-muted-foreground">No recent activity.</p>;
  }

  return (
    <ul className="space-y-4">
      {announcements.map(item => (
        <li key={item.id} className="border-l-2 border-primary pl-3">
          <p className="font-semibold text-sm">{item.title}</p>
          <p className="text-xs text-muted-foreground">
            {item.createdAt ? format(new Date(item.createdAt.seconds * 1000), 'PPP') : ''}
          </p>
        </li>
      ))}
    </ul>
  );
}