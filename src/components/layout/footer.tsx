// src/components/layout/footer.tsx
import Image from 'next/image';
import { Linkedin, Mail, MapPin, Instagram } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="contact-info" className="w-full bg-secondary/30 border-t border-border/40">
      <div className="container py-12 px-4 md:px-6">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4 flex flex-col gap-4">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/images/logo.png" alt="SJECAero Logo" width={120} height={40} />
            </Link>
            <p className="text-sm text-foreground/70 max-w-xs">
              Designing, building, and flying the future of aerospace technology at SJEC.
            </p>
             <div className="flex space-x-4 mt-2">
                <Link href="https://www.linkedin.com/company/sjec-aero/posts/?feedView=all" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-foreground/70 hover:text-primary transition-colors">
                  <Linkedin className="h-6 w-6" />
                </Link>
                <Link href="https://www.instagram.com/sjec_aero/" target='_blank' aria-label="Instagram" className="text-foreground/70 hover:text-primary transition-colors">
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
                        <Link href="mailto:team.aero@sjec.ac.in" className="text-foreground/70 hover:text-primary transition-colors">
                            team.aero@sjec.ac.in
                        </Link>
                    </div>
                </li>
                <li className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                        <span className="font-semibold">Location</span>
                        <br/>
                        <Link href="https://maps.app.goo.gl/mdzLGFHTdY29koda6" target="_blank" rel="noopener noreferrer" className="text-foreground/70 hover:text-primary transition-colors">
                            SJEC, Mangalore
                        </Link>
                    </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-8 border-t border-border/40 text-center text-sm text-foreground/60">
          <p>© {new Date().getFullYear()} SJECAero - SJEC AERO Club. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}