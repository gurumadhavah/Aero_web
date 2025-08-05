// src/app/dashboard/page.tsx
"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialLogForm } from '@/components/dashboard/MaterialLogForm';
import { ViewSubmissions } from '@/components/dashboard/ViewSubmissions';
import { AdminPanel } from '@/components/dashboard/AdminPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportButton } from '@/components/dashboard/ExportButton';
import { DocumentUploadForm } from '@/components/dashboard/DocumentUploadForm'; // 👈 Import
import { ViewDocuments } from '@/components/dashboard/ViewDocuments'; // 👈 Import

// --- Dashboard Components for Different Roles ---

const CaptainDashboard = ({ userProfile }: any) => (
  <div className="space-y-8">
    <h2 className="text-2xl font-semibold">Welcome, Captain {userProfile.fullName}!</h2>
    <AdminPanel />
    <Tabs defaultValue="recruitment">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
        <TabsTrigger value="materials">Material Logs</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger> {/* New Tab */}
        <TabsTrigger value="logUsage">Log Your Usage</TabsTrigger>
      </TabsList>
      {/* ... other TabsContent ... */}
      <TabsContent value="recruitment">
        <div className="my-4"><ExportButton collectionName="recruitment" fileName="recruitment_responses" /></div>
        <ViewSubmissions collectionName="recruitment" title="Recruitment Applications" description="Review and manage new member applications." headers={['fullName', 'email', 'yearOfStudy', 'branch', 'reason']} />
      </TabsContent>
       <TabsContent value="contacts">
        <div className="my-4"><ExportButton collectionName="contacts" fileName="contact_messages" /></div>
        <ViewSubmissions collectionName="contacts" title="Contact Form Submissions" description="Messages sent through the contact page." headers={['fullName', 'email', 'subject', 'message']} />
      </TabsContent>
       <TabsContent value="materials">
        <div className="my-4"><ExportButton collectionName="materialLogs" fileName="material_usage_logs" /></div>
        <ViewSubmissions collectionName="materialLogs" title="Material Usage Logs" description="Recent material usage logs submitted by members." headers={['memberName', 'itemName', 'quantity', 'condition', 'notes']} />
      </TabsContent>
      <TabsContent value="documents">
        <div className="grid gap-8">
            <Card>
                <CardHeader><CardTitle>Upload Document</CardTitle></CardHeader>
                <CardContent><DocumentUploadForm /></CardContent>
            </Card>
            <ViewDocuments />
        </div>
      </TabsContent>
      <TabsContent value="logUsage">
        <Card>
            <CardHeader><CardTitle>Log Your Material Usage</CardTitle><CardDescription>Log any materials or components you have used.</CardDescription></CardHeader>
            <CardContent><MaterialLogForm /></CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
);

const CoreMemberDashboard = ({ userProfile }: any) => (
  <div className="space-y-8">
    <h2 className="text-2xl font-semibold">Welcome, {userProfile.fullName}!</h2>
    <AdminPanel />
    <Tabs defaultValue="documents">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="viewLogs">Material Logs</TabsTrigger>
        <TabsTrigger value="logUsage">Log Your Usage</TabsTrigger>
      </TabsList>
      <TabsContent value="documents">
        <div className="grid gap-8">
            <Card>
                <CardHeader><CardTitle>Upload Document</CardTitle></CardHeader>
                <CardContent><DocumentUploadForm /></CardContent>
            </Card>
            <ViewDocuments />
        </div>
      </TabsContent>
       <TabsContent value="viewLogs">
         <div className="my-4"><ExportButton collectionName="materialLogs" fileName="material_usage_logs" /></div>
         <ViewSubmissions collectionName="materialLogs" title="Material Usage Logs" description="Recent material usage logs submitted by members." headers={['memberName', 'itemName', 'quantity', 'condition', 'notes']} />
       </TabsContent>
       <TabsContent value="logUsage">
          <Card>
            <CardHeader><CardTitle>Log Your Material Usage</CardTitle><CardDescription>Log any materials or components you have used.</CardDescription></CardHeader>
            <CardContent><MaterialLogForm /></CardContent>
        </Card>
       </TabsContent>
    </Tabs>
  </div>
);

// ... NormalMemberDashboard remains the same ...

const NormalMemberDashboard = ({ userProfile }: any) => (
  <div className="grid md:grid-cols-2 gap-8">
    <Card>
      <CardHeader>
        <CardTitle>Welcome, {userProfile.fullName}!</CardTitle>
        <CardDescription>Log your material usage here.</CardDescription>
      </CardHeader>
      <CardContent>
        <MaterialLogForm />
      </CardContent>
    </Card>
     <Card>
      <CardHeader>
        <CardTitle>Recent Club Activity</CardTitle>
        <CardDescription>Stay up to date with the latest news.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>The latest club news and announcements will appear here.</p>
      </CardContent>
    </Card>
  </div>
);

// ... The rest of the DashboardPage component ...
export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !userProfile) {
    return (
      <div className="container py-12 px-4 md:px-6">
        <Skeleton className="h-8 w-1/3 mx-auto mb-4" />
        <Skeleton className="h-4 w-1/2 mx-auto mb-12" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const renderDashboardByRole = () => {
    switch (userProfile.role) {
      case 'captain':
        return <CaptainDashboard userProfile={userProfile} />;
      case 'core':
        return <CoreMemberDashboard userProfile={userProfile} />;
      case 'normal':
        return <NormalMemberDashboard userProfile={userProfile} />;
      default:
        return <p>Unknown role. Please contact an administrator.</p>;
    }
  };

  return (
    <div className="container py-12 px-4 md:px-6">
       <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">Member Dashboard</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          Your personal hub for all club activities.
        </p>
      </div>
      {renderDashboardByRole()}
    </div>
  );
}