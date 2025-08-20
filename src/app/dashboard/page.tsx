"use client";

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form and View Components
import { AnnouncementForm } from '@/components/dashboard/AnnouncementForm';
import { ViewAnnouncements } from '@/components/dashboard/ViewAnnouncements';
import { ManageMembers } from '@/components/dashboard/ManageMembers';
import { DocumentUploadForm } from '@/components/dashboard/DocumentUploadForm';
import { ViewDocuments } from '@/components/dashboard/ViewDocuments';
import { AddAchievementForm } from '@/components/dashboard/AddAchievementForm';
import { ViewAchievements } from '@/components/dashboard/ViewAchievements';
import { AddEventForm } from '@/components/dashboard/AddEventForm';
import { ViewEvents } from '@/components/dashboard/ViewEvents';
import { AddGalleryItemForm } from '@/components/dashboard/AddGalleryItemForm';
import { ViewGallery } from '@/components/dashboard/ViewGallery';
import { RecruitmentToggle } from '@/components/dashboard/RecruitmentToggle';
import { ViewSubmissions } from '@/components/dashboard/ViewSubmissions';
import { ExportButton } from '@/components/dashboard/ExportButton';
import { MaterialLogForm } from '@/components/dashboard/MaterialLogForm';
import { RecentActivityFeed } from '@/components/dashboard/RecentActivityFeed';
// ✅ **NEW**: Import Project components
import { AddProjectForm } from '@/components/dashboard/AddProjectForm';
import { ViewProjects } from '@/components/dashboard/ViewProjects';


// --- Dashboard Components for Different Roles ---

const CaptainDashboard = ({ userProfile }: any) => {
    // Callback to refresh project list after adding a new one
    const [refreshProjects, setRefreshProjects] = React.useState(false);
    const handleProjectAdded = () => setRefreshProjects(prev => !prev);

    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold">Welcome, Captain {userProfile.fullName}!</h2>
            
            <div className="grid gap-8">
            <AnnouncementForm />
            <ViewAnnouncements />
            </div>
            
            <Tabs defaultValue="manageMembers" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="manageMembers">Member Administration</TabsTrigger>
                    <TabsTrigger value="content">Content Management</TabsTrigger>
                    <TabsTrigger value="materials">Materials</TabsTrigger>
                </TabsList>
                <TabsContent value="manageMembers">
                    <Card>
                        <CardHeader><CardTitle>Member Administration</CardTitle><CardDescription>Add, remove, and manage club members.</CardDescription></CardHeader>
                        <CardContent><ManageMembers /></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="content">
                    <div className="space-y-6">
                        {/* ✅ **MODIFICATION**: Adjusted grid columns to 7 */}
                        <Tabs defaultValue="achievements" className="w-full">
                            <TabsList className="grid w-full grid-cols-7">
                                <TabsTrigger value="projects">Projects</TabsTrigger> {/* ✅ **NEW** */}
                                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                                <TabsTrigger value="events">Events</TabsTrigger>
                                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                <TabsTrigger value="recruitment">Recruitment</TabsTrigger>
                                <TabsTrigger value="contact">Contact</TabsTrigger>
                            </TabsList>
                            
                            {/* ✅ **NEW**: Projects Tab Content */}
                            <TabsContent value="projects">
                                <div className="grid gap-8 pt-4">
                                    <Card>
                                        <CardHeader><CardTitle>Add New Project</CardTitle></CardHeader>
                                        <CardContent className="pt-6"><AddProjectForm onProjectAdded={handleProjectAdded} /></CardContent>
                                    </Card>
                                    <ViewProjects key={refreshProjects ? 'refresh' : 'initial'} />
                                </div>
                            </TabsContent>

                            <TabsContent value="achievements">
                                <div className="grid gap-8 pt-4">
                                <Card><CardHeader><CardTitle>Add New Achievement</CardTitle></CardHeader><CardContent className="pt-6"><AddAchievementForm /></CardContent></Card>
                                <ViewAchievements />
                                </div>
                            </TabsContent>
                            <TabsContent value="events">
                                <div className="grid gap-8 pt-4">
                                <Card><CardHeader><CardTitle>Add New Event</CardTitle></CardHeader><CardContent className="pt-6"><AddEventForm /></CardContent></Card>
                                <ViewEvents />
                                </div>
                            </TabsContent>
                            <TabsContent value="gallery">
                                <div className="grid gap-8 pt-4">
                                <Card><CardHeader><CardTitle>Add to Gallery</CardTitle></CardHeader><CardContent className="pt-6"><AddGalleryItemForm /></CardContent></Card>
                                <ViewGallery />
                                </div>
                            </TabsContent>
                            <TabsContent value="documents">
                                <div className="grid gap-8 pt-4">
                                    <Card><CardHeader><CardTitle>Upload Document</CardTitle></CardHeader><CardContent className="pt-6"><DocumentUploadForm /></CardContent></Card>
                                    <ViewDocuments />
                                </div>
                            </TabsContent>
                            <TabsContent value="recruitment">
                                <div className="grid gap-8 pt-4">
                                    <RecruitmentToggle />
                                    <div>
                                        <div className="my-4"><ExportButton collectionName="recruitment" fileName="recruitment_responses" orderByField="submittedAt" /></div>
                                        <ViewSubmissions 
                                            collectionName="recruitment" 
                                            title="Recruitment Applications" 
                                            description="Review new member applications." 
                                            headers={['fullName', 'email', 'yearOfStudy', 'branch', 'reason']} 
                                            showActions={true} 
                                            showDeleteAction={true}
                                            orderByField="submittedAt"
                                            itemLimit={20}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="contact">
                                <div className="grid gap-8 pt-4">
                                    <div className="my-4">
                                        <ExportButton 
                                            collectionName="contacts" 
                                            fileName="contact_submissions" 
                                            orderByField="submittedAt" 
                                        />
                                    </div>
                                    <ViewSubmissions 
                                        collectionName="contacts" 
                                        title="Contact Form Submissions" 
                                        description="Inquiries sent via the website's contact form." 
                                        headers={['fullName', 'email', 'subject', 'message', 'submittedAt']} 
                                        orderByField="submittedAt"
                                        showActions={false}
                                        showDeleteAction={true}
                                        itemLimit={20}
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </TabsContent>
                <TabsContent value="materials">
                    <div className="grid gap-8 pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Log Material Usage</CardTitle>
                                <CardDescription>Record items taken from or returned to the club inventory.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <MaterialLogForm />
                            </CardContent>
                        </Card>
                        <ViewSubmissions 
                            collectionName="materialLogs"
                            title="Material Usage Logs"
                            description="A record of all materials used by club members."
                            headers={['memberName', 'itemName', 'quantity', 'condition', 'notes', 'timestamp']}
                            orderByField="timestamp"
                            showDeleteAction={true}
                            itemLimit={50}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};


const CoreMemberDashboard = ({ userProfile }: any) => {
    // Callback to refresh project list after adding a new one
    const [refreshProjects, setRefreshProjects] = React.useState(false);
    const handleProjectAdded = () => setRefreshProjects(prev => !prev);
    
    return (
        <div className="space-y-8">
            <h2 className="text-2xl font-semibold">Welcome, {userProfile.fullName}!</h2>
            
            <div className="grid gap-8">
                <AnnouncementForm />
                <ViewAnnouncements />
            </div>
            
            <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="content">Content Management</TabsTrigger>
                    <TabsTrigger value="materials">Materials</TabsTrigger>
                </TabsList>
                <TabsContent value="content">
                    <div className="space-y-6">
                         {/* ✅ **MODIFICATION**: Adjusted grid columns to 5 */}
                        <Tabs defaultValue="achievements" className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="projects">Projects</TabsTrigger> {/* ✅ **NEW** */}
                                <TabsTrigger value="achievements">Achievements</TabsTrigger>
                                <TabsTrigger value="events">Events</TabsTrigger>
                                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                            </TabsList>

                            {/* ✅ **NEW**: Projects Tab Content */}
                            <TabsContent value="projects">
                                <div className="grid gap-8 pt-4">
                                     <Card>
                                        <CardHeader><CardTitle>Add New Project</CardTitle></CardHeader>
                                        <CardContent className="pt-6"><AddProjectForm onProjectAdded={handleProjectAdded} /></CardContent>
                                    </Card>
                                    <ViewProjects key={refreshProjects ? 'refresh' : 'initial'} />
                                </div>
                            </TabsContent>

                            <TabsContent value="achievements">
                                <div className="grid gap-8 pt-4">
                                <Card><CardHeader><CardTitle>Add New Achievement</CardTitle></CardHeader><CardContent className="pt-6"><AddAchievementForm /></CardContent></Card>
                                <ViewAchievements />
                                </div>
                            </TabsContent>
                            <TabsContent value="events">
                                <div className="grid gap-8 pt-4">
                                <Card><CardHeader><CardTitle>Add New Event</CardTitle></CardHeader><CardContent className="pt-6"><AddEventForm /></CardContent></Card>
                                <ViewEvents />
                                </div>
                            </TabsContent>
                            <TabsContent value="gallery">
                                <div className="grid gap-8 pt-4">
                                <Card><CardHeader><CardTitle>Add to Gallery</CardTitle></CardHeader><CardContent className="pt-6"><AddGalleryItemForm /></CardContent></Card>
                                <ViewGallery />
                                </div>
                            </TabsContent>
                            <TabsContent value="documents">
                                <div className="grid gap-8 pt-4">
                                    <Card><CardHeader><CardTitle>Upload Document</CardTitle></CardHeader><CardContent className="pt-6"><DocumentUploadForm /></CardContent></Card>
                                    <ViewDocuments />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </TabsContent>
                <TabsContent value="materials">
                    <div className="grid gap-8 pt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Log Material Usage</CardTitle>
                                <CardDescription>Record items taken from or returned to the club inventory.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <MaterialLogForm />
                            </CardContent>
                        </Card>
                        <ViewSubmissions 
                            collectionName="materialLogs"
                            title="Material Usage Logs"
                            description="A record of all materials used by club members."
                            headers={['memberName', 'itemName', 'quantity', 'condition', 'notes', 'timestamp']}
                            orderByField="timestamp"
                            showDeleteAction={true}
                            itemLimit={50}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

// ... (NormalMemberDashboard and the rest of the file remains the same)

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
        <RecentActivityFeed />
      </CardContent>
    </Card>
  </div>
);
// --- End of Dashboard Components ---

export default function DashboardPage() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // Read the login page URL from environment variables for consistent redirects
  const loginPageUrl = process.env.NEXT_PUBLIC_LOGIN_PAGE_URL || '/login';

  React.useEffect(() => {
    if (!loading && !user) {
      // Use the environment variable for the redirect
      router.push(loginPageUrl);
    }
  }, [user, loading, router, loginPageUrl]);

  if (loading || !userProfile) {
    return (
      <div className="container py-12 px-4 md:px-6">
        <Skeleton className="h-8 w-1_3 mx-auto mb-4" />
        <Skeleton className="h-4 w-1_2 mx-auto mb-12" />
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