import { Metadata } from 'next';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MessagingInterface from '@/components/messaging/MessagingInterface';

export const metadata: Metadata = {
  title: 'Messagerie Instagram - SalesXMarketing',
  description: 'Consultez et gérez tous vos messages Instagram depuis une interface unifiée. Envoyez et répondez à vos messages directs.',
};

export default function MessagingPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <MessagingInterface />
      </DashboardLayout>
    </ProtectedRoute>
  );
}