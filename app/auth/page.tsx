'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthForm from '../../components/auth/AuthForm';
import { Instagram } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    const modeParam = searchParams.get('mode');
    if (modeParam === 'signup') {
      setMode('signup');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center space-x-2">
            <Instagram className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-gradient">SalesXMarketing</span>
          </Link>
        </div>
        
        <AuthForm mode={mode} onModeChange={setMode} />
      </div>
    </div>
  );
}