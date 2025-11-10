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

// --- THIS IS THE CORRECTED SCHEMA ---
export const eventSchema = z.object({
  name: z.string().min(3, "Event name is required."),
  date: z.string().min(1, "Date and time are required."),
  location: z.string().min(1, { message: "Location is required." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  imageUrl: z.string().optional(), // This is handled by the imageFile
  registrationLink: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  imageFile: z.custom<File>((val) => val instanceof File, "An image file is required."),
});

export const gallerySchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  mediaType: z.enum(['image', 'video'], { required_error: "You must select a media type."}),
  imageUrl: z.string().min(1, { message: "Image path or thumbnail path is required." }),
  videoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  description: z.string().optional(),
});

// ... (your recruitmentFormSchema is correct and remains unchanged) ...
export const recruitmentFormSchema = z.object({
  fullName: z.string().min(1, "Name is required."),
  yearOfStudy: z.enum(["1st year", "2nd year", "Other"], {
    required_error: "You need to select your year of study.",
  }),
  yearOther: z.string().optional(), // Optional field if "Other" year is selected
  branch: z.enum(["AIML", "CIVIL", "CSBS", "CSDS", "CSE", "ECE", "EEE", "MECH", "OTHER"], {
    required_error: "You need to select your branch.",
  }),
  branchOther: z.string().optional(), // Optional field if "Other" branch is selected
  mobileNumber: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number."),
  email: z.string().email("Please enter a valid email address."),
  isHostelite: z.enum(["Yes", "No"], {
    required_error: "Please specify if you are a hostelite.",
  }),
  interests: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one interest.",
  }),
  interestOther: z.string().optional(), // Optional field if "Other" interest is selected
}).refine(data => {
    // If "Other" year is selected, the specify field must not be empty
    if (data.yearOfStudy === "Other" && !data.yearOther) {
        return false;
    }
    return true;
}, {
    message: "Please specify your year if you selected 'Other'.",
    path: ["yearOther"], // Field to show the error message under
}).refine(data => {
    // If "Other" branch is selected, the specify field must not be empty
    if (data.branch === "OTHER" && !data.branchOther) {
        return false;
    }
    return true;
}, {
    message: "Please specify your branch if you selected 'OTHER'.",
    path: ["branchOther"], // Field to show the error message under
}).refine(data => {
    // If "Other" interest is selected, the specify field must not be empty
    if (data.interests.includes("Other") && !data.interestOther) {
        return false;
    }
    return true;
}, {
    message: "Please specify your interest if you selected 'Other'.",
    path: ["interestOther"], // Field to show the error message under
});