import React, { useEffect, useState } from 'react';
import { CircleCheck, CircleX, Clock, Image as ImageIcon, Inbox, LoaderCircle, Trash2, TriangleAlert, X } from 'lucide-react';
import { adminImageUrl, PLACEHOLDER_IMG, uploadImage } from '../api/adminApi';
import { useAdminUI } from '../context/AdminUIContext';

const BUTTON_VARIANTS = {
  primary: 'bg-ad-primary text-white hover:bg-ad-primary-hover shadow-sm shadow-ad-primary/25',
  secondary: 'bg-ad-card text-ad-text border border-ad-border hover:bg-ad-hover',
  danger: 'bg-ad-danger text-white hover:brightness-95 shadow-sm shadow-ad-danger/25',
  ghost: 'text-ad-muted hover:text-ad-text hover:bg-ad-card'
};

const BUTTON_SIZES = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-[13px] gap-2',
  icon: 'p-2.5'
};

export function Button({ variant = 'secondary', size = 'md', as: Component = 'button', className = '', children, ...props }) {
  const extra = Component === 'button' && !props.type ? { type: 'button' } : {};
  return (
    <Component
      {...extra}
      {...props}
      className={`inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${BUTTON_SIZES[size]} ${className}`}
    >
      {children}
    </Component>
  );
}

export function Spinner({ className = 'w-4 h-4' }) {
  return <LoaderCircle className={`animate-spin ${className}`} />;
}

/** Title block at the top of each admin page, with optional actions on the right. */
export function PageHeader({ title, description, icon: Icon, actions, children }) {
  return (
    <div className="mb-5 sm:mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <h1 className="flex items-center gap-2 text-xl sm:text-2xl font-bold tracking-tight text-ad-text">
          {Icon && <Icon className="w-6 h-6 shrink-0 text-ad-primary" />}
          <span className="truncate">{title}</span>
        </h1>
        {description && <p className="mt-1 text-[13px] text-ad-muted">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 lg:justify-end">{actions}</div>}
    </div>
  );
}

export function Card({ className = '', children, ...props }) {
  return (
    <div {...props} className={`rounded-xl border border-ad-border bg-ad-surface shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({ icon: Icon = Inbox, title, description, children }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center text-center px-6 py-14">
      <Icon className="w-10 h-10 text-ad-muted mb-3" />
      <h3 className="text-base font-bold text-ad-text">{title}</h3>
      {description && <p className="mt-1.5 max-w-md text-[13px] text-ad-muted">{description}</p>}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}

export function LoadingBlock({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-[13px] font-semibold text-ad-muted">
      <Spinner /> {label}
    </div>
  );
}

/** Accessible modal dialog: closes on Escape and backdrop click; full-height sheet on phones. */
export function Modal({ open, onClose, title, subtitle, icon, size = 'lg', tone, children, footer }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  const width = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl' }[size];

  return (
    <div
      className="fixed inset-0 z-80 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm sm:p-4"
      onMouseDown={e => e.target === e.currentTarget && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        className={`flex w-full ${width} max-h-[92vh] flex-col overflow-hidden rounded-t-2xl sm:rounded-2xl border border-ad-border bg-ad-surface shadow-2xl`}
      >
        <div className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${tone === 'danger' ? 'border-ad-danger/25' : 'border-ad-border'}`}>
          <div className="flex min-w-0 items-center gap-3">
            {icon}
            <div className="min-w-0">
              <h3 className={`text-base font-bold ${tone === 'danger' ? 'text-ad-danger' : 'text-ad-text'}`}>{title}</h3>
              {subtitle && <p className="mt-0.5 text-xs text-ad-muted">{subtitle}</p>}
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-ad-muted hover:bg-ad-card hover:text-ad-text cursor-pointer" aria-label="Close dialog">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-ad-border bg-ad-card/50 px-5 py-3.5 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalBody({ children, className = '' }) {
  return <div className={`ad-scroll flex-1 overflow-y-auto px-5 py-5 ${className}`}>{children}</div>;
}

/** Confirmation dialog for permanent deletes. `details` renders the item preview. */
export function ConfirmDeleteModal({ open, title, subtitle, details, confirmLabel = 'Delete', busy, onConfirm, onClose }) {
  return (
    <Modal
      open={open}
      onClose={busy ? undefined : onClose}
      size="md"
      tone="danger"
      title={title}
      subtitle={subtitle}
      icon={
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ad-danger/12 text-ad-danger">
          <Trash2 className="w-5 h-5" />
        </div>
      }
      footer={
        <>
          <Button onClick={onClose} disabled={busy}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} disabled={busy}>
            {busy ? <Spinner /> : <Trash2 className="w-4 h-4" />}
            <span>{busy ? 'Deleting…' : confirmLabel}</span>
          </Button>
        </>
      }
    >
      <ModalBody>
        {details}
        <div className="mt-4 flex gap-2.5 rounded-lg border border-ad-danger/30 bg-ad-danger/8 p-3 text-[12.5px] leading-relaxed text-ad-danger">
          <TriangleAlert className="w-4.5 h-4.5 shrink-0" />
          <span><strong>Permanent action:</strong> this cannot be undone. The database record(s) and any associated data will be permanently erased.</span>
        </div>
      </ModalBody>
    </Modal>
  );
}

/** Full-screen image viewer with a thumbnail strip when several images are passed. */
export function ImageLightbox({ images, startIndex = 0, title = 'Image Preview', onClose }) {
  const [index, setIndex] = useState(startIndex);
  useEffect(() => setIndex(startIndex), [startIndex, images]);

  useEffect(() => {
    if (!images?.length) return undefined;
    const onKey = e => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIndex(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIndex(i => (i - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [images, onClose]);

  if (!images?.length) return null;

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/85 p-3 sm:p-6" onClick={onClose}>
      <div className="flex w-full max-w-5xl flex-col items-center rounded-2xl border border-white/10 bg-slate-900/95 p-4 sm:p-5 shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex w-full items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-indigo-300">
            <ImageIcon className="w-4 h-4" /> {title} {images.length > 1 && `(${index + 1}/${images.length})`}
          </span>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white cursor-pointer" aria-label="Close preview">
            <X className="w-5 h-5" />
          </button>
        </div>
        <img
          src={adminImageUrl(images[index])}
          alt={`${title} ${index + 1}`}
          className="max-h-[68vh] w-auto max-w-full rounded-lg object-contain"
          onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }}
        />
        {images.length > 1 && (
          <div className="mt-3 flex max-w-full gap-2 overflow-x-auto p-1">
            {images.map((src, i) => (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                className={`shrink-0 rounded-md overflow-hidden cursor-pointer ${i === index ? 'ring-2 ring-indigo-400' : 'opacity-70 hover:opacity-100'}`}
              >
                <img src={adminImageUrl(src)} alt="" className="h-12 w-12 object-cover" onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Label + control wrapper used by every admin form. */
export function Field({ label, required, hint, fullWidth, htmlFor, children }) {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${fullWidth ? 'sm:col-span-2' : ''}`}>
      {label && (
        <label htmlFor={htmlFor} className="text-xs font-semibold text-ad-text">
          {label} {required && <span className="text-ad-danger">*</span>}
        </label>
      )}
      {children}
      {hint && <small className="text-[11.5px] text-ad-muted">{hint}</small>}
    </div>
  );
}

export function FormGrid({ children }) {
  return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">{children}</div>;
}

/** Text URL input + device upload + live thumbnail preview. */
export function ImageUrlField({ label = 'Image', value, onChange, required, name = 'image_url', placeholder = '/images/example.jpg or https://...' }) {
  const { showToast } = useAdminUI();
  const [uploading, setUploading] = useState(false);

  const handleFile = async e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
      showToast('Image uploaded successfully!');
    } catch (err) {
      showToast('Image upload failed: ' + err.message, true);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <Field label={label} required={required} fullWidth htmlFor={`field-${name}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-ad-border bg-ad-card">
          {value
            ? <img src={adminImageUrl(value)} alt="Preview" className="h-full w-full object-cover" onError={e => { e.currentTarget.src = PLACEHOLDER_IMG; }} />
            : <ImageIcon className="w-7 h-7 text-ad-muted" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <input
            id={`field-${name}`}
            name={name}
            type="text"
            className="ad-input"
            value={value}
            required={required}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
          />
          <span className="flex items-center gap-1.5 text-[11px] text-ad-muted">
            {uploading ? <><Spinner className="w-3 h-3" /> Uploading…</> : 'Or choose a photo from your device:'}
          </span>
          <input type="file" accept="image/*" className="ad-input" onChange={handleFile} disabled={uploading} />
        </div>
      </div>
    </Field>
  );
}

const DECISION_STYLES = {
  processing: { icon: Clock, label: 'Processing', cls: 'bg-ad-warning/15 text-ad-warning border-ad-warning/30' },
  accepted: { icon: CircleCheck, label: 'Accepted', cls: 'bg-ad-success/15 text-ad-success border-ad-success/30' },
  rejected: { icon: CircleX, label: 'Rejected', cls: 'bg-ad-danger/15 text-ad-danger border-ad-danger/30' }
};

/** Pill showing a custom order's artisan decision. */
export function DecisionBadge({ status }) {
  const style = DECISION_STYLES[String(status).toLowerCase()] || DECISION_STYLES.processing;
  const Icon = style.icon;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${style.cls}`}>
      <Icon className="w-3.5 h-3.5" /> {style.label}
    </span>
  );
}

export function PaymentBadge({ status }) {
  const isPaid = String(status).toUpperCase() === 'PAID';
  return (
    <span className={`inline-block whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase ${isPaid ? 'bg-ad-success/15 text-ad-success border-ad-success/30' : 'bg-ad-warning/15 text-ad-warning border-ad-warning/30'}`}>
      {status}
    </span>
  );
}

/** Segmented pill buttons (single choice). */
export function PillGroup({ options, value, onChange, size = 'sm' }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map(opt => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition-colors cursor-pointer ${size === 'sm' ? 'px-3 py-1 text-xs' : 'px-3.5 py-2 text-[13px]'} ${active ? 'border-ad-primary bg-ad-primary text-white' : 'border-ad-border bg-ad-surface text-ad-muted hover:text-ad-text hover:border-ad-primary/50'}`}
          >
            {opt.icon && <opt.icon className="w-3.5 h-3.5" />}
            {opt.label}
            {opt.count !== undefined && <span className={`rounded-full px-1.5 text-[10.5px] ${active ? 'bg-white/20' : 'bg-ad-card'}`}>{opt.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
