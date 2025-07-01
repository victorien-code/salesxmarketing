import { Metadata } from 'next';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import CampaignsList from '../../components/campaigns/CampaignsList';

export const metadata: Metadata = {
  title: 'Campagnes - SalesXMarketing',
  description: 'Gérez toutes vos campagnes d\'engagement Instagram depuis votre tableau de bord SalesXMarketing.',
};

export default function CampaignsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CampaignsList />
      </DashboardLayout>
    </ProtectedRoute>
  );
}