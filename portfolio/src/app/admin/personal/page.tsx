'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

const personalInfoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  role: z.string().min(1, 'Role is required'),
  tagline: z.string().min(1, 'Tagline is required'),
  location: z.string().min(1, 'Location is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(1, 'Phone is required'),
  linkedin: z.string().url('Valid LinkedIn URL required'),
  bio: z.string().optional(),
});

type PersonalInfoForm = z.infer<typeof personalInfoSchema>;

async function errorDetail(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as {
      error?: string;
      details?: { fieldErrors?: Record<string, string[]> };
    };
    if (data.details?.fieldErrors) {
      const parts = Object.entries(data.details.fieldErrors).flatMap(([k, msgs]) =>
        msgs.map((m) => `${k}: ${m}`),
      );
      if (parts.length) return parts.join(' · ');
    }
    if (typeof data.error === 'string') return data.error;
  } catch {
    /* ignore */
  }
  return `Request failed (${response.status})`;
}

export default function PersonalInfoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PersonalInfoForm>({
    resolver: zodResolver(personalInfoSchema),
  });

  const loadPersonalInfo = useCallback(async () => {
    try {
      setLoading(true);
      setMessage(null);
      const response = await fetch('/api/admin/content/personal');
      if (response.ok) {
        const data = (await response.json()) as { personal?: PersonalInfoForm };
        if (data.personal) {
          reset(data.personal);
        } else {
          setMessage({ type: 'error', text: 'Invalid response: missing personal data' });
        }
      } else {
        setMessage({ type: 'error', text: await errorDetail(response) });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to load personal info' });
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    void loadPersonalInfo();
  }, [loadPersonalInfo]);

  const onSubmit = async (data: PersonalInfoForm) => {
    try {
      setSaving(true);
      setMessage(null);
      const response = await fetch('/api/admin/content/personal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personal: data }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Personal info updated successfully' });
        reset(data);
      } else {
        setMessage({ type: 'error', text: await errorDetail(response) });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to update personal info' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-lg text-gray-600">Loading personal info...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">Personal Information</h1>
        <p className="text-gray-600">
          Update your personal details and contact information.
        </p>
      </div>

      {message ? (
        <div
          className={`mb-6 flex items-center space-x-2 rounded-lg border p-4 ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50'
              : 'border-red-200 bg-red-50'
          }`}
          role={message.type === 'error' ? 'alert' : 'status'}
        >
          {message.type === 'success' ? (
            <CheckCircle className="text-green-500" size={20} aria-hidden />
          ) : (
            <AlertCircle className="text-red-500" size={20} aria-hidden />
          )}
          <span
            className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}
          >
            {message.text}
          </span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Basic Information</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="personal-name">
                Full Name
              </label>
              <input
                id="personal-name"
                type="text"
                {...register('name')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.name ? (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="personal-role">
                Role/Title
              </label>
              <input
                id="personal-role"
                type="text"
                {...register('role')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.role ? (
                <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="personal-tagline">
              Tagline
            </label>
            <input
              id="personal-tagline"
              type="text"
              {...register('tagline')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.tagline ? (
              <p className="mt-1 text-sm text-red-500">{errors.tagline.message}</p>
            ) : null}
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="personal-location">
              Location
            </label>
            <input
              id="personal-location"
              type="text"
              {...register('location')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.location ? (
              <p className="mt-1 text-sm text-red-500">{errors.location.message}</p>
            ) : null}
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="personal-bio">
              Bio/Summary
            </label>
            <textarea
              id="personal-bio"
              rows={4}
              {...register('bio')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.bio ? (
              <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
            ) : null}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Contact Information</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="personal-email">
                Email
              </label>
              <input
                id="personal-email"
                type="email"
                {...register('email')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.email ? (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="personal-phone">
                Phone
              </label>
              <input
                id="personal-phone"
                type="tel"
                {...register('phone')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              {errors.phone ? (
                <p className="mt-1 text-sm text-red-500">{errors.phone.message}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-gray-700" htmlFor="personal-linkedin">
              LinkedIn URL
            </label>
            <input
              id="personal-linkedin"
              type="url"
              {...register('linkedin')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {errors.linkedin ? (
              <p className="mt-1 text-sm text-red-500">{errors.linkedin.message}</p>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!isDirty || saving}
            className="flex items-center space-x-2 rounded-lg bg-orange-600 px-6 py-3 text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={20} aria-hidden />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
