import Image from 'next/image';
import { Linkedin, Mail, MapPin, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-primary/5 border-t border-border/40">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="https://placehold.co/100x40.png" alt="SJECAero Logo" width={100} height={40} data-ai-hint="logo eagle" />
            </Link>
            <p className="text-sm text-foreground/80 max-w-xs">
              Designing, building, and flying the future of aerospace technology at SJEC.
            </p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-headline font-semibold mb-2">Navigation</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/projects" className="text-foreground/80 hover:text-primary">Projects</Link></li>
                <li><Link href="/team" className="text-foreground/80 hover:text-primary">Team</Link></li>
                <li><Link href="/events" className="text-foreground/80 hover:text-primary">Events</Link></li>
                <li><Link href="/gallery" className="text-foreground/80 hover:text-primary">Gallery</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-2">Get Involved</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/recruitment" className="text-foreground/80 hover:text-primary">Join Us</Link></li>
                <li><Link href="/#contact" className="text-foreground/80 hover:text-primary">Contact</Link></li>
                <li><Link href="/login" className="text-foreground/80 hover:text-primary">Member Login</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-2">Contact</h4>
               <ul className="space-y-2 text-sm">
                <li>
                    <Link href="mailto:sjec.aero@example.com" className="text-foreground/80 hover:text-primary flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                    </Link>
                </li>
                <li>
                    <Link href="https://maps.app.goo.gl/mdzLGFHTdY29koda6" target="_blank" rel="noopener noreferrer" className="text-foreground/80 hover:text-primary flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>Location</span>
                    </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-headline font-semibold mb-2">Connect</h4>
              <div className="flex space-x-4 mt-2">
                <Link href="https://www.linkedin.com/company/sjec-aero/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin className="h-5 w-5 text-foreground/80 hover:text-primary" /></Link>
                <Link href="#" aria-label="Instagram"><Instagram className="h-5 w-5 text-foreground/80 hover:text-primary" /></Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-foreground/60">
          <p>&copy; {new Date().getFullYear()} SJECAero - SJEC AERO Club. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

    