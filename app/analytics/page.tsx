import { Metadata } from 'next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import AnalyticsHeader from '@/components/analytics/AnalyticsHeader';
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts';
import AnalyticsStats from '@/components/analytics/AnalyticsStats';

export const metadata: Metadata = {
  title: 'Analyses - SalesXMarketing',
  description: 'Consultez les analyses détaillées de vos campagnes Instagram et optimisez vos performances avec SalesXMarketing.',
};

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <AnalyticsHeader />
          <AnalyticsStats />
          <AnalyticsCharts />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}