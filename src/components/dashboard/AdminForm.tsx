// src/components/dashboard/AdminForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// 👇 UPDATE THIS INTERFACE 👇
interface AdminFormProps {
  collectionName: string;
  formSchema: any;
  fields: any[];
  formTitle: string;
  onSubmitted: () => void; // Add this prop
}

// 👇 UPDATE THE FUNCTION SIGNATURE 👇
export function AdminForm({ collectionName, formSchema, fields, formTitle, onSubmitted }: AdminFormProps) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: fields.reduce((acc, field) => ({ ...acc, [field.name]: field.type === 'date' ? undefined : '' }), {}),
  });

  async function onSubmit(values: any) {
    try {
      await addDoc(collection(db, collectionName), {
        ...values,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Success!", description: `${formTitle} has been added.` });
      form.reset();
      onSubmitted();
    } catch (error) {
      console.error("Error adding document: ", error);
      toast({ title: "Error", description: "Could not add the document.", variant: "destructive" });
    }
  }
  
  return (
    <div className="pt-6">
      <h3 className="text-lg font-medium mb-4">{formTitle}</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {fields.map(field => (
            <FormField
              key={field.name}
              control={form.control}
              name={field.name}
              render={({ field: renderField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    {field.type === 'textarea' ? (
                      <Textarea placeholder={field.placeholder} {...renderField} />
                    ) : field.type === 'date' ? (
                       <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !renderField.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {renderField.value ? format(renderField.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={renderField.value}
                            onSelect={renderField.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    ) : field.type === 'select' ? (
                        <Select onValueChange={renderField.onChange} defaultValue={renderField.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder={`Select a ${field.label.toLowerCase()}`} />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {field.options.map((option: string) => (
                                    <SelectItem key={option} value={option}>{option.charAt(0).toUpperCase() + option.slice(1)}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                      <Input placeholder={field.placeholder} {...renderField} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="submit">Add to {collectionName}</Button>
        </form>
      </Form>
    </div>
  );
}