// src/components/dashboard/EditModal.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Edit } from "lucide-react";

interface EditModalProps {
  collectionName: string;
  docId: string;
  initialData: any;
  formSchema: any;
  fields: any[];
  onEdited: () => void;
}

export function EditModal({ collectionName, docId, initialData, formSchema, fields, onEdited }: EditModalProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  async function onSubmit(values: any) {
    try {
      await updateDoc(doc(db, collectionName, docId), values);
      toast({ title: "Success!", description: "The item has been updated." });
      onEdited(); // Refresh the list
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating document:", error);
      toast({ title: "Error", description: "Could not update the item.", variant: "destructive" });
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Edit className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <DialogDescription>Make changes to the item below.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
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
                      ) : (
                        <Input placeholder={field.placeholder} {...renderField} />
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}