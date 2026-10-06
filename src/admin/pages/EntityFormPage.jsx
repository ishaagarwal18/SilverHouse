import React, { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { callProc, fetchRows } from '../api/adminApi';
import { AUDIENCE_OPTIONS, getEntityConfig } from '../config/entities';
import { useAdminUI } from '../context/AdminUIContext';
import ProductForm from '../components/ProductForm';
import { Button, Card, Field, FormGrid, ImageUrlField, LoadingBlock, PageHeader, Spinner } from '../components/ui';

/** Field definitions + messages for the small catalog-table forms. */
const SIMPLE_FORMS = {
  category: {
    initial: { name: '', slug: '', description: '', ideal_for: 'ALL', image_id: '' },
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
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

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
                {AUDIENCE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Image ID (Optional)" htmlFor="cf-image" hint="Enter the Image ID from the Images table (dbo.image) to map this category to an image.">
              <input id="cf-image" type="number" min="1" className="ad-input" placeholder="e.g. 1" value={values.image_id} onChange={set('image_id')} />
            </Field>
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
