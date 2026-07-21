'use client';

import Sidebar from '@/components/Sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface">
        <Sidebar />
        <main className="lg:pl-64">
          <div className="mx-auto max-w-7xl px-4 py-8 pt-16 lg:px-8 lg:pt-8">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
