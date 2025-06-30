import { Metadata } from 'next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import InstagramConnectForm from '@/components/instagram/InstagramConnectForm';

export const metadata: Metadata = {
  title: 'Connecter Instagram - SalesXMarketing',
  description: 'Connectez votre compte Instagram à SalesXMarketing en suivant notre guide étape par étape.',
};

export default function InstagramConnectPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Connecter votre compte Instagram</h1>
            <p className="text-muted-foreground">
              Suivez notre guide vidéo pour obtenir votre token Meta et connecter votre compte Instagram
            </p>
          </div>
          
          <InstagramConnectForm />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}