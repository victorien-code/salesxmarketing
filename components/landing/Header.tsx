'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Instagram, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <Instagram className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold text-gradient">SalesXMarketing</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">
            Fonctionnalités
          </Link>
          <Link href="#testimonials" className="text-sm font-medium hover:text-primary transition-colors">
            Témoignages
          </Link>
          <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors">
            FAQ
          </Link>
          <Link href="/auth" className="text-sm font-medium hover:text-primary transition-colors">
            Connexion
          </Link>
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link href="/auth">
            <Button variant="outline">Se connecter</Button>
          </Link>
          <Link href="/auth?mode=signup">
            <Button>Commencer gratuitement</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container mx-auto px-4 py-4 space-y-4">
            <Link 
              href="#features" 
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Fonctionnalités
            </Link>
            <Link 
              href="#testimonials" 
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Témoignages
            </Link>
            <Link 
              href="#faq" 
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link 
              href="/auth" 
              className="block text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Connexion
            </Link>
            <div className="pt-4 space-y-2">
              <Link href="/auth" className="block">
                <Button variant="outline" className="w-full">Se connecter</Button>
              </Link>
              <Link href="/auth?mode=signup" className="block">
                <Button className="w-full">Commencer gratuitement</Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}