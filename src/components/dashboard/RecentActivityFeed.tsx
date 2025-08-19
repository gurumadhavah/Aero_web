"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
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
    const fetchAnnouncements = async () => {
      try {
        // Query to get the 3 most recent announcements
        const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(3));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Announcement));
        setAnnouncements(data);
      } catch (error) {
        console.error("Error fetching announcements:", error);
        // This is often caused by a missing Firestore index.
        // Check the browser console for a URL to create the index.
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
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