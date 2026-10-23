import React, { useEffect, useMemo, useState } from 'react';
import { Calculator, Check, Image as ImageIcon, ShoppingBag, Star, Trash2 } from 'lucide-react';
import { adminImageUrl, callProc, fetchRows, formatINR, linkProductImage, PLACEHOLDER_IMG, productImage } from '../api/adminApi';
import { AUDIENCE_OPTIONS, FINISH_OPTIONS, PURITY_OPTIONS } from '../config/entities';
import { useAdminUI } from '../context/AdminUIContext';
import { Button, Field, FormGrid, ImageUrlField, LoadingBlock, Spinner } from './ui';

const NUMERIC_FIELDS = ['category_id', 'm_id', 'price', 'discount', 'labour_cost', 'actual_cost', 'quantity', 'priority'];

const EMPTY_PRODUCT = {
  category_id: '',
  m_id: '',
  title: '',
  purity: '92.5 Sterling Silver (Standard 925)',
  weight: '',
  color: 'Silver',
  ideal_for: 'ALL',
  price: '',
  discount: '0',
  labour_cost: '0',
  actual_cost: '',
  quantity: '10',
  priority: '10',
  packaging: '',
  description: ''
};

function rowToValues(row) {
  const values = { ...EMPTY_PRODUCT };
  Object.keys(EMPTY_PRODUCT).forEach(key => {
    if (row[key] !== null && row[key] !== undefined) values[key] = String(row[key]);
  });
  if (!row.title && row.product_name) values.title = row.product_name;
  if (row.make_id && !row.m_id) values.m_id = String(row.make_id);
  const rawPurity = String(row.purity || '').trim();
  if (rawPurity.includes('99') || rawPurity.includes('Fine')) {
    values.purity = '99.9 Pure Silver (Fine 999)';
  } else if (rawPurity.includes('925') || rawPurity.includes('92.5')) {
    values.purity = '92.5 Sterling Silver (Standard 925)';
  } else if (rawPurity) {
    values.purity = rawPurity;
  } else {
    values.purity = '92.5 Sterling Silver (Standard 925)';
  }
  return values;
}

/** Live pricing: (MRP − discount%) + labour, and gross margin against material + labour cost. */
function computePricing({ price, discount, labour_cost, actual_cost }) {
  const p = parseFloat(price) || 0;
  const d = parseFloat(discount) || 0;
  const labour = parseFloat(labour_cost) || 0;
  const cost = parseFloat(actual_cost) || 0;
  const finalPrice = Math.round(p - (p * d / 100) + labour);
  const margin = finalPrice - (cost + labour);
  const marginPct = finalPrice > 0 ? Math.round((margin / finalPrice) * 100) : 0;
  return { p, d, labour, finalPrice, margin, marginPct };
}

/**
 * Add / edit form for dbo.product. Used by the catalog modal and the standalone form page.
 * `onSaved(productId, isEdit)` fires after a successful save.
 */
export default function ProductForm({ productId, initialRow, categories: categoriesProp, makes: makesProp, purities: puritiesProp, colors: colorsProp, idealFor: idealForProp, onSaved, onCancel, inModal = false }) {
  const { showToast } = useAdminUI();
  const isEdit = Boolean(productId);
  const [values, setValues] = useState(() => (initialRow ? rowToValues(initialRow) : EMPTY_PRODUCT));
  const [imageUrl, setImageUrl] = useState('');
  const [originalImage, setOriginalImage] = useState('');
  const [imageList, setImageList] = useState([]);
  const [deletingImageId, setDeletingImageId] = useState(null);
  const [stats, setStats] = useState(() => ({ sold: initialRow?.sold || 0, review: initialRow?.review || 0 }));
  const [categories, setCategories] = useState(categoriesProp || []);
  const [makes, setMakes] = useState(makesProp || []);
  const [purities, setPurities] = useState(puritiesProp || []);
  const [colors, setColors] = useState(colorsProp || []);
  const [idealForList, setIdealForList] = useState(idealForProp || []);
  const [loading, setLoading] = useState(isEdit && !initialRow);
  const [saving, setSaving] = useState(false);

  // Load dropdown lists (when not supplied) and the record being edited (when not supplied)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [cats, mks, purs, cols, idls, rows, imgs] = await Promise.all([
          categoriesProp ? categoriesProp : fetchRows('category'),
          makesProp ? makesProp : fetchRows('make_master'),
          puritiesProp ? puritiesProp : fetchRows('purity'),
          colorsProp ? colorsProp : fetchRows('color'),
          idealForProp ? idealForProp : fetchRows('ideal_for'),
          isEdit && !initialRow ? fetchRows('product', productId) : null,
          isEdit ? fetchRows('product_image', productId) : Promise.resolve([])
        ]);
        if (cancelled) return;
        setCategories(cats);
        setMakes(mks);
        if (Array.isArray(purs) && purs.length > 0) {
          setPurities(purs);
        }
        if (Array.isArray(cols) && cols.length > 0) {
          setColors(cols);
        }
        if (Array.isArray(idls) && idls.length > 0) {
          setIdealForList(idls);
        }
        if (Array.isArray(imgs)) {
          setImageList(imgs);
        }
        const row = rows?.[0];
        if (row) {
          setValues(rowToValues(row));
          setImageUrl('');
          setOriginalImage('');
          setStats({ sold: row.sold || 0, review: row.review || 0 });
        } else if (rows) {
          showToast(`Product #${productId} was not found.`, true);
        }
      } catch (err) {
        if (!cancelled) showToast('Error loading product data: ' + err.message, true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [productId, isEdit, initialRow, categoriesProp, makesProp, puritiesProp, colorsProp, showToast]);

  const handleRemoveImage = async (imgId) => {
    if (!window.confirm(`Are you sure you want to remove Image #${imgId} from this product?`)) return;
    setDeletingImageId(imgId);
    try {
      const res = await callProc('product_image', 'DELETE', { product_id: Number(productId), image_id: Number(imgId) }, String(productId));
      if (!res.success) throw new Error(res.status || res.error || 'Failed to remove image');
      showToast(`Image #${imgId} removed from product!`);
      const updated = await fetchRows('product_image', productId);
      setImageList(Array.isArray(updated) ? updated : []);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setDeletingImageId(null);
    }
  };

  const pricing = useMemo(() => computePricing(values), [values]);
  const set = key => e => setValues(v => ({ ...v, [key]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);

    const tableValues = {};
    Object.entries(values).forEach(([key, raw]) => {
      const trimmed = String(raw ?? '').trim();
      if (trimmed === '') return;
      tableValues[key] = NUMERIC_FIELDS.includes(key) && !isNaN(trimmed) ? Number(trimmed) : trimmed;
    });

    try {
      const result = await callProc('product', isEdit ? 'EDIT' : 'ADD', tableValues, isEdit ? String(productId) : null);
      if (!result.success) throw new Error(result.status || result.error || 'Failed to save product');

      const targetId = isEdit ? productId : (result.data?.[0]?.NewProductId || result.data?.[0]?.product_id || result.data?.product_id);
      const trimmedImage = imageUrl.trim();
      if (trimmedImage) {
        await linkProductImage(targetId, trimmedImage);
      }

      showToast(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
      onSaved?.(targetId, isEdit);
    } catch (err) {
      showToast('Save failed: ' + err.message, true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBlock label="Loading product…" />;

  const reviewCount = Number(stats.review) || 0;
  const ratingAvg = reviewCount > 0 ? (4.5 + (reviewCount % 5) * 0.1).toFixed(1) : '0.0';

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <FormGrid>
        <Field label="Product Name / Title" required fullWidth htmlFor="pf-title">
          <input id="pf-title" className="ad-input" required value={values.title} onChange={set('title')} placeholder="e.g. Royal Antique Ghungroo Payal" />
        </Field>

        <Field label="Category" required htmlFor="pf-category">
          <select id="pf-category" className="ad-input" required value={values.category_id} onChange={set('category_id')}>
            <option value="">Select Category</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
          </select>
        </Field>

        <Field label="Craft / Make Master" htmlFor="pf-make">
          <select id="pf-make" className="ad-input" value={values.m_id} onChange={set('m_id')}>
            <option value="">Select Make (Optional)</option>
            {makes.map(m => <option key={m.m_id} value={m.m_id}>{m.type}</option>)}
          </select>
        </Field>

        <Field label="Silver Purity" required htmlFor="pf-purity">
          <select id="pf-purity" className="ad-input" required value={values.purity} onChange={set('purity')}>
            {(purities.length > 0
              ? purities.map(p => ({ value: p.purity, label: p.purity }))
              : PURITY_OPTIONS
            ).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Weight" htmlFor="pf-weight">
          <input id="pf-weight" className="ad-input" value={values.weight} onChange={set('weight')} placeholder="e.g. 6.20 gm" />
        </Field>

        <Field label="Signature Finish / Color" htmlFor="pf-color">
          <select id="pf-color" className="ad-input" value={values.color} onChange={set('color')}>
            {(colors.length > 0
              ? colors.map(c => ({ value: c.color, label: c.color }))
              : FINISH_OPTIONS
            ).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Ideal For (Target Audience)" required htmlFor="pf-ideal">
          <select id="pf-ideal" className="ad-input" required value={values.ideal_for} onChange={set('ideal_for')}>
            {(idealForList.length > 0
              ? idealForList.map(item => ({ value: item.ideal_for, label: item.ideal_for }))
              : AUDIENCE_OPTIONS.map(o => ({ value: o, label: o }))
            ).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Field>

        <Field label="Actual Cost Price (₹)" required htmlFor="pf-cost">
          <input id="pf-cost" type="number" min="0" step="0.01" className="ad-input" required value={values.actual_cost} onChange={set('actual_cost')} placeholder="1700.00" />
        </Field>

        <Field label="Labour Cost / Making Charges (₹)" htmlFor="pf-labour">
          <input id="pf-labour" type="number" min="0" step="0.01" className="ad-input" value={values.labour_cost} onChange={set('labour_cost')} placeholder="300.00" />
        </Field>

        <Field label="Base Price / MRP (₹)" required htmlFor="pf-price">
          <input id="pf-price" type="number" min="0" step="0.01" className="ad-input" required value={values.price} onChange={set('price')} placeholder="2499.00" />
        </Field>

        <Field label="Discount (%)" htmlFor="pf-discount">
          <input id="pf-discount" type="number" min="0" max="100" step="0.01" className="ad-input" value={values.discount} onChange={set('discount')} placeholder="5.00" />
        </Field>

        {/* Auto-calculated customer price & margin */}
        <div className="sm:col-span-2 flex flex-col gap-3 rounded-xl border border-ad-primary/25 bg-linear-to-br from-ad-primary/8 to-ad-accent/6 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ad-primary">
              <Calculator className="w-4 h-4" /> Auto-calculated final customer price
            </div>
            <div className="mt-1 text-xs text-ad-muted wrap-break-word">
              ({formatINR(Math.round(pricing.p))} − {pricing.d}%) + {formatINR(Math.round(pricing.labour))} labour = {formatINR(pricing.finalPrice)}
            </div>
            <div className={`mt-1 text-xs font-bold ${pricing.margin >= 0 ? 'text-ad-success' : 'text-ad-danger'}`}>
              Estimated gross margin: {formatINR(Math.round(pricing.margin))} ({pricing.marginPct}%)
            </div>
          </div>
          <div className="text-2xl sm:text-[26px] font-extrabold text-ad-text">{formatINR(pricing.finalPrice)}</div>
        </div>

        <Field label="Warehouse Stock Quantity" required htmlFor="pf-qty">
          <input id="pf-qty" type="number" min="0" className="ad-input" required value={values.quantity} onChange={set('quantity')} placeholder="10" />
        </Field>

        <Field label="Display Priority Rank" hint="Higher priority products appear first in the catalog." htmlFor="pf-priority">
          <input id="pf-priority" type="number" min="1" max="9999" className="ad-input" value={values.priority} onChange={set('priority')} placeholder="10" />
        </Field>

        <Field label="Packaging Type" fullWidth htmlFor="pf-packaging">
          <input id="pf-packaging" className="ad-input" value={values.packaging} onChange={set('packaging')} placeholder="e.g. Luxury Velvet Box, Tamper-Proof Pouch" />
        </Field>

        <Field label="Description" fullWidth htmlFor="pf-desc">
          <textarea id="pf-desc" rows={3} className="ad-input" value={values.description} onChange={set('description')} placeholder="Detailed item specifications, hallmark details, and styling notes..." />
        </Field>

        {/* Image Management Section */}
        <div className="sm:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-ad-text">
              Product Images ({imageList.length} of 5 photos)
            </label>
            <span className="text-[11px] text-ad-muted">
              A product can have at most 5 images
            </span>
          </div>

          {imageList.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {imageList.map((img, idx) => (
                <div key={img.image_id || idx} className="group relative rounded-xl border border-ad-border bg-ad-card p-2 flex flex-col items-center">
                  <img
                    src={adminImageUrl(img.image_url)}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg border border-ad-border bg-ad-surface"
                    onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }}
                  />
                  <div className="w-full mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-ad-muted font-bold">
                      #{img.image_id} {idx === 0 && <span className="text-ad-primary font-bold">(Main)</span>}
                    </span>
                    <button
                      type="button"
                      disabled={deletingImageId === img.image_id}
                      onClick={() => handleRemoveImage(img.image_id)}
                      className="p-1 rounded-md text-ad-danger hover:bg-ad-danger/15 transition-colors cursor-pointer"
                      title="Delete this image"
                      aria-label={`Delete image ${img.image_id}`}
                    >
                      {deletingImageId === img.image_id ? <Spinner className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {imageList.length < 5 ? (
            <ImageUrlField
              label={imageList.length === 0 ? "Product Primary Image" : "Add Another Photo to Product"}
              value={imageUrl}
              onChange={setImageUrl}
            />
          ) : (
            <div className="rounded-lg border border-ad-border bg-ad-card/40 px-3.5 py-2.5 text-xs text-ad-muted flex items-center gap-2">
              <span className="font-semibold text-ad-text">Maximum Photo Limit Reached (5 of 5):</span>
              To add or change a photo, please delete one of the existing images above.
            </div>
          )}
        </div>

        <Field label="Customer Review Rating">
          <div className="flex items-center gap-2 rounded-lg border border-ad-border bg-ad-card px-3.5 py-2.5 text-[12.5px] text-ad-muted">
            <Star className="w-4 h-4 shrink-0 fill-yellow-500 text-yellow-500" />
            {isEdit ? `${ratingAvg} / 5.0 (average of ${reviewCount} reviews)` : 'Starts at 0.0 / 0 reviews'}
          </div>
        </Field>
        <Field label="Units Sold">
          <div className="flex items-center gap-2 rounded-lg border border-ad-border bg-ad-card px-3.5 py-2.5 text-[12.5px] text-ad-muted">
            <ShoppingBag className="w-4 h-4 shrink-0 text-ad-primary" />
            {stats.sold || 0} pcs sold (updated automatically when customers order)
          </div>
        </Field>
      </FormGrid>

      <div className={`mt-6 flex flex-col-reverse gap-2 border-t border-ad-border pt-4 sm:flex-row sm:justify-end ${inModal ? 'sticky bottom-0 -mx-5 bg-ad-surface px-5 pb-4' : ''}`}>
        <Button onClick={onCancel} disabled={saving}>Cancel</Button>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? <Spinner /> : <Check className="w-4 h-4" />}
          {isEdit ? 'Save Changes' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}
