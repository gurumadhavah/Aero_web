"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { Maximize, Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link"; // Link might not be used here, consider removing if not needed

interface GalleryItem {
  id: string;
  title: string;
  mediaType: 'image' | 'video';
  imageUrl: string; // Used for thumbnail always
  videoUrl?: string; // Contains the actual YouTube link
  description?: string;
}

// Helper function to extract YouTube Video ID from various URL formats
const getYouTubeVideoId = (url: string | undefined): string | null => {
  if (!url) return null;
  let videoId = null;
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regex);
  if (match && match[1]) {
    videoId = match[1];
  }
  return videoId;
};


export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = React.useState<GalleryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const q = query(collection(db, "gallery"), orderBy("sortId", "asc"));
        const querySnapshot = await getDocs(q);
        const itemsData = querySnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          } as GalleryItem))
          .filter(item => item.imageUrl && typeof item.imageUrl === 'string'); // Ensure thumbnail exists

        setGalleryItems(itemsData);
      } catch (error) {
        console.error("Error fetching gallery items:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">Gallery</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          A visual journey through our projects, events, and moments.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      ) : galleryItems.length === 0 ? (
         <Card><CardHeader><CardTitle>Content Coming Soon</CardTitle></CardHeader><CardContent><p>Check back soon for photos and videos!</p></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryItems.map((item) => {
             // Extract video ID here to ensure it's valid before rendering iframe
             const videoId = item.mediaType === 'video' ? getYouTubeVideoId(item.videoUrl) : null;

             return (
              <Dialog key={item.id}>
                <DialogTrigger asChild>
                  <div className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer">
                    <Image
                      src={item.imageUrl} // Always use imageUrl for the grid display
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Added sizes prop for optimization
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/80 transition-all duration-300 flex flex-col justify-end p-4">
                       {item.mediaType === 'video' && (
                          <Video className="h-8 w-8 text-white absolute top-4 left-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                       )}
                       <h3 className="font-headline text-lg text-white font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 line-clamp-2">{item.title}</h3>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl w-full bg-card border-primary/20 p-0">
                  {/* Conditionally render video iframe or image */}
                  {item.mediaType === 'video' && videoId ? (
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${videoId}`} // Use the extracted videoId
                        title={item.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" // Updated allow attribute
                        allowFullScreen
                        className="rounded-t-lg"
                      ></iframe>
                    </div>
                  ) : item.mediaType === 'video' && !videoId ? (
                    // Show error if video URL is invalid
                     <div className="p-6 text-center text-destructive">Invalid YouTube URL provided for this item.</div>
                  ) : (
                    // Display image if it's not a video or if videoId is missing
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      width={1200}
                      height={800}
                      className="w-full h-auto max-h-[80vh] object-contain rounded-t-lg"
                    />
                  )}
                  <div className="p-6">
                    <DialogHeader className="text-left">
                      <DialogTitle className="text-2xl font-headline text-primary">{item.title}</DialogTitle>
                      {item.description && (
                        <DialogDescription className="text-base text-foreground/80 pt-2">
                          {item.description}
                        </DialogDescription>
                      )}
                    </DialogHeader>
                  </div>
                </DialogContent>
              </Dialog>
             );
          })}
        </div>
      )}
    </div>
  );
}