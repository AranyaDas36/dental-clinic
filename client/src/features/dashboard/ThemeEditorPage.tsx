import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWebsiteDraft, updateWebsiteDraft } from '@/api/admin';
import {
  APPROVED_BODY_FONTS,
  APPROVED_HEADING_FONTS,
  BUTTON_STYLES,
  SHADOW_LEVELS,
  type ApprovedBodyFont,
  type ApprovedHeadingFont,
  type ButtonStyle,
  type ShadowLevel,
  type ThemeTokens,
} from '@dental/shared';

const PRESET_PALETTES: Array<{ name: string; colors: ThemeTokens['colors'] }> = [
  {
    name: 'Sage & Forest (Classic)',
    colors: {
      primary: '#5F7A6A',
      secondary: '#3D5A5B',
      accent: '#C4A484',
      background: '#F7F4EF',
      surface: '#FFFFFF',
      text: '#2C2C2C',
      mutedText: '#5C5C5C',
    },
  },
  {
    name: 'Clinical Navy & Ice',
    colors: {
      primary: '#1E3A8A',
      secondary: '#0F172A',
      accent: '#38BDF8',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      text: '#0F172A',
      mutedText: '#64748B',
    },
  },
  {
    name: 'Warm Slate & Amber',
    colors: {
      primary: '#292524',
      secondary: '#44403C',
      accent: '#D97706',
      background: '#FAFAF9',
      surface: '#FFFFFF',
      text: '#1C1917',
      mutedText: '#78716C',
    },
  },
  {
    name: 'Teal Oasis & Sand',
    colors: {
      primary: '#134E4A',
      secondary: '#0F766E',
      accent: '#14B8A6',
      background: '#F0FDFA',
      surface: '#FFFFFF',
      text: '#134E4A',
      mutedText: '#0D9488',
    },
  },
];

export function ThemeEditorPage() {
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<ThemeTokens | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'website', 'draft'],
    queryFn: fetchWebsiteDraft,
  });

  useEffect(() => {
    if (data?.draft.theme) {
      setTheme(data.draft.theme);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!data || !theme) return;
      return updateWebsiteDraft({
        expectedDraftVersion: data.draftVersion,
        clinic: data.clinic,
        draft: {
          ...data.draft,
          theme,
        },
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      setFeedback(`Theme updated in draft (v${res?.draftVersion})`);
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to save theme';
      setFeedback(`Error: ${msg}`);
    },
  });

  if (isLoading || !theme) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-stone-200">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent" />
          <p className="mt-2 text-xs text-stone-500">Loading clinic theme tokens...</p>
        </div>
      </div>
    );
  }

  function handleColorChange(key: keyof ThemeTokens['colors'], val: string) {
    if (!theme) return;
    setTheme({
      ...theme,
      colors: {
        ...theme.colors,
        [key]: val,
      },
    });
  }

  function applyPreset(preset: (typeof PRESET_PALETTES)[number]) {
    if (!theme) return;
    setTheme({
      ...theme,
      colors: {
        ...preset.colors,
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Theme &amp; Brand Customizer</h2>
          <p className="text-xs text-stone-500">
            Control clinic palette colors, approved typography, border radii, and component shadows
            with live preview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {feedback && (
            <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              {feedback}
            </span>
          )}
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving Theme...' : 'Save Theme Draft'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Side: Controls */}
        <div className="space-y-6 lg:col-span-7">
          {/* Preset Palettes */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-3">
              Preset Color Palettes
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PRESET_PALETTES.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="rounded-xl border border-stone-200 p-2.5 text-left hover:border-emerald-500 hover:shadow-xs transition"
                >
                  <div className="flex gap-1 mb-2">
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.colors.primary }}
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.colors.secondary }}
                    />
                    <span
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: preset.colors.accent }}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-stone-800 leading-tight">
                    {preset.name}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Color Pickers */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              Color Tokens
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  { key: 'primary', label: 'Primary Brand Color' },
                  { key: 'secondary', label: 'Secondary / Sub-headings' },
                  { key: 'accent', label: 'Accent / Highlights' },
                  { key: 'background', label: 'Page Background' },
                  { key: 'surface', label: 'Card Surface' },
                  { key: 'text', label: 'Primary Text' },
                  { key: 'mutedText', label: 'Muted Text' },
                ] as const
              ).map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between rounded-xl border border-stone-100 p-2.5 bg-stone-50/50"
                >
                  <div className="text-xs">
                    <span className="font-semibold text-stone-800">{label}</span>
                    <p className="text-[10px] font-mono text-stone-500">{theme.colors[key]}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={theme.colors[key]}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="h-8 w-8 cursor-pointer rounded-lg border border-stone-300 bg-transparent p-0"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Typography & Geometry */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              Typography &amp; Geometry
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-stone-700">Heading Font</label>
                <select
                  value={theme.fonts.heading}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      fonts: { ...theme.fonts, heading: e.target.value as ApprovedHeadingFont },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none"
                >
                  {APPROVED_HEADING_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Body Font</label>
                <select
                  value={theme.fonts.body}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      fonts: { ...theme.fonts, body: e.target.value as ApprovedBodyFont },
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none"
                >
                  {APPROVED_BODY_FONTS.map((font) => (
                    <option key={font} value={font}>
                      {font}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Button Style</label>
                <select
                  value={theme.buttonStyle}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      buttonStyle: e.target.value as ButtonStyle,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none"
                >
                  {BUTTON_STYLES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">Card Shadow</label>
                <select
                  value={theme.cardShadow}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      cardShadow: e.target.value as ShadowLevel,
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none"
                >
                  {SHADOW_LEVELS.map((sh) => (
                    <option key={sh} value={sh}>
                      {sh}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Button Radius (px)
                </label>
                <input
                  type="number"
                  min="0"
                  max="32"
                  value={theme.cornerRadiusPx}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      cornerRadiusPx: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700">
                  Card Radius (px)
                </label>
                <input
                  type="number"
                  min="0"
                  max="40"
                  value={theme.cardRadiusPx}
                  onChange={(e) =>
                    setTheme({
                      ...theme,
                      cardRadiusPx: Number(e.target.value),
                    })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Component Preview */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Live Theme Preview</span>
              <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                Interactive
              </span>
            </h3>

            {/* Preview Box using current theme styles */}
            <div
              className="rounded-2xl p-6 border transition-colors duration-300 space-y-4"
              style={{
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                fontFamily: theme.fonts.body,
              }}
            >
              {/* Mini Hero Header */}
              <div className="space-y-1">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: theme.colors.accent }}
                >
                  Family &amp; Cosmetic Dental Care
                </span>
                <h4
                  className="text-lg font-bold leading-tight"
                  style={{
                    color: theme.colors.primary,
                    fontFamily: theme.fonts.heading,
                  }}
                >
                  Gentle, Precision Dentistry
                </h4>
                <p className="text-xs" style={{ color: theme.colors.mutedText }}>
                  Experience state-of-the-art care with transparent INR pricing.
                </p>
              </div>

              {/* Sample Card */}
              <div
                className="p-4 transition-all"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderRadius: `${theme.cardRadiusPx}px`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold" style={{ color: theme.colors.secondary }}>
                    Dental Health Check-up
                  </span>
                  <span className="text-xs font-extrabold" style={{ color: theme.colors.primary }}>
                    ₹ 800
                  </span>
                </div>
                <p className="text-[11px]" style={{ color: theme.colors.mutedText }}>
                  Comprehensive digital examination, ultrasonic cleaning &amp; consultation.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-semibold text-white shadow-xs"
                    style={{
                      backgroundColor: theme.colors.primary,
                      borderRadius: `${theme.cornerRadiusPx}px`,
                    }}
                  >
                    Book Appointment
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-xs font-semibold"
                    style={{
                      backgroundColor: 'transparent',
                      color: theme.colors.secondary,
                      border: `1px solid ${theme.colors.secondary}40`,
                      borderRadius: `${theme.cornerRadiusPx}px`,
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>

              {/* Sample Review */}
              <div
                className="p-3 border text-xs space-y-1"
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: `${theme.colors.primary}15`,
                  borderRadius: `${theme.cardRadiusPx}px`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px]" style={{ color: theme.colors.primary }}>
                    Ananya Sharma
                  </span>
                  <span className="text-amber-500 text-xs">★★★★★</span>
                </div>
                <p className="text-[11px] italic" style={{ color: theme.colors.mutedText }}>
                  "Completely painless root canal treatment. Truly top-tier clinic experience!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
