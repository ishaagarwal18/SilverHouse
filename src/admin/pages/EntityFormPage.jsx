import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, FolderOpen, Image as ImageIcon, Search, Trash2, Upload } from 'lucide-react';
import { callProc, fetchRows, uploadImage, adminImageUrl, PLACEHOLDER_IMG } from '../api/adminApi';
import { AUDIENCE_OPTIONS, getEntityConfig } from '../config/entities';
import { useAdminUI } from '../context/AdminUIContext';
import ProductForm from '../components/ProductForm';
import { Button, Card, Field, FormGrid, ImageUrlField, LoadingBlock, Modal, PageHeader, Spinner } from '../components/ui';

/** Field definitions + messages for the small catalog-table forms. */
const SIMPLE_FORMS = {
  category: {
    initial: { name: '', slug: '', description: '', ideal_for: 'All', image_id: '', image_url: '' },
    newIdKeys: ['NewCategoryId', 'category_id'],
    editDescription: 'Update category details',
    addDescription: 'Enter category details to save into the database',
    saveLabel: 'Save Category'
  },
  image: {
    initial: { image_url: '' },
    newIdKeys: ['NewImageId', 'image_id'],
    editDescription: 'Update image URL',
    addDescription: 'Upload an image or paste its URL to register it in dbo.image',
    saveLabel: 'Save Image'
  },
  make_master: {
    initial: { type: '' },
    newIdKeys: ['NewMId', 'm_id'],
    editDescription: 'Update craft / make type',
    addDescription: 'Register a new craft or make type',
    saveLabel: 'Save Make Type'
  },
  purity: {
    initial: { purity: '' },
    newIdKeys: ['NewPurityId', 'id'],
    editDescription: 'Update silver purity specification',
    addDescription: 'Register a new standard silver purity option',
    saveLabel: 'Save Purity'
  },
  color: {
    initial: { color: '' },
    newIdKeys: ['NewColorId', 'id'],
    editDescription: 'Update signature finish / color',
    addDescription: 'Register a new signature color or finish option',
    saveLabel: 'Save Color'
  },
  ideal_for: {
    initial: { ideal_for: '' },
    newIdKeys: ['NewIdealForId', 'id'],
    editDescription: 'Update target audience / ideal for option',
    addDescription: 'Register a new target audience option',
    saveLabel: 'Save Target Audience'
  },
  product_image: {
    initial: { product_id: '', image_id: '' },
    addOnly: true,
    addDescription: 'Link an existing image to a product',
    saveLabel: 'Save Mapping'
  }
};

const slugify = val => val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

/** Routes: /admin/data/:entity/new and /admin/data/:entity/:id/edit */
export default function EntityFormPage() {
  const { entity, id } = useParams();
  const navigate = useNavigate();
  const cfg = getEntityConfig(entity);

  if (!cfg.hasFormPage) return <Navigate to={`/admin/data/${entity}`} replace />;

  const isEdit = Boolean(id) && entity !== 'product_image';
  const listPath = `/admin/data/${entity}`;
  const goBackToList = (targetId, action) => {
    navigate(targetId ? `${listPath}?highlightId=${targetId}&action=${action}` : listPath);
  };

  const formSpec = SIMPLE_FORMS[entity];
  const description = entity === 'product'
    ? (isEdit ? 'Update product specifications' : 'Enter product details to save into the database')
    : (isEdit ? formSpec.editDescription : formSpec.addDescription);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={isEdit ? `Edit ${cfg.singular} (#${id})` : `Add ${cfg.singular}`}
        description={description}
        icon={cfg.icon}
        actions={
          <Button as={Link} to={listPath}>
            <ArrowLeft className="w-4 h-4" /> Back to {cfg.plural}
          </Button>
        }
      />
      <Card className="p-5 sm:p-7">
        {entity === 'product'
          ? <ProductForm key={id || 'new'} productId={id || null} onSaved={(pid, wasEdit) => goBackToList(pid, wasEdit ? 'edit' : 'add')} onCancel={() => navigate(listPath)} />
          : <SimpleEntityForm key={`${entity}-${id || 'new'}`} entity={entity} id={id} isEdit={isEdit} spec={formSpec} onSaved={goBackToList} onCancel={() => navigate(listPath)} />}
      </Card>
    </div>
  );
}

function SimpleEntityForm({ entity, id, isEdit, spec, onSaved, onCancel }) {
  const { showToast } = useAdminUI();
  const [values, setValues] = useState(() => (
    entity === 'product_image' && id ? { ...spec.initial, product_id: id } : spec.initial
  ));
  const [audienceOptions, setAudienceOptions] = useState(AUDIENCE_OPTIONS);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entity === 'category') {
      fetchRows('ideal_for')
        .then(list => {
          if (Array.isArray(list) && list.length > 0) {
            setAudienceOptions(list.map(i => i.ideal_for));
          }
        })
        .catch(() => {});
    }
  }, [entity]);

  useEffect(() => {
    if (!isEdit) return undefined;
    let cancelled = false;
    fetchRows(entity, id)
      .then(rows => {
        if (cancelled) return;
        const row = rows[0];
        if (!row) {
          showToast(`Record #${id} was not found.`, true);
          return;
        }
        setValues(prev => {
          const next = { ...prev };
          Object.keys(prev).forEach(k => { if (row[k] !== null && row[k] !== undefined) next[k] = String(row[k]); });
          return next;
        });

        if (entity === 'category' && row.image_id && !row.image_url) {
          fetchRows('image', row.image_id)
            .then(imgs => {
              if (imgs?.[0]?.image_url) {
                setValues(v => ({ ...v, image_url: imgs[0].image_url }));
              }
            })
            .catch(() => {});
        }
      })
      .catch(err => !cancelled && showToast('Error loading record: ' + err.message, true))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [entity, id, isEdit, showToast]);

  const set = key => e => setValues(v => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    const tableValues = {};
    Object.entries(values).forEach(([key, raw]) => {
      if (entity === 'category' && key === 'image_url') return; // internal UI preview only
      const trimmed = String(raw ?? '').trim();
      if (trimmed !== '') tableValues[key] = !isNaN(trimmed) ? Number(trimmed) : trimmed;
    });

    try {
      const opr = isEdit ? 'EDIT' : 'ADD';
      const result = spec.addOnly
        ? await callProc(entity, 'ADD', tableValues)
        : await callProc(entity, opr, tableValues, isEdit ? String(id) : null);
      if (!result.success) throw new Error(result.status || result.error);

      let targetId = isEdit ? id : null;
      if (entity === 'product_image') targetId = tableValues.product_id;
      else if (!targetId && result.data?.length) {
        const first = result.data[0];
        targetId = spec.newIdKeys.map(k => first[k]).find(Boolean);
      }

      showToast(`${getEntityConfig(entity).singular} saved successfully!`);
      onSaved(targetId, isEdit ? 'edit' : 'add');
    } catch (err) {
      showToast(err.message, true);
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading record…" />;

  return (
    <form onSubmit={handleSubmit}>
      <FormGrid>
        {entity === 'category' && (
          <>
            <Field label="Category Name" required htmlFor="cf-name">
              <input
                id="cf-name"
                className="ad-input"
                required
                placeholder="e.g. Silver Bangles"
                value={values.name}
                onChange={e => {
                  const name = e.target.value;
                  setValues(v => ({ ...v, name, ...(isEdit ? {} : { slug: slugify(name) }) }));
                }}
              />
            </Field>
            <Field label="Slug" required htmlFor="cf-slug">
              <input id="cf-slug" className="ad-input" required placeholder="e.g. silver-bangles" value={values.slug} onChange={set('slug')} />
            </Field>
            <Field label="Description" required fullWidth htmlFor="cf-desc">
              <textarea id="cf-desc" rows={3} className="ad-input" required placeholder="Description of category..." value={values.description} onChange={set('description')} />
            </Field>
            <Field label="Ideal For" htmlFor="cf-ideal">
              <select id="cf-ideal" className="ad-input" value={values.ideal_for} onChange={set('ideal_for')}>
                {audienceOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <CategoryImageField
              imageId={values.image_id}
              imageUrl={values.image_url}
              onChange={({ imageId, imageUrl }) => {
                setValues(v => ({ ...v, image_id: imageId, image_url: imageUrl }));
              }}
            />
          </>
        )}

        {entity === 'image' && (
          <ImageUrlField
            label="Image URL / Path"
            required
            value={values.image_url}
            onChange={url => setValues(v => ({ ...v, image_url: url }))}
            placeholder="https://cdn.example.com/item.jpg or /uploads/img-123.jpg"
          />
        )}

        {entity === 'make_master' && (
          <Field label="Make / Craft Type" required htmlFor="mf-type">
            <input id="mf-type" className="ad-input" required placeholder="e.g. Handmade, Laser Cut, Filigree" value={values.type} onChange={set('type')} />
          </Field>
        )}

        {entity === 'purity' && (
          <Field label="Silver Purity Name" required htmlFor="pf-purity-name" hint="e.g. 92.5 Sterling Silver (Standard 925)">
            <input id="pf-purity-name" className="ad-input" required placeholder="e.g. 92.5 Sterling Silver (Standard 925)" value={values.purity} onChange={set('purity')} />
          </Field>
        )}

        {entity === 'color' && (
          <Field label="Color / Finish Name" required htmlFor="cf-color-name" hint="e.g. Silver, Rose Gold, Oxidised">
            <input id="cf-color-name" className="ad-input" required placeholder="e.g. Silver, Rose Gold, Oxidised" value={values.color} onChange={set('color')} />
          </Field>
        )}

        {entity === 'ideal_for' && (
          <Field label="Target Audience / Ideal For Name" required htmlFor="if-ideal-name" hint="e.g. All, Women, Men, Kids, Unisex, Puja">
            <input id="if-ideal-name" className="ad-input" required placeholder="e.g. All, Women, Men, Kids, Unisex, Puja" value={values.ideal_for} onChange={set('ideal_for')} />
          </Field>
        )}

        {entity === 'product_image' && (
          <>
            <Field label="Product ID" required htmlFor="pi-product">
              <input id="pi-product" type="number" className="ad-input" required placeholder="e.g. 102" value={values.product_id} onChange={set('product_id')} />
            </Field>
            <Field label="Image ID" required htmlFor="pi-image">
              <input id="pi-image" type="number" className="ad-input" required placeholder="e.g. 5" value={values.image_id} onChange={set('image_id')} />
            </Field>
          </>
        )}
      </FormGrid>

      <div className="mt-6 flex flex-col-reverse gap-2 border-t border-ad-border pt-4 sm:flex-row sm:justify-end">
        <Button onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? <Spinner /> : <Check className="w-4 h-4" />} {spec.saveLabel}
        </Button>
      </div>
    </form>
  );
}

/**
 * Dedicated Category Image Uploader & Chooser.
 * Allows picking/uploading a local photo, selecting from dbo.image library, or manual entry.
 */
function CategoryImageField({ imageId, imageUrl, onChange }) {
  const { showToast } = useAdminUI();
  const [uploading, setUploading] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryImages, setLibraryImages] = useState([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [manualInput, setManualInput] = useState(imageId || '');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = async file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP, etc.).', true);
      return;
    }
    setUploading(true);
    try {
      // 1. Upload photo to backend
      const uploadedUrl = await uploadImage(file);
      // 2. Register photo into dbo.image
      const res = await callProc('image', 'ADD', { image_url: uploadedUrl });
      const newId = res.data?.[0]?.NewImageId || res.data?.image_id;
      if (!newId) throw new Error('Could not register image in database');
      onChange({ imageId: String(newId), imageUrl: uploadedUrl });
      showToast(`Category photo uploaded & linked! (Image #${newId})`);
    } catch (err) {
      showToast('Image upload failed: ' + err.message, true);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileChange = e => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const handleDrop = e => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    processFile(file);
  };

  const openLibrary = async () => {
    setShowLibrary(true);
    if (libraryImages.length === 0) {
      setLoadingLibrary(true);
      try {
        const rows = await fetchRows('image');
        setLibraryImages(Array.isArray(rows) ? rows : []);
      } catch (err) {
        showToast('Failed to load image library: ' + err.message, true);
      } finally {
        setLoadingLibrary(false);
      }
    }
  };

  const handleSelectFromLibrary = img => {
    onChange({ imageId: String(img.image_id), imageUrl: img.image_url });
    setShowLibrary(false);
    showToast(`Linked Image #${img.image_id}`);
  };

  const handleRemove = () => {
    onChange({ imageId: '', imageUrl: '' });
    showToast('Photo removed.');
  };

  const handleManualApply = async () => {
    const trimmed = manualInput.trim();
    if (!trimmed) {
      onChange({ imageId: '', imageUrl: '' });
      setShowManual(false);
      return;
    }
    if (!isNaN(trimmed)) {
      try {
        const rows = await fetchRows('image', trimmed);
        const img = rows?.[0];
        if (img?.image_url) {
          onChange({ imageId: trimmed, imageUrl: img.image_url });
          showToast(`Linked Image #${trimmed}`);
        } else {
          onChange({ imageId: trimmed, imageUrl: '' });
          showToast(`Linked Image #${trimmed}`);
        }
      } catch {
        onChange({ imageId: trimmed, imageUrl: '' });
      }
    } else {
      // Direct URL string
      try {
        const res = await callProc('image', 'ADD', { image_url: trimmed });
        const newId = res.data?.[0]?.NewImageId || res.data?.image_id;
        onChange({ imageId: String(newId || ''), imageUrl: trimmed });
        showToast(`Registered and linked image!`);
      } catch (err) {
        showToast('Failed to register image: ' + err.message, true);
      }
    }
    setShowManual(false);
  };

  const filteredLibrary = libraryImages.filter(img => {
    if (!librarySearch.trim()) return true;
    const q = librarySearch.toLowerCase().trim();
    return String(img.image_id).includes(q) || String(img.image_url || '').toLowerCase().includes(q);
  });

  const hasPhoto = Boolean(imageUrl || imageId);

  return (
    <Field
      label="Category Photo (Optional)"
      htmlFor="cf-category-photo"
      hint={imageId ? `Linked to Image #${imageId}. Click "Change Photo" to upload another image.` : 'Upload a photo or pick an existing image from the gallery.'}
    >
      <input
        ref={fileInputRef}
        id="cf-category-photo"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {hasPhoto ? (
        <div className="flex items-center gap-3 rounded-xl border border-ad-border bg-ad-card/70 p-2.5 transition-all">
          <div className="relative h-18 w-18 shrink-0 overflow-hidden rounded-lg border border-ad-border bg-ad-surface shadow-xs">
            <img
              src={adminImageUrl(imageUrl || imageId)}
              alt="Category Preview"
              className="h-full w-full object-cover"
              onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }}
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                <Spinner className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-ad-primary/10 px-2 py-0.5 text-[11px] font-bold text-ad-primary">
                <Check className="w-3 h-3" /> Image #{imageId || 'Linked'}
              </span>
            </div>
            <p className="truncate text-[11.5px] text-ad-muted" title={imageUrl || `Image ID: ${imageId}`}>
              {imageUrl || `Image ID: ${imageId}`}
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-ad-primary hover:underline cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3 h-3" /> Change Photo
              </button>
              <span className="text-ad-border">•</span>
              <button
                type="button"
                disabled={uploading}
                onClick={openLibrary}
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-ad-muted hover:text-ad-text cursor-pointer disabled:opacity-50"
              >
                <FolderOpen className="w-3 h-3" /> From Gallery
              </button>
              <span className="text-ad-border">•</span>
              <button
                type="button"
                disabled={uploading}
                onClick={handleRemove}
                className="inline-flex items-center gap-1 text-[11.5px] font-semibold text-ad-danger hover:underline cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3 h-3" /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
            isDragging
              ? 'border-ad-primary bg-ad-primary/5'
              : 'border-ad-border hover:border-ad-primary/50 bg-ad-card/30'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2 py-2">
              <Spinner className="w-6 h-6 text-ad-primary" />
              <span className="text-xs font-semibold text-ad-text">Uploading photo & registering...</span>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Choose Photo
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={openLibrary}
                  className="gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> From Gallery
                </Button>
              </div>
              <p className="mt-2 text-[11px] text-ad-muted">
                Click <span className="font-semibold text-ad-text">Choose Photo</span> to select from device, or drag & drop here (JPG, PNG, WEBP)
              </p>
              <button
                type="button"
                onClick={() => setShowManual(v => !v)}
                className="mt-1 text-[10.5px] text-ad-muted hover:text-ad-primary hover:underline cursor-pointer"
              >
                {showManual ? 'Hide manual entry' : 'Or enter Image ID / URL manually'}
              </button>
            </>
          )}

          {showManual && (
            <div className="mt-3 flex w-full max-w-xs items-center gap-1.5">
              <input
                type="text"
                className="ad-input py-1 text-xs"
                placeholder="e.g. 15 or /product_image/..."
                value={manualInput}
                onChange={e => setManualInput(e.target.value)}
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleManualApply}>
                Apply
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Gallery Modal */}
      <Modal
        open={showLibrary}
        onClose={() => setShowLibrary(false)}
        title="Choose Category Photo"
        subtitle="Select an existing photo from dbo.image or upload a new one"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setShowLibrary(false);
                fileInputRef.current?.click();
              }}
              className="gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" /> Upload New Photo
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowLibrary(false)}>
              Close
            </Button>
          </div>
        }
      >
        <div className="p-4 flex flex-col gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-ad-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              className="ad-input pl-9 text-xs"
              placeholder="Search images by ID or filename..."
              value={librarySearch}
              onChange={e => setLibrarySearch(e.target.value)}
            />
          </div>

          {loadingLibrary ? (
            <div className="py-12 text-center text-ad-muted text-xs flex items-center justify-center gap-2">
              <Spinner className="w-4 h-4" /> Loading images gallery...
            </div>
          ) : filteredLibrary.length === 0 ? (
            <div className="py-12 text-center text-ad-muted text-xs">
              No matching images found.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 max-h-[55vh] overflow-y-auto p-1">
              {filteredLibrary.map(img => {
                const isSelected = String(imageId) === String(img.image_id);
                return (
                  <button
                    key={img.image_id}
                    type="button"
                    onClick={() => handleSelectFromLibrary(img)}
                    className={`group relative flex flex-col items-center rounded-xl border p-1.5 transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'border-ad-primary bg-ad-primary/10 ring-2 ring-ad-primary'
                        : 'border-ad-border bg-ad-card hover:border-ad-primary/50 hover:shadow-sm'
                    }`}
                  >
                    <div className="h-20 w-full overflow-hidden rounded-lg bg-ad-surface">
                      <img
                        src={adminImageUrl(img.image_url)}
                        alt={`Image #${img.image_id}`}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                      />
                    </div>
                    <div className="mt-1 flex w-full items-center justify-between text-[11px]">
                      <span className="font-bold text-ad-text truncate">#{img.image_id}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-ad-primary shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Modal>
    </Field>
  );
}
