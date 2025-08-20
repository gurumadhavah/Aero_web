"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Interface for the ticker testimonials
interface TickerTestimonial {
  id: string;
  name: string;
  quote: string;
}

export function ScrollingTestimonials() {
  const [tickerTestimonials, setTickerTestimonials] = React.useState<TickerTestimonial[]>([]);

  React.useEffect(() => {
    const fetchTickerTestimonials = async () => {
      try {
        const q = query(
            collection(db, "testimonials"), 
            where("isFixed", "==", false),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TickerTestimonial));
        setTickerTestimonials(data);
      } catch (error) {
        console.error("Error fetching ticker testimonials:", error);
      }
    };

    fetchTickerTestimonials();
  }, []);

  if (tickerTestimonials.length === 0) {
    return null;
  }

  const duplicatedTestimonials = [...tickerTestimonials, ...tickerTestimonials];

  return (
    <div className="relative w-full overflow-hidden mt-12">
      <div className="animate-scroll">
        {duplicatedTestimonials.map((item, index) => (
          <div key={`${item.id}-${index}`} className="flex-shrink-0 w-[350px] mx-4 py-2">
            <Card className="h-full bg-card border-primary/20 flex flex-col">
              <CardContent className="p-6 text-center flex-grow flex items-center justify-center">
                <p className="text-foreground/80 italic whitespace-normal">&quot;{item.quote}&quot;</p>
              </CardContent>
              <CardHeader className="pt-0">
                <CardTitle className="text-lg text-center font-headline">{item.name}</CardTitle>
              </CardHeader>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}