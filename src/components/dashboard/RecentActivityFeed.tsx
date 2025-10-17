"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { Megaphone } from "lucide-react";

// --- NEW: Import Dialog components ---
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: {
    toDate: () => Date;
  };
}

export function RecentActivityFeed() {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);

  // --- NEW: State for managing the dialog ---
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = React.useState<Announcement | null>(null);

  React.useEffect(() => {
    const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Announcement));
      setAnnouncements(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- NEW: Function to open the dialog with the selected announcement ---
  const handleViewAnnouncement = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="space-y-2">
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            // --- MODIFIED: Made each item a clickable button ---
            <div 
              key={announcement.id} 
              className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
              onClick={() => handleViewAnnouncement(announcement)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleViewAnnouncement(announcement)}
            >
              <div className="flex-shrink-0 pt-1">
                <Megaphone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium leading-none">{announcement.title}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(announcement.createdAt.toDate(), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No recent announcements.</p>
        )}
      </div>

      {/* --- NEW: Dialog component to display the announcement content --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedAnnouncement?.title}</DialogTitle>
            <DialogDescription>
              Posted {selectedAnnouncement ? formatDistanceToNow(selectedAnnouncement.createdAt.toDate(), { addSuffix: true }) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 whitespace-pre-wrap">
            <p className="text-sm text-muted-foreground">
              {selectedAnnouncement?.content}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}