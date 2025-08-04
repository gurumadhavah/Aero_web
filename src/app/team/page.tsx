import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

interface TeamMember {
  name: string;
  role: string;
  avatarUrl: string;
  aiHint: string;
}

const teamMembers: TeamMember[] = [
  { name: "Adrin S R", role: "Captain", avatarUrl: "https://placehold.co/150x150.png", aiHint: "male portrait" },
  { name: "Karthik", role: "Vice Captain", avatarUrl: "https://placehold.co/150x150.png", aiHint: "male portrait" },
  { name: "Shivani S", role: "Secretary", avatarUrl: "https://placehold.co/150x150.png", aiHint: "female portrait" },
  { name: "Vishal N", role: "Treasurer", avatarUrl: "https://placehold.co/150x150.png", aiHint: "male portrait" },
  { name: "Nevil D'souza", role: "Technical Head (Structures)", avatarUrl: "https://placehold.co/150x150.png", aiHint: "male portrait" },
  { name: "Akshay B R", role: "Technical Head (Avionics)", avatarUrl: "https://placehold.co/150x150.png", aiHint: "male portrait" },
];

export default function TeamPage() {
  return (
    <div className="container py-12 px-4 md:px-6">
      <div className="space-y-4 text-center mb-12">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl">Meet the Team</h1>
        <p className="max-w-[900px] mx-auto text-foreground/80 md:text-xl">
          The brilliant minds behind SJECAero's success.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {teamMembers.map((member, index) => (
          <Card key={index} className="text-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
            <CardHeader>
              <Avatar className="w-24 h-24 mx-auto mb-4">
                <AvatarImage src={member.avatarUrl} alt={member.name} data-ai-hint={member.aiHint} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl font-headline">{member.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-primary">{member.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

    