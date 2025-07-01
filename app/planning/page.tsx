import { Metadata } from 'next';
import ProtectedRoute from '../../components/auth/ProtectedRoute';
import DashboardLayout from '../../components/dashboard/DashboardLayout';
import ContentScheduler from '../../components/planning/ContentScheduler';

export const metadata: Metadata = {
  title: 'Planification - SalesXMarketing',
  description: 'Planifiez et gérez vos publications Instagram avec notre système de planification avancé.',
};

export default function PlanningPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ContentScheduler />
      </DashboardLayout>
    </ProtectedRoute>
  );
}