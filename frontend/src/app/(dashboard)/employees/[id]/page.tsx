'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';
import { Employee, ApiResponse } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, User, Users } from 'lucide-react';
import clsx from 'clsx';

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin, isHR } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [reportees, setReportees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<ApiResponse<Employee>>(`/employees/${id}`),
      api.get<ApiResponse<Employee[]>>(`/employees/${id}/reportees`),
    ])
      .then(([empRes, repRes]) => {
        setEmployee(empRes.data.data);
        setReportees(repRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!employee) {
    return <p className="text-muted">Employee not found.</p>;
  }

  const imgUrl = getImageUrl(employee.profileImage);
  const canViewSalary = isAdmin || isHR || user?._id === employee._id;

  return (
    <div>
      <Link href="/employees" className="mb-6 inline-flex items-center gap-2 text-sm text-muted hover:text-brand">
        <ArrowLeft size={16} /> Back to Employees
      </Link>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {imgUrl ? (
            <img src={imgUrl} alt={employee.name} className="h-24 w-24 rounded-full object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand/10 text-brand">
              <User size={32} />
            </div>
          )}

          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-foreground">{employee.name}</h1>
            <p className="text-muted">{employee.designation} · {employee.department}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                {employee.role}
              </span>
              <span
                className={clsx(
                  'rounded-full px-3 py-1 text-xs font-medium',
                  employee.status === 'Active'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-500/10 text-slate-500'
                )}
              >
                {employee.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'Employee ID', value: employee.employeeId },
            { label: 'Email', value: employee.email },
            { label: 'Phone', value: employee.phone },
            { label: 'Department', value: employee.department },
            { label: 'Designation', value: employee.designation },
            ...(canViewSalary ? [{ label: 'Salary', value: `$${employee.salary.toLocaleString()}` }] : []),
            {
              label: 'Joining Date',
              value: new Date(employee.joiningDate).toLocaleDateString(),
            },
            {
              label: 'Reporting Manager',
              value: employee.reportingManager?.name || 'None',
            },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-surface p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
              <p className="mt-1 font-medium text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {reportees.length > 0 && (
        <div className="mt-6 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <Users size={20} /> Direct Reports ({reportees.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {reportees.map((rep) => (
              <Link
                key={rep._id}
                href={`/employees/${rep._id}`}
                className="flex items-center gap-3 rounded-lg bg-surface p-3 transition-colors hover:bg-brand/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
                  <User size={16} />
                </div>
                <div>
                  <p className="font-medium text-foreground">{rep.name}</p>
                  <p className="text-xs text-muted">{rep.designation}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
