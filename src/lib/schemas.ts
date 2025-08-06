// src/lib/schemas.ts
import * as z from "zod";

export const achievementSchema = z.object({
  sortId: z.coerce.number().min(1, { message: "A unique sort ID is required." }),
  title: z.string().min(1, { message: "Title is required." }),
  date: z.string().min(1, { message: "Date is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  imageUrl: z.string().min(1, { message: "Image path is required (e.g., /images/achievements/image.png)." }),
  rank: z.string().optional(),
});

export const eventSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  date: z.date({ required_error: "A date is required." }),
  location: z.string().min(1, { message: "Location is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  imageUrl: z.string().min(1, { message: "Image path is required." }),
  registrationLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
});

export const gallerySchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  mediaType: z.enum(['image', 'video'], { required_error: "You must select a media type."}),
  imageUrl: z.string().min(1, { message: "Image path or thumbnail path is required." }),
  videoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  description: z.string().optional(),
});