'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { Employee, DEPARTMENTS, ROLES, STATUSES } from '@/types';
import { X } from 'lucide-react';

const schema = z.object({
  employeeId: z.string().min(1, 'Required'),
  name: z.string().min(2, 'Min 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z.string().regex(/^[+]?[\d\s()-]{7,20}$/, 'Invalid phone'),
  password: z.string().min(6, 'Min 6 characters').optional().or(z.literal('')),
  department: z.enum(DEPARTMENTS as unknown as [string, ...string[]]),
  designation: z.string().min(1, 'Required'),
  salary: z.number({ message: 'Must be a number' }).min(0, 'Must be positive'),
  joiningDate: z.string().min(1, 'Required'),
  status: z.enum(['Active', 'Inactive']),
  role: z.enum(['Super Admin', 'HR Manager', 'Employee']),
  reportingManager: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  employee?: Employee | null;
  managers: Employee[];
  canAssignSuperAdmin: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EmployeeForm({
  employee,
  managers,
  canAssignSuperAdmin,
  onClose,
  onSuccess,
}: Props) {
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const isEdit = !!employee;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: employee
      ? {
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          department: employee.department as FormData['department'],
          designation: employee.designation,
          salary: employee.salary,
          joiningDate: employee.joiningDate.split('T')[0],
          status: employee.status,
          role: employee.role,
          reportingManager: employee.reportingManager?._id || '',
        }
      : {
          status: 'Active',
          role: 'Employee',
          joiningDate: new Date().toISOString().split('T')[0],
        },
  });

  const availableRoles = canAssignSuperAdmin
    ? ROLES
    : ROLES.filter((r) => r !== 'Super Admin');

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          formData.append(key, String(value));
        }
      });
      if (imageFile) formData.append('profileImage', imageFile);
      if (isEdit && !data.password) formData.delete('password');

      const url = isEdit ? `/employees/${employee._id}` : '/employees';
      const method = isEdit ? 'put' : 'post';
      await api[method](url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold text-foreground">
            {isEdit ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1 text-muted hover:bg-surface">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 sm:grid-cols-2">
          {[
            { name: 'employeeId', label: 'Employee ID', type: 'text' },
            { name: 'name', label: 'Full Name', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'phone', label: 'Phone', type: 'tel' },
            { name: 'designation', label: 'Designation', type: 'text' },
            { name: 'salary', label: 'Salary', type: 'number' },
            { name: 'joiningDate', label: 'Joining Date', type: 'date' },
          ].map(({ name, label, type }) => (
            <div key={name}>
              <label className="mb-1 block text-sm font-medium text-muted">{label}</label>
              <input
                type={type}
                {...register(name as keyof FormData, name === 'salary' ? { valueAsNumber: true } : undefined)}
                className="input-field"
              />
              {errors[name as keyof FormData] && (
                <p className="mt-1 text-xs text-red-500">
                  {errors[name as keyof FormData]?.message}
                </p>
              )}
            </div>
          ))}

          {!isEdit && (
            <div>
              <label className="mb-1 block text-sm font-medium text-muted">Password</label>
              <input type="password" {...register('password')} className="input-field" />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Department</label>
            <select {...register('department')} className="input-field">
              <option value="">Select department</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.department && (
              <p className="mt-1 text-xs text-red-500">{errors.department.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Role</label>
            <select {...register('role')} className="input-field">
              {availableRoles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Status</label>
            <select {...register('status')} className="input-field">
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Reporting Manager</label>
            <select {...register('reportingManager')} className="input-field">
              <option value="">None</option>
              {managers
                .filter((m) => m._id !== employee?._id)
                .map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.employeeId})
                  </option>
                ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1 block text-sm font-medium text-muted">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="input-field"
            />
          </div>

          <div className="flex gap-3 sm:col-span-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
