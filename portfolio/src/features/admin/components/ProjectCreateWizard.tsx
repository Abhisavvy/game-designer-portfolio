'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  Rocket,
} from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { AdminProjectGuidePanel } from './AdminProjectGuidePanel';

const basicsSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Use lowercase letters, numbers, and hyphens only'),
  title: z.string().min(1, 'Title is required'),
  tag: z.string().min(1, 'Tag is required'),
  blurb: z.string().min(1, 'Blurb is required').max(200, 'Max 200 characters'),
  externalUrl: z
    .union([z.literal(''), z.string().url('Must be a valid URL')])
    .optional(),
});

const narrativeSchema = z.object({
  subtitle: z.string().min(1, 'Subtitle is required'),
  problem: z.string().min(1, 'Required'),
  approach: z.string().min(1, 'Required'),
  constraints: z.string().min(1, 'Required'),
  outcome: z.string().min(1, 'Required'),
  contributions: z.string().optional(),
});

const fullSchema = basicsSchema.merge(narrativeSchema);
type WizardForm = z.infer<typeof fullSchema>;

const STEPS = [
  { id: 'basics', label: 'Basics', hint: 'Slug, listing card, URLs' },
  { id: 'story', label: 'Case study', hint: 'Problem → outcome' },
  { id: 'publish', label: 'Publish', hint: 'Write site-content.ts' },
  { id: 'hero', label: 'Hero image', hint: 'Same file for card + page' },
  { id: 'done', label: 'Live', hint: 'Verify on site' },
] as const;

export function ProjectCreateWizard() {
  const [step, setStep] = useState(0);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [publishing, setPublishing] = useState(false);

  const form = useForm<WizardForm>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      slug: '',
      title: '',
      tag: '',
      blurb: '',
      externalUrl: '',
      subtitle: '',
      problem: '',
      approach: '',
      constraints: '',
      outcome: '',
      contributions: '',
    },
    mode: 'onBlur',
  });

  const { register, handleSubmit, trigger, watch, formState } = form;
  const slug = watch('slug');

  const goNext = async () => {
    setMessage(null);
    if (step === 0) {
      const ok = await trigger(['slug', 'title', 'tag', 'blurb', 'externalUrl']);
      if (!ok) return;
      setStep(1);
      return;
    }
    if (step === 1) {
      const ok = await trigger([
        'subtitle',
        'problem',
        'approach',
        'constraints',
        'outcome',
        'contributions',
      ]);
      if (!ok) return;
      setStep(2);
    }
  };

  const goBack = () => {
    setMessage(null);
    setStep((s) => Math.max(0, s - 1));
  };

  const onPublish = handleSubmit(async (data) => {
    setPublishing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/content/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: {
            slug: data.slug,
            title: data.title,
            tag: data.tag,
            blurb: data.blurb,
            href: `/work/${data.slug}`,
            externalUrl: data.externalUrl?.trim() || '',
          },
          caseStudy: {
            title: data.title,
            subtitle: data.subtitle,
            problem: data.problem,
            approach: data.approach,
            constraints: data.constraints,
            outcome: data.outcome,
            contributions: data.contributions?.trim() || undefined,
            links: [],
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage({
          type: 'error',
          text: json.error || 'Could not create project',
        });
        return;
      }
      setCreatedSlug(data.slug);
      setMessage({
        type: 'success',
        text: 'Project and case study are saved. Upload a hero so the card and case study match.',
      });
      setStep(3);
    } catch {
      setMessage({ type: 'error', text: 'Network error — try again.' });
    } finally {
      setPublishing(false);
    }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-col gap-2">
        <Link
          href="/admin/projects"
          className="inline-flex w-fit items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All projects
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Add a project</h1>
        <p className="max-w-2xl text-slate-600">
          Guided flow from listing metadata to a published case study — no manual
          file moves or path mismatches between the home grid and /work pages.
        </p>
      </div>

      <ol className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {STEPS.map((s, i) => {
          const active = i === step;
          const done = i < step;
          return (
            <li key={s.id}>
              <div
                className={`rounded-lg px-3 py-2 text-sm ${
                  active
                    ? 'bg-orange-50 font-semibold text-orange-900 ring-1 ring-orange-200'
                    : done
                      ? 'bg-slate-100 text-slate-600'
                      : 'text-slate-400'
                }`}
              >
                <span className="mr-1 font-mono text-xs opacity-70">{i + 1}</span>
                {s.label}
                <span className="mt-0.5 block text-[11px] font-normal opacity-80">
                  {s.hint}
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      {message ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-green-200 bg-green-50 text-green-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          {message.text}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">Basics</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Slug
                  </label>
                  <input
                    {...register('slug')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                    placeholder="e.g. economy-pass"
                  />
                  {formState.errors.slug ? (
                    <p className="mt-1 text-xs text-red-600">
                      {formState.errors.slug.message}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-slate-500">
                      Case study URL:{' '}
                      <span className="font-mono">
                        /work/{slug || 'your-slug'}
                      </span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Title
                  </label>
                  <input
                    {...register('title')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                  {formState.errors.title ? (
                    <p className="mt-1 text-xs text-red-600">
                      {formState.errors.title.message}
                    </p>
                  ) : null}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Tag line (card pill)
                  </label>
                  <input
                    {...register('tag')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                  {formState.errors.tag ? (
                    <p className="mt-1 text-xs text-red-600">
                      {formState.errors.tag.message}
                    </p>
                  ) : null}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Blurb (max 200)
                  </label>
                  <textarea
                    rows={3}
                    {...register('blurb')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                  {formState.errors.blurb ? (
                    <p className="mt-1 text-xs text-red-600">
                      {formState.errors.blurb.message}
                    </p>
                  ) : null}
                </div>
                <div className="md:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    External URL (optional)
                  </label>
                  <input
                    type="url"
                    {...register('externalUrl')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                    placeholder="https://…"
                  />
                  {formState.errors.externalUrl ? (
                    <p className="mt-1 text-xs text-red-600">
                      {formState.errors.externalUrl.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Case study copy
              </h2>
              <p className="text-sm text-slate-600">
                You can refine this later in the project editor; this step captures
                enough structure to ship a real /work page.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Subtitle
                  </label>
                  <input
                    {...register('subtitle')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                  {formState.errors.subtitle ? (
                    <p className="mt-1 text-xs text-red-600">
                      {formState.errors.subtitle.message}
                    </p>
                  ) : null}
                </div>
                {(
                  [
                    ['problem', 'Problem'],
                    ['approach', 'Approach'],
                    ['constraints', 'Constraints'],
                    ['outcome', 'Outcome'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-medium text-slate-700">
                      {label}
                    </label>
                    <textarea
                      rows={key === 'outcome' ? 4 : 3}
                      {...register(key)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                    />
                    {formState.errors[key] ? (
                      <p className="mt-1 text-xs text-red-600">
                        {formState.errors[key]?.message as string}
                      </p>
                    ) : null}
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Contributions (optional)
                  </label>
                  <textarea
                    rows={3}
                    {...register('contributions')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Review & publish
              </h2>
              <p className="text-sm text-slate-600">
                This writes your project and case study into{' '}
                <code className="rounded bg-slate-100 px-1 text-xs">
                  site-content.ts
                </code>{' '}
                and triggers the usual dev hot reload / deploy hook.
              </p>
              <dl className="grid gap-2 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Slug</dt>
                  <dd className="font-mono text-slate-900">{watch('slug')}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Title</dt>
                  <dd className="text-right text-slate-900">{watch('title')}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Work URL</dt>
                  <dd className="font-mono text-slate-900">
                    /work/{watch('slug')}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                disabled={publishing}
                onClick={() => onPublish()}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {publishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Rocket className="h-4 w-4" />
                )}
                {publishing ? 'Publishing…' : 'Publish project'}
              </button>
            </div>
          )}

          {step === 3 && createdSlug && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Hero image (required for polish)
              </h2>
              <p className="text-sm text-slate-600">
                Upload once — it becomes{' '}
                <code className="rounded bg-slate-100 px-1 text-xs">
                  hero-image.*
                </code>{' '}
                and updates the shared poster path for the grid card and case study
                hero.
              </p>
              <ImageUploader
                projectSlug={createdSlug}
                category="hero"
                maxFiles={1}
                onUploadComplete={() => {
                  setMessage({
                    type: 'success',
                    text: 'Hero saved. Open the site to confirm the card and case study match.',
                  });
                  setStep(4);
                }}
              />
            </div>
          )}

          {step === 4 && createdSlug && (
            <div className="space-y-4 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h2 className="text-xl font-semibold text-slate-900">
                Project is on the site
              </h2>
              <p className="text-sm text-slate-600">
                Grid and case study both read from the same content source. Tweak
                copy or gallery any time from the editor.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href={`/work/${createdSlug}`}
                  className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700"
                >
                  View case study
                </Link>
                <Link
                  href={`/admin/projects/${createdSlug}`}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Open full editor
                </Link>
                <Link
                  href="/"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                >
                  Home grid
                </Link>
              </div>
            </div>
          )}

          {step < 2 ? (
            <div className="flex justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={goBack}
                disabled={step === 0}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="flex justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="flex justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm text-slate-600 hover:text-slate-900"
              >
                ← Back to review
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="text-sm text-slate-500 underline hover:text-slate-800"
              >
                Skip for now
              </button>
            </div>
          ) : null}
        </div>

        <AdminProjectGuidePanel className="lg:sticky lg:top-6 lg:self-start" />
      </div>
    </div>
  );
}
