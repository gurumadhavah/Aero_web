"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, onSnapshot, orderBy, doc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import emailjs from "emailjs-com"; // --- NEW: Import EmailJS ---
import { getContactReplyBody } from "@/lib/emailTemplates"; // --- NEW: Import email helper ---
import { useToast } from "@/hooks/use-toast";

// Shadcn/ui components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Trash2, Reply, Send, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface ContactMessage {
  id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  submittedAt: {
    toDate: () => Date;
  };
  replied?: boolean;
}

export default function ViewContactMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
  const { toast } = useToast();

  // --- NEW: EmailJS credentials ---
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
  const genericTemplateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_GENERIC!;
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;

  useEffect(() => {
    const q = query(collection(db, "contacts"), orderBy("submittedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as ContactMessage));
      setMessages(msgs);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching contact messages: ", err);
      setError("Failed to load messages.");
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await deleteDoc(doc(db, "contacts", id));
      toast({ title: "Success", description: "Message deleted successfully." });
    } catch (err) {
      toast({ title: "Error", description: "Could not delete the message.", variant: "destructive" });
    }
  };

  const handleOpenReplyDialog = (message: ContactMessage) => {
    setSelectedMessage(message);
    setReplyContent("");
    setIsReplyDialogOpen(true);
  };

  // --- MODIFIED: This function now uses EmailJS ---
  const handleSendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) {
      toast({ title: "Error", description: "Reply content cannot be empty.", variant: "destructive" });
      return;
    }
    
    try {
      // 1. Send the email via EmailJS
      const templateParams = {
        subject: `Re: ${selectedMessage.subject}`,
        html_body: getContactReplyBody({
          to_name: selectedMessage.fullName,
          original_subject: selectedMessage.subject,
          reply_content: replyContent,
        }),
        to_email: selectedMessage.email,
      };

      await emailjs.send(serviceId, genericTemplateId, templateParams, publicKey);
      
      // 2. Mark the message as replied in Firestore
      const docRef = doc(db, "contacts", selectedMessage.id);
      await updateDoc(docRef, {
        replied: true,
        repliedAt: serverTimestamp(),
      });

      toast({
        title: "Reply Sent!",
        description: `Your reply has been sent to ${selectedMessage.email}.`,
      });
      setIsReplyDialogOpen(false);
    } catch (err: any) {
        console.error("Error sending reply: ", err);
        toast({
            title: "Error",
            description: `Could not send the reply. ${err.text || "Please try again."}`,
            variant: "destructive",
        });
    }
  };

  if (loading) return <p>Loading messages...</p>;
  if (error) return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Mail className="mr-2 h-5 w-5"/> Contact Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          {messages.length === 0 ? (
            <p>No contact messages found.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {messages.map((msg) => (
                <AccordionItem value={msg.id} key={msg.id}>
                  <AccordionTrigger>
                    <div className="flex justify-between items-center w-full pr-4">
                        <div className="flex flex-col items-start text-left">
                            <span className="font-semibold">{msg.subject}</span>
                            <span className="text-sm text-muted-foreground">{msg.fullName} ({msg.email})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {msg.replied && <Badge variant="secondary">Replied</Badge>}
                          <span className="text-sm text-muted-foreground">
                              {msg.submittedAt?.toDate().toLocaleDateString()}
                          </span>
                        </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="whitespace-pre-wrap p-4 border bg-muted rounded-md mb-4">{msg.message}</p>
                    <div className="flex gap-2">
                      <Button onClick={() => handleOpenReplyDialog(msg)} size="sm">
                        <Reply className="mr-2 h-4 w-4" /> Reply
                      </Button>
                      <Button onClick={() => handleDelete(msg.id)} variant="destructive" size="sm">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </CardContent>
      </Card>

      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent>
          {/* --- FIX: Added DialogTitle to resolve the accessibility error --- */}
          <DialogHeader>
            <DialogTitle>Reply to {selectedMessage?.fullName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-sm">
                <p><strong>To:</strong> {selectedMessage?.email}</p>
                <p><strong>Subject:</strong> Re: {selectedMessage?.subject}</p>
            </div>
            <Textarea
              placeholder="Type your reply here..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={8}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsReplyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendReply}>
              <Send className="mr-2 h-4 w-4" /> Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}