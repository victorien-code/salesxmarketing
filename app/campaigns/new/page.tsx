import { Metadata } from 'next';
import ProtectedRoute from '../../../components/auth/ProtectedRoute';
import DashboardLayout from '../../../components/dashboard/DashboardLayout';
import CampaignWizard from '../../../components/campaigns/CampaignWizard';

export const metadata: Metadata = {
  title: 'Nouvelle Campagne - SalesXMarketing',
  description: 'Créez une nouvelle campagne d\'engagement Instagram avec l\'assistant de création SalesXMarketing.',
};

export default function NewCampaignPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <CampaignWizard />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}