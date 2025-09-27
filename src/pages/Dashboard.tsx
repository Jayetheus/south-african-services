import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import CustomerDashboard from '@/components/dashboard/CustomerDashboard';
import ProviderDashboard from '@/components/dashboard/ProviderDashboard';
import BottomNavigation from '@/components/layout/BottomNavigation';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null; // This should be handled by the routing
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {user.role === 'customer' ? <CustomerDashboard /> : <ProviderDashboard />}
      </div>
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;