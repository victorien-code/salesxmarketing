import Link from 'next/link';
import { Instagram, Mail, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo et description */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <Instagram className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gradient">SalesXMarketing</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed">
              L'outil ultime pour automatiser votre démarchage Instagram et 
              développer votre présence en ligne efficacement.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Produit */}
          <div>
            <h4 className="font-semibold mb-4">Produit</h4>
            <ul className="space-y-2">
              <li><Link href="#features" className="text-muted-foreground hover:text-primary transition-colors">Fonctionnalités</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">Tarifs</Link></li>
              <li><Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="/campaigns" className="text-muted-foreground hover:text-primary transition-colors">Campagnes</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-muted-foreground hover:text-primary transition-colors">Centre d'aide</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
              <li><Link href="#faq" className="text-muted-foreground hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link href="/status" className="text-muted-foreground hover:text-primary transition-colors">Statut</Link></li>
            </ul>
          </div>
          
          {/* Légal */}
          <div>
            <h4 className="font-semibold mb-4">Légal</h4>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Confidentialité</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Conditions</Link></li>
              <li><Link href="/cookies" className="text-muted-foreground hover:text-primary transition-colors">Cookies</Link></li>
              <li><Link href="/security" className="text-muted-foreground hover:text-primary transition-colors">Sécurité</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-muted-foreground">
          <p>&copy; 2024 SalesXMarketing. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}