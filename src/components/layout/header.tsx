"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Achievements', href: '/achievements' },
  { label: 'Projects', href: '/projects' },
  { label: 'Events', href: '/events' },
  { label: 'Team', href: '/team' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const logoUrl = process.env.NEXT_PUBLIC_LOGO_URL;
  const collegeLogoUrl =  process.env.NEXT_PUBLIC_COLLEGE_LOGO_URL;
  const dashboardUrl = process.env.NEXT_PUBLIC_LOGIN_REDIRECT_URL || '/dashboard';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between"> {/* Increased header height for more space */}
        {/* Left Side: Club Logo and Main Navigation */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2">
            {logoUrl && <Image src={logoUrl} alt="SJECAero Logo" width={120} height={40} priority />}
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'transition-colors hover:text-primary',
                  pathname === item.href ? 'text-primary' : 'text-foreground/80'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Side: User Auth, College Logo, and Mobile Menu */}
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-2">
            {user && (
              <>
                <Button variant="ghost" asChild>
                  <Link href={dashboardUrl}>Dashboard</Link>
                </Button>
                <Button onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                  Logout
                </Button>
              </>
            )}
          </nav>
          
          {/* College Logo (visible on desktop) - Size Increased */}
          <div className="hidden md:flex">
             {collegeLogoUrl && <Image src={collegeLogoUrl} alt="College Logo" width={56} height={56} className="rounded-full" />}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <>
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex justify-between items-center">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2">
                    {logoUrl && <Image src={logoUrl} alt="SJECAero Logo" width={120} height={40} />}
                  </Link>
                  {/* College Logo (in mobile menu) - Size Increased */}
                  {collegeLogoUrl && <Image src={collegeLogoUrl} alt="College Logo" width={56} height={56} className="rounded-full" />}
                </div>
                <nav className="flex flex-col gap-4 p-4">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'text-lg font-medium transition-colors hover:text-primary',
                        pathname === item.href ? 'text-primary' : 'text-foreground/80'
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto p-4 border-t flex flex-col gap-2">
                  {user && (
                    <>
                      <Button variant="outline" asChild>
                        <Link href={dashboardUrl} onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                      </Button>
                      <Button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="bg-destructive hover:bg-destructive/90">
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}