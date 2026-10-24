import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAdminService,
  deleteAdminService,
  fetchAdminMedia,
  fetchAdminServices,
  updateAdminService,
  type AdminServiceItem,
} from '@/api/admin';
import type { ServiceInput } from '@dental/shared';

function formatServicePrice(service: AdminServiceItem): string {
  if (service.priceType === 'quote') return 'Contact for pricing';
  if (
    service.priceType === 'fixed' &&
    service.price != null &&
    Number.isFinite(service.price) &&
    service.price >= 0
  ) {
    return `₹${service.price.toLocaleString('en-IN')}`;
  }
  if (
    service.priceType === 'starting_at' &&
    service.minPrice != null &&
    Number.isFinite(service.minPrice) &&
    service.minPrice >= 0
  ) {
    return `Starting at ₹${service.minPrice.toLocaleString('en-IN')}`;
  }
  if (
    service.priceType === 'range' &&
    service.minPrice != null &&
    service.maxPrice != null &&
    Number.isFinite(service.minPrice) &&
    Number.isFinite(service.maxPrice) &&
    service.minPrice >= 0 &&
    service.maxPrice >= service.minPrice
  ) {
    return `₹${service.minPrice.toLocaleString('en-IN')} – ₹${service.maxPrice.toLocaleString('en-IN')}`;
  }
  return 'Contact clinic';
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ServicesManagerPage() {
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState<AdminServiceItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<ServiceInput>>({
    name: '',
    slug: '',
    category: 'General Dentistry',
    shortDescription: '',
    description: '',
    priceType: 'quote',
    price: null,
    minPrice: null,
    maxPrice: null,
    currency: 'INR',
    isFeatured: false,
    isPublished: true,
    displayOrder: 1,
    imageMediaId: null,
  });
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'services'],
    queryFn: () => fetchAdminServices({ pageSize: 50 }),
  });

  const mediaQuery = useQuery({
    queryKey: ['admin', 'media'],
    queryFn: () => fetchAdminMedia({ pageSize: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (input: ServiceInput) => createAdminService(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'services'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to save service');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ServiceInput> }) =>
      updateAdminService(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'services'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Failed to update service');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminService(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'services'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'services'] });
    },
  });

  function resetForm() {
    setEditingService(null);
    setFormData({
      name: '',
      slug: '',
      category: 'General Dentistry',
      shortDescription: '',
      description: '',
      priceType: 'quote',
      price: null,
      minPrice: null,
      maxPrice: null,
      currency: 'INR',
      isFeatured: false,
      isPublished: true,
      displayOrder: (data?.items.length || 0) + 1,
      imageMediaId: null,
    });
    setError(null);
  }

  function handleOpenCreate() {
    resetForm();
    setIsModalOpen(true);
  }

  function handleOpenEdit(service: AdminServiceItem) {
    setEditingService(service);
    setFormData({
      name: service.name,
      slug: service.slug,
      category: service.category,
      shortDescription: service.shortDescription,
      description: service.description,
      priceType: service.priceType,
      price: service.price,
      minPrice: service.minPrice,
      maxPrice: service.maxPrice,
      currency: 'INR',
      isFeatured: service.isFeatured,
      isPublished: service.isPublished,
      displayOrder: service.displayOrder,
      imageMediaId: service.imageMediaId,
    });
    setError(null);
    setIsModalOpen(true);
  }

  function handleTogglePublish(service: AdminServiceItem) {
    updateMutation.mutate({
      id: service.id,
      input: { isPublished: !service.isPublished },
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.name?.trim()) {
      setError('Service name is required');
      return;
    }

    const price = formData.price;
    const minPrice = formData.minPrice;
    const maxPrice = formData.maxPrice;
    if (formData.priceType === 'fixed' && (price == null || !Number.isFinite(price) || price < 0)) {
      setError('Enter a valid non-negative fixed price.');
      return;
    }
    if (
      formData.priceType === 'starting_at' &&
      (minPrice == null || !Number.isFinite(minPrice) || minPrice < 0)
    ) {
      setError('Enter a valid non-negative starting price.');
      return;
    }
    if (
      formData.priceType === 'range' &&
      (minPrice == null ||
        maxPrice == null ||
        !Number.isFinite(minPrice) ||
        !Number.isFinite(maxPrice) ||
        minPrice < 0 ||
        maxPrice < minPrice)
    ) {
      setError('Enter valid minimum and maximum prices; the maximum must be at least the minimum.');
      return;
    }

    const payload: ServiceInput = {
      name: formData.name.trim(),
      slug: formData.slug?.trim() || slugify(formData.name),
      category: formData.category?.trim() || 'General Dentistry',
      shortDescription: formData.shortDescription?.trim() || 'Professional dental care',
      description: formData.description?.trim() || formData.shortDescription?.trim() || '',
      priceType: formData.priceType || 'fixed',
      price: formData.priceType === 'fixed' ? (price ?? null) : null,
      minPrice:
        formData.priceType === 'starting_at' || formData.priceType === 'range'
          ? (minPrice ?? null)
          : null,
      maxPrice: formData.priceType === 'range' ? (maxPrice ?? null) : null,
      currency: 'INR',
      isFeatured: !!formData.isFeatured,
      isPublished: formData.isPublished !== false,
      displayOrder: Number(formData.displayOrder) || 1,
      imageMediaId: formData.imageMediaId ?? null,
      seoTitle: null,
      seoDescription: null,
    };

    if (editingService) {
      updateMutation.mutate({ id: editingService.id, input: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-stone-200">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent" />
          <p className="mt-2 text-xs text-stone-500">Loading dental treatments...</p>
        </div>
      </div>
    );
  }

  const services = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Dental Services &amp; Treatments</h2>
          <p className="text-xs text-stone-500">
            Create, price, and organize treatments shown to prospective patients on the clinic
            website.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition"
        >
          + Add New Treatment
        </button>
      </div>

      {/* Services Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Treatment Name &amp; Slug</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">INR Pricing</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {services.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-stone-400">
                  No treatments registered yet. Click "+ Add New Treatment" above.
                </td>
              </tr>
            ) : (
              services.map((svc) => (
                <tr key={svc.id} className="hover:bg-stone-50/60 transition">
                  <td className="py-3 px-4 text-center font-bold text-stone-400">
                    {svc.displayOrder}
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-stone-900 flex items-center gap-1.5">
                      {svc.name}
                      {svc.isFeatured && (
                        <span className="rounded-full bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0.2 font-semibold">
                          ★ Featured
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-stone-400 font-mono">/{svc.slug}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className="rounded-lg bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-700">
                      {svc.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-stone-800">{formatServicePrice(svc)}</td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(svc)}
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition ${
                        svc.isPublished
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                      }`}
                    >
                      {svc.isPublished ? 'Live' : 'Hidden'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(svc)}
                      className="rounded-lg border border-stone-200 px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${svc.name}?`)) {
                          deleteMutation.mutate(svc.id);
                        }
                      }}
                      className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add / Edit Service */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {editingService ? `Edit: ${editingService.name}` : 'Add New Dental Treatment'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-stone-700">Treatment Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        name,
                        slug: !editingService ? slugify(name) : prev.slug,
                      }));
                    }}
                    placeholder="e.g. Ultrasonic Dental Scaling"
                    className="mt-1 w-full rounded-xl border border-stone-300 p-2 focus:border-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: slugify(e.target.value) })}
                    placeholder="ultrasonic-dental-scaling"
                    className="mt-1 w-full rounded-xl border border-stone-300 p-2 font-mono text-stone-600 focus:border-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g. Hygiene, Preventive, Cosmetic, Endodontics"
                    className="mt-1 w-full rounded-xl border border-stone-300 p-2 focus:border-emerald-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700">Display Order</label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) =>
                      setFormData({ ...formData, displayOrder: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-xl border border-stone-300 p-2 focus:border-emerald-700 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700">Short Summary (Card)</label>
                <input
                  type="text"
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="One sentence description for patient service cards"
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2 focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700">Full Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Comprehensive explanation of the clinical procedure, duration, and patient benefits..."
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2 focus:border-emerald-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700">Service Image</label>
                <select
                  value={formData.imageMediaId ?? ''}
                  onChange={(e) =>
                    setFormData({ ...formData, imageMediaId: e.target.value || null })
                  }
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2 focus:border-emerald-700 focus:outline-none"
                >
                  <option value="">No image</option>
                  {(mediaQuery.data?.items ?? []).map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.altText || item.publicId}
                    </option>
                  ))}
                </select>
                {mediaQuery.isError && (
                  <p className="mt-1 text-xs text-red-700">Unable to load uploaded images.</p>
                )}
              </div>

              {/* Pricing in INR */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-800">INR Pricing Configuration</span>
                  <span className="text-[10px] text-stone-500 font-mono">Currency: INR (₹)</span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block font-medium text-stone-600">Price Structure</label>
                    <select
                      value={formData.priceType}
                      onChange={(e) => {
                        const priceType = e.target.value as ServiceInput['priceType'];
                        setFormData((previous) => ({
                          ...previous,
                          priceType,
                          price: priceType === 'fixed' ? previous.price : null,
                          minPrice:
                            priceType === 'starting_at' || priceType === 'range'
                              ? previous.minPrice
                              : null,
                          maxPrice: priceType === 'range' ? previous.maxPrice : null,
                        }));
                      }}
                      className="mt-1 w-full rounded-xl border border-stone-300 p-2 focus:border-emerald-700 focus:outline-none"
                    >
                      <option value="fixed">Fixed Price (₹)</option>
                      <option value="starting_at">Starting At (₹)</option>
                      <option value="range">Price Range (₹ Min – ₹ Max)</option>
                      <option value="quote">Price on request</option>
                    </select>
                  </div>

                  {formData.priceType === 'fixed' && (
                    <div>
                      <label className="block font-medium text-stone-600">Exact Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formData.price ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="800"
                        className="mt-1 w-full rounded-xl border border-stone-300 p-2 focus:border-emerald-700 focus:outline-none"
                      />
                    </div>
                  )}

                  {formData.priceType === 'starting_at' && (
                    <div>
                      <label className="block font-medium text-stone-600">Starting Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={formData.minPrice ?? ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            minPrice: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        placeholder="1500"
                        className="mt-1 w-full rounded-xl border border-stone-300 p-2 focus:border-emerald-700 focus:outline-none"
                      />
                    </div>
                  )}

                  {formData.priceType === 'range' && (
                    <>
                      <div>
                        <label className="block font-medium text-stone-600">Minimum (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={formData.minPrice ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              minPrice: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          placeholder="2000"
                          className="mt-1 w-full rounded-xl border border-stone-300 p-2 focus:border-emerald-700 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-stone-600">Maximum (₹)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={formData.maxPrice ?? ''}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              maxPrice: e.target.value ? Number(e.target.value) : null,
                            })
                          }
                          placeholder="5000"
                          className="mt-1 w-full rounded-xl border border-stone-300 p-2 focus:border-emerald-700 focus:outline-none"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                    className="rounded text-emerald-800"
                  />
                  <span className="font-semibold text-stone-700">Published on Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded text-emerald-800"
                  />
                  <span className="font-semibold text-stone-700">Featured Highlight</span>
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-stone-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-stone-200 px-4 py-2 text-stone-600 hover:bg-stone-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="rounded-xl bg-emerald-800 px-4 py-2 text-white font-semibold shadow hover:bg-emerald-700 disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingService
                      ? 'Update Treatment'
                      : 'Create Treatment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
