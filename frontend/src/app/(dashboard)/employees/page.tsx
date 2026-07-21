'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import api, { getImageUrl } from '@/lib/api';
import { Employee, ApiResponse, DEPARTMENTS, ROLES, STATUSES, Pagination } from '@/types';
import { useAuth } from '@/context/AuthContext';
import EmployeeForm from '@/components/EmployeeForm';
import {
  Plus,
  Search,
  Upload,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import clsx from 'clsx';

export default function EmployeesPage() {
  const { isAdmin, isHR } = useAuth();
  const canManage = isAdmin || isHR;
  const canDelete = isAdmin;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('joiningDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const [showForm, setShowForm] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (department) params.set('department', department);
      if (role) params.set('role', role);
      if (status) params.set('status', status);
      params.set('sortBy', sortBy);
      params.set('sortOrder', sortOrder);
      params.set('page', String(page));
      params.set('limit', '10');

      const res = await api.get<ApiResponse<Employee[]>>(`/employees?${params}`);
      setEmployees(res.data.data);
      setPagination(res.data.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, department, role, status, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  useEffect(() => {
    if (canManage) {
      api.get<ApiResponse<Employee[]>>('/employees?limit=100').then((res) => {
        setManagers(res.data.data);
      });
    }
  }, [canManage]);

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/employees/${id}`);
      setDeleteConfirm(null);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/employees/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert(`Import complete: ${res.data.data.created} created, ${res.data.data.failed} failed`);
      fetchEmployees();
    } catch (err) {
      console.error(err);
    }
    e.target.value = '';
  };

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Employees</h1>
          <p className="mt-1 text-sm text-muted">Manage your workforce</p>
        </div>
        {canManage && (
          <div className="flex gap-2">
            <label className="btn-secondary flex cursor-pointer items-center gap-2">
              <Upload size={16} />
              Import CSV
              <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
            </label>
            <button
              onClick={() => {
                setEditEmployee(null);
                setShowForm(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} />
              Add Employee
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="relative lg:col-span-2">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input-field pl-9"
          />
        </div>
        <select
          value={department}
          onChange={(e) => {
            setDepartment(e.target.value);
            setPage(1);
          }}
          className="input-field"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
          className="input-field"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="input-field"
        >
          <option value="">All Status</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [sb, so] = e.target.value.split('-');
            setSortBy(sb);
            setSortOrder(so);
          }}
          className="input-field"
        >
          <option value="joiningDate-desc">Newest First</option>
          <option value="joiningDate-asc">Oldest First</option>
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface">
            <tr>
              <th className="px-4 py-3 font-medium text-muted">Employee</th>
              <th className="px-4 py-3 font-medium text-muted">Department</th>
              <th className="px-4 py-3 font-medium text-muted">Role</th>
              <th className="px-4 py-3 font-medium text-muted">Manager</th>
              <th className="px-4 py-3 font-medium text-muted">Status</th>
              {canManage && <th className="px-4 py-3 font-medium text-muted">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  Loading...
                </td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted">
                  No employees found
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const imgUrl = getImageUrl(emp.profileImage);
                return (
                  <tr key={emp._id} className="border-b border-border last:border-0 hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <Link href={`/employees/${emp._id}`} className="flex items-center gap-3">
                        {imgUrl ? (
                          <img src={imgUrl} alt={emp.name} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-brand">
                            <User size={16} />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-foreground">{emp.name}</p>
                          <p className="text-xs text-muted">{emp.employeeId} · {emp.email}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{emp.department}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                        {emp.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {emp.reportingManager?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          emp.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-slate-500/10 text-slate-500'
                        )}
                      >
                        {emp.status}
                      </span>
                    </td>
                    {canManage && (
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setEditEmployee(emp);
                              setShowForm(true);
                            }}
                            className="rounded-lg p-2 text-muted hover:bg-surface hover:text-brand"
                          >
                            <Pencil size={16} />
                          </button>
                          {canDelete && (
                            <button
                              onClick={() => setDeleteConfirm(emp._id)}
                              className="rounded-lg p-2 text-muted hover:bg-red-500/10 hover:text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted">
            Showing {(pagination.page - 1) * pagination.limit + 1}–
            {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="btn-secondary flex items-center gap-1 disabled:opacity-50"
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
              className="btn-secondary flex items-center gap-1 disabled:opacity-50"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <EmployeeForm
          employee={editEmployee}
          managers={managers}
          canAssignSuperAdmin={isAdmin}
          onClose={() => {
            setShowForm(false);
            setEditEmployee(null);
          }}
          onSuccess={fetchEmployees}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold text-foreground">Confirm Delete</h3>
            <p className="mt-2 text-sm text-muted">
              This will soft-delete the employee. They will be marked as inactive.
            </p>
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
