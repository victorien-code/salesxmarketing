import { Metadata } from 'next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import StatsCards from '@/components/dashboard/StatsCards';
import RecentCampaigns from '@/components/dashboard/RecentCampaigns';
import QuickActions from '@/components/dashboard/QuickActions';

export const metadata: Metadata = {
  title: 'Dashboard - SalesXMarketing',
  description: 'Gérez vos campagnes Instagram et consultez vos statistiques sur votre tableau de bord SalesXMarketing.',
};

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
            <p className="text-muted-foreground">
              Bienvenue sur votre espace de gestion SalesXMarketing
            </p>
          </div>

          <StatsCards />
          <QuickActions />
          <RecentCampaigns />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}