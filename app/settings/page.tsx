import { Metadata } from 'next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import SettingsTabs from '@/components/settings/SettingsTabs';

export const metadata: Metadata = {
  title: 'Paramètres - SalesXMarketing',
  description: 'Configurez votre compte et vos paramètres Instagram pour optimiser vos campagnes SalesXMarketing.',
};

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
            <p className="text-muted-foreground">
              Gérez votre compte et configurez vos préférences
            </p>
          </div>
          
          <SettingsTabs />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}