'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api, { getImageUrl } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Employee, ApiResponse } from '@/types';
import { User } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Min 2 characters'),
  phone: z.string().regex(/^[+]?[\d\s()-]{7,20}$/, 'Invalid phone'),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<Employee | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      api.get<ApiResponse<Employee>>(`/employees/${user._id}`).then((res) => {
        setProfile(res.data.data);
        reset({ name: res.data.data.name, phone: res.data.data.phone });
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    setMessage('');
    setError('');
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      if (imageFile) formData.append('profileImage', imageFile);

      await api.put(`/employees/${user._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage('Profile updated successfully');
      refreshUser();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Update failed');
    }
  };

  if (!profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand border-t-transparent" />
      </div>
    );
  }

  const imgUrl = getImageUrl(profile.profileImage);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-foreground">My Profile</h1>
      <p className="mt-1 text-sm text-muted">View and update your personal information</p>

      <div className="mt-8 max-w-xl rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-4">
          {imgUrl ? (
            <img src={imgUrl} alt={profile.name} className="h-16 w-16 rounded-full object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/10 text-brand">
              <User size={24} />
            </div>
          )}
          <div>
            <p className="font-display text-lg font-bold text-foreground">{profile.name}</p>
            <p className="text-sm text-muted">{profile.role} · {profile.employeeId}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-3 rounded-lg bg-surface p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Email</span>
            <span className="text-foreground">{profile.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Department</span>
            <span className="text-foreground">{profile.department}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Designation</span>
            <span className="text-foreground">{profile.designation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Manager</span>
            <span className="text-foreground">{profile.reportingManager?.name || 'None'}</span>
          </div>
        </div>

        {message && (
          <div className="mb-4 rounded-lg bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Full Name</label>
            <input {...register('name')} className="input-field" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Phone</label>
            <input {...register('phone')} className="input-field" />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="input-field"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
