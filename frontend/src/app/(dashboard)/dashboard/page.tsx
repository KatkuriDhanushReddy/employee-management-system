'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import StatCard from '@/components/StatCard';
import { DashboardStats, ApiResponse } from '@/types';
import { Users, UserCheck, UserX, Building2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import ProtectedRoute from '@/components/ProtectedRoute';

const COLORS = ['#0d9488', '#0891b2', '#059669', '#d97706', '#dc2626', '#6366f1', '#8b5cf6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<DashboardStats>>('/employees/dashboard/stats')
      .then((res) => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  const deptData =
    stats?.byDepartment.map((d) => ({ name: d._id, count: d.count })) || [];
  const roleData =
    stats?.byRole.map((r) => ({ name: r._id, value: r.count })) || [];

  return (
    <ProtectedRoute roles={['Super Admin', 'HR Manager']}>
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Workforce overview and analytics</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Employees" value={stats?.totalEmployees ?? 0} icon={Users} />
          <StatCard title="Active Employees" value={stats?.activeEmployees ?? 0} icon={UserCheck} accent="green" />
          <StatCard title="Inactive Employees" value={stats?.inactiveEmployees ?? 0} icon={UserX} accent="amber" />
          <StatCard title="Departments" value={stats?.departmentCount ?? 0} icon={Building2} accent="slate" />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              Employees by Department
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--muted)" />
                <YAxis tick={{ fontSize: 12 }} stroke="var(--muted)" />
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="count" fill="var(--brand)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-lg font-semibold text-foreground">
              Employees by Role
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {roleData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
