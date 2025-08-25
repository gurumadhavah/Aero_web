import Image from 'next/image';
import { Linkedin, Mail, MapPin, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  // --- Read environment variables with fallbacks ---
  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  const collegeName = process.env.NEXT_PUBLIC_COLLEGE_NAME;
  const collegeLocationText = process.env.NEXT_PUBLIC_COLLEGE_LOCATION_TEXT;
  const mapsUrl = process.env.NEXT_PUBLIC_MAPS_URL;
  const linkedinUrl = process.env.NEXT_PUBLIC_LINKEDIN_URL;
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL;

  return (
    <footer id="contact-info" className="w-full bg-secondary/30 border-t border-border/40">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center space-x-2">
              {/* Use logo from environment variable */}
              {logoUrl && <Image src={logoUrl} alt="SJECAero Logo" width={120} height={40} />}
            </Link>
            {/* --- MODIFIED TEXT AND STYLE --- */}
            <p className="text-sm font-semibold text-yellow-500 max-w-xs italic">
                &quot;The lower you fall, the higher you fly&quot;
            </p>
             <div className="flex space-x-4 mt-2">
                <Link href={linkedinUrl || "#"} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-foreground/70 hover:text-primary transition-colors">
                    <Linkedin className="h-6 w-6" />
                </Link>
                <Link href={instagramUrl || "#"} target='_blank' aria-label="Instagram" className="text-foreground/70 hover:text-primary transition-colors">
                    <Instagram className="h-6 w-6" />
                </Link>
              </div>
          </div>
          <div className="md:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="font-headline font-semibold mb-3 text-primary">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/#about" className="text-foreground/70 hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/projects" className="text-foreground/70 hover:text-primary transition-colors">Projects</Link></li>
                <li><Link href="/team" className="text-foreground/70 hover:text-primary transition-colors">Team</Link></li>
                <li><Link href="/gallery" className="text-foreground/70 hover:text-primary transition-colors">Gallery</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-3 text-primary">Get Involved</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/recruitment" className="text-foreground/70 hover:text-primary transition-colors">Join Us</Link></li>
                <li><Link href="/events" className="text-foreground/70 hover:text-primary transition-colors">Events</Link></li>
                 <li><Link href="/achievements" className="text-foreground/70 hover:text-primary transition-colors">Achievements</Link></li>
                <li><Link href="/login" className="text-foreground/70 hover:text-primary transition-colors">Member Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-3 text-primary">Contact</h4>
               <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                    <Mail className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                        <span className="font-semibold">Email</span>
                        <br/>
                        <Link href={`mailto:${contactEmail}`} className="text-foreground/70 hover:text-primary transition-colors">
                            {contactEmail}
                        </Link>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <MapPin className="h-8 w-8 mt-0.5 text-primary" />
                    <div>
                        <span className="font-semibold">Location</span>
                        <br/>
                        <Link href={mapsUrl || "#"} target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors">
                            {collegeName}, {collegeLocationText}
                        </Link>
                    </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-border/40 text-center text-sm text-foreground/60">
          <p>© {new Date().getFullYear()} SJEC Aero - SJEC AERO Club. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}