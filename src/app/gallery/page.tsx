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
import Link from "next/link";

interface GalleryItem {
  id: string;
  title: string;
  mediaType: 'image' | 'video';
  imageUrl: string;
  videoUrl?: string;
  description?: string;
}

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
          // --- THIS IS THE CRUCIAL FIX ---
          // It ensures we only try to render items that have a valid imageUrl.
          .filter(item => item.imageUrl && typeof item.imageUrl === 'string');
          
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
    // ... The rest of your JSX code remains exactly the same
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
            <Skeleton key={index} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      ) : galleryItems.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Content Coming Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <p>This page will showcase photos and videos from club activities, rendered dynamically from our storage. Check back soon for updates!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryItems.map((item) => (
            <Dialog key={item.id}>
              <DialogTrigger asChild>
                <div className="group relative aspect-square overflow-hidden rounded-lg cursor-pointer">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center p-4">
                    <div className="text-center">
                      {item.mediaType === 'video' && <Video className="h-10 w-10 text-white mb-2 mx-auto" />}
                      <h3 className="font-headline text-lg text-white font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">{item.title}</h3>
                    </div>
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-card border-primary/20 p-0">
                  {item.mediaType === 'video' && item.videoUrl ? (
                   <div className="aspect-video">
                       <iframe 
                           width="100%" 
                           height="100%" 
                           src={`https://www.youtube.com/embed/${item.videoUrl.split('v=')[1]}`}
                           title={item.title}
                           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                           allowFullScreen
                           className="rounded-t-lg"
                       ></iframe>
                   </div>
                  ) : (
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
          ))}
        </div>
      )}
    </div>
  );
}