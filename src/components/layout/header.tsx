// src/components/layout/header.tsx
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
  const { user } = useAuth(); // Get user from our AuthContext

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to home page after logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Image src="/images/logo.png" alt="SJECAero Logo" width={120} height={40} />
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
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="hidden md:flex items-center space-x-2">
            {/* --- Conditional Buttons for Desktop --- */}
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button onClick={handleLogout} className="bg-destructive hover:bg-destructive/90">
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/recruitment">Join Us</Link>
                </Button>
              </>
            )}
          </nav>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-background p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center space-x-2">
                    <Image src="/images/logo.png" alt="SJECAero Logo" width={120} height={40} />
                  </Link>
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
                    {/* --- Conditional Buttons for Mobile --- */}
                    {user ? (
                      <>
                        <Button variant="outline" asChild>
                          <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                        </Button>
                        <Button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="bg-destructive hover:bg-destructive/90">
                          Logout
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" asChild>
                          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                        </Button>
                        <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Link href="/recruitment" onClick={() => setIsMobileMenuOpen(false)}>Join Us</Link>
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