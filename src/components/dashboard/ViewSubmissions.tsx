// src/components/dashboard/ViewSubmissions.tsx
"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "../ui/skeleton";

interface Submission {
  id: string;
  [key: string]: any;
}

interface ViewSubmissionsProps {
  collectionName: string;
  title: string;
  description: string;
  headers: string[];
}

export function ViewSubmissions({ collectionName, title, description, headers }: ViewSubmissionsProps) {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const q = query(collection(db, collectionName), orderBy("timestamp", "desc"), limit(20));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubmissions(data);
      } catch (error) {
        console.error(`Error fetching ${collectionName}:`, error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [collectionName]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {headers.map(header => <TableHead key={header}>{header}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map(submission => (
                <TableRow key={submission.id}>
                  {headers.map(header => (
                    <TableCell key={header}>
                      {submission[header] ? submission[header].toString() : '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}