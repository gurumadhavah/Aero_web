"use client";

import * as React from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";

export function RecruitmentToggle() {
  const [isActive, setIsActive] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  React.useEffect(() => {
    const fetchStatus = async () => {
      const docRef = doc(db, "settings", "recruitment");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setIsActive(docSnap.data().active);
      }
      setLoading(false);
    };
    fetchStatus();
  }, []);

  const handleToggle = async (checked: boolean) => {
    setIsActive(checked);
    try {
      const docRef = doc(db, "settings", "recruitment");
      await setDoc(docRef, { active: checked });
      toast({
        title: "Success",
        description: `Recruitment is now ${checked ? "OPEN" : "CLOSED"}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not update the setting.",
        variant: "destructive",
      });
      setIsActive(!checked); // Revert on error
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recruitment Status</CardTitle>
        <CardDescription>
          Enable this switch to open the "Join Us" form to the public.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
            <Skeleton className="h-8 w-24" />
        ) : (
            <div className="flex items-center space-x-2">
                <Switch
                    id="recruitment-toggle"
                    checked={isActive}
                    onCheckedChange={handleToggle}
                    aria-readonly
                />
                <Label htmlFor="recruitment-toggle" className="text-lg">
                    {isActive ? "Open" : "Closed"}
                </Label>
            </div>
        )}
      </CardContent>
    </Card>
  );
}