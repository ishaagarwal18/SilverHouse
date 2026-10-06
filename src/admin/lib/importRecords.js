import { callProc, cleanErrorMessage, fetchRows } from '../api/adminApi';
import { PK_MAP } from '../config/entities';

/** Header aliases accepted in import files, mapped to their database column. */
const FIELD_ALIASES = {
  product_id: ['product_id', 'productid', 'product id', 'p_id', 'pid'],
  category_id: ['category_id', 'categoryid', 'category id', 'cat_id', 'catid'],
  category_name: ['category_name', 'category name', 'categoryname', 'category_i', 'category', 'cat_name', 'catname'],
  m_id: ['m_id', 'mid', 'make_id', 'make id', 'make_master', 'makemaster', 'make', 'make_name', 'makename', 'make name', 'making_type', 'making type'],
  name: ['name', 'category_name_val'],
  title: ['title', 'product_name', 'product name', 'productname', 'title_name'],
  purity: ['purity', 'silver_purity', 'purity_grade'],
  weight: ['weight', 'item_weight', 'wt', 'weight_gm', 'weight_g'],
  description: ['description', 'desc', 'details', 'item_description'],
  price: ['price', 'unit_price', 'mrp', 'rate', 'product_price'],
  discount: ['discount', 'disc', 'discount_percent', 'discount_%'],
  quantity: ['quantity', 'qty', 'stock', 'stock_qty', 'count'],
  ideal_for: ['ideal_for', 'idealfor', 'ideal for', 'gender', 'target_audience'],
  packaging: ['packaging', 'package', 'pack_type', 'box_type'],
  labour_cost: ['labour_cost', 'labourcost', 'labour cost', 'making_charge', 'making_cost', 'making charges'],
  actual_cost: ['actual_cost', 'actualcost', 'actual cost', 'cost_price', 'cost'],
  priority: ['priority', 'display_priority', 'prio'],
  color: ['color', 'colour', 'shade'],
  review: ['review', 'rating', 'stars', 'reviews'],
  sold: ['sold', 'sales', 'units_sold', 'items_sold'],
  image_id: ['image_id', 'imageid', 'image id', 'img_id'],
  image_url: ['image_url', 'imageurl', 'image url', 'url', 'image', 'link']
};

/** Category name synonyms used to match loosely-named import rows. */
const CATEGORY_ALIASES = {
  anklets: 'Anklets & Payal',
  payal: 'Anklets & Payal',
  bracelets: 'Bangles & Bracelets',
  bracelet: 'Bangles & Bracelets',
  bangles: 'Bangles & Bracelets',
  kadas: 'Bangles & Bracelets',
  rings: 'Silver Rings',
  ring: 'Silver Rings',
  utensils: 'Silverware',
  'silver utensils': 'Silverware',
  idols: 'Silver Idols',
  murti: 'Silver Idols',
  coins: 'Silver Coins',
  coin: 'Silver Coins',
  baby: 'Baby Silver',
  puja: 'Pooja Articles',
  pooja: 'Pooja Articles',
  spiritual: 'Spiritual Wear'
};

const normalizeKey = s => s.toLowerCase().replace(/[^a-z0-9]/g, '_');
const isBlank = v => v === undefined || v === null || String(v).trim() === '';

/** Category + make lookup tables, re-fetchable after auto-creating records. */
async function createLookups() {
  const lookups = {};
  lookups.reload = async () => {
    const [categories, makes] = await Promise.all([fetchRows('category'), fetchRows('make_master')]);
    lookups.categories = categories;
    lookups.makes = makes;
    lookups.catById = {};
    lookups.catByName = {};
    lookups.catBySlug = {};
    categories.forEach(c => {
      if (c.category_id !== undefined && c.name) {
        lookups.catById[c.category_id] = c.name;
        lookups.catByName[String(c.name).trim().toLowerCase()] = c.category_id;
        lookups.catByName[String(c.name).trim()] = c.category_id;
      }
      if (c.category_id !== undefined && c.slug) lookups.catBySlug[String(c.slug).trim().toLowerCase()] = c.category_id;
    });
    lookups.makeById = {};
    lookups.makeByName = {};
    makes.forEach(m => {
      if (m.m_id !== undefined && m.type) {
        lookups.makeById[m.m_id] = m.type;
        lookups.makeByName[String(m.type).trim().toLowerCase()] = m.m_id;
        lookups.makeByName[String(m.type).trim()] = m.m_id;
      }
    });
  };
  await lookups.reload();
  return lookups;
}

/** Matches a category by id, name, slug, alias or substring — creating it when nothing matches. */
async function resolveOrCreateCategory(raw, lk) {
  if (isBlank(raw)) return null;
  if (!isNaN(raw) && lk.catById[Number(raw)]) return Number(raw);

  const str = String(raw).trim();
  const lower = str.toLowerCase();
  if (lk.catByName[lower] !== undefined) return lk.catByName[lower];
  if (lk.catByName[str] !== undefined) return lk.catByName[str];
  if (lk.catBySlug[lower] !== undefined) return lk.catBySlug[lower];

  for (const [alias, target] of Object.entries(CATEGORY_ALIASES)) {
    if (lower === alias || lower.includes(alias)) {
      const matched = lk.catByName[target.toLowerCase()];
      if (matched) return matched;
    }
  }

  for (const c of lk.categories) {
    const cLower = String(c.name).toLowerCase();
    if (cLower.includes(lower) || lower.includes(cLower)) return c.category_id;
  }

  try {
    const slug = lower.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `cat-${Date.now()}`;
    const res = await callProc('category', 'ADD', { name: str, description: `${str} Collection`, slug, ideal_for: 'ALL' });
    if (res.success) {
      await lk.reload();
      const first = res.data?.[0];
      return (first && (first.NewCategoryId || first.category_id || first[Object.keys(first)[0]])) || lk.catByName[lower] || null;
    }
  } catch (err) {
    console.error('Auto category creation failed:', err);
  }
  return null;
}

/** Matches a make/craft by id, name, keyword or substring — creating it when nothing matches. */
async function resolveOrCreateMake(raw, lk) {
  if (isBlank(raw)) return null;
  if (!isNaN(raw) && lk.makeById[Number(raw)]) return Number(raw);

  const str = String(raw).trim();
  const lower = str.toLowerCase();
  if (lk.makeByName[lower] !== undefined) return lk.makeByName[lower];
  if (lk.makeByName[str] !== undefined) return lk.makeByName[str];

  if (lower.includes('handmade') || lower.includes('handcrafted') || lower.includes('artisan')) return 1;
  if (lower.includes('machine')) return 2;
  if (lower.includes('temple') || lower.includes('antique')) return 3;
  if (lower.includes('filigree')) return 4;
  if (lower.includes('cast') || lower.includes('chiseled')) return 5;

  for (const m of lk.makes) {
    const mLower = String(m.type).toLowerCase();
    if (mLower.includes(lower) || lower.includes(mLower)) return m.m_id;
  }

  try {
    const res = await callProc('make_master', 'ADD', { type: str });
    if (res.success) {
      await lk.reload();
      return lk.makeByName[lower] || lk.makeByName[str] || null;
    }
  } catch (err) {
    console.error('Auto make creation failed:', err);
  }
  return null;
}

/** Maps file headers to DB columns and normalises purity / audience values. */
function normalizeRowData(rawRow) {
  const clean = {};
  Object.keys(rawRow).forEach(rawKey => {
    const trimmedKey = rawKey.trim();
    if (trimmedKey === 'Remark') return;
    const lowerKey = normalizeKey(trimmedKey);
    const standard = Object.entries(FIELD_ALIASES).find(([, aliases]) => aliases.some(a => lowerKey === normalizeKey(a)))?.[0];
    const key = standard || trimmedKey;

    let val = rawRow[rawKey];
    if (typeof val === 'string') val = val.trim();
    if (isBlank(val)) return;

    if (key === 'purity' && typeof val === 'string') {
      const s = val.toLowerCase();
      clean[key] = (s.includes('99') || s.includes('pure') || s.includes('fine')) ? '99.9 Pure Silver' : '92.5 Sterling Silver';
    } else if (key === 'ideal_for' && typeof val === 'string') {
      const s = val.toLowerCase();
      if (s.startsWith('all')) clean[key] = 'ALL';
      else if (s.includes('women') || s.includes('female')) clean[key] = 'Women';
      else if (s.includes('men') || s.includes('male')) clean[key] = 'Men';
      else if (['puja', 'pooja', 'home', 'mandir', 'temple', 'idol'].some(w => s.includes(w))) clean[key] = 'Puja';
      else clean[key] = 'Unisex';
    } else {
      clean[key] = !isNaN(val) ? Number(val) : val;
    }
  });
  return clean;
}

/** Reads rows from a CSV, Excel or Word (first table) file. */
async function parseFile(file) {
  const fileName = file.name.toLowerCase();
  if (/\.(csv|xlsx|xls)$/.test(fileName)) {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    return XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  }
  if (fileName.endsWith('.docx')) {
    const mammoth = (await import('mammoth')).default;
    const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    const doc = new DOMParser().parseFromString(result.value, 'text/html');
    const table = doc.querySelector('table');
    if (!table) throw new Error('No table found in Word document.');
    const trs = Array.from(table.querySelectorAll('tr'));
    if (trs.length < 2) throw new Error('Word table must have at least 1 header row and 1 data row.');
    const headers = Array.from(trs[0].querySelectorAll('th, td')).map(c => c.textContent.trim());
    return trs.slice(1).map(tr => {
      const cells = Array.from(tr.querySelectorAll('td')).map(c => c.textContent.trim());
      const obj = {};
      headers.forEach((h, i) => {
        if (cells[i] !== undefined && cells[i] !== '') obj[h] = !isNaN(cells[i]) ? Number(cells[i]) : cells[i];
      });
      return obj;
    });
  }
  throw new Error('Unsupported file type. Use .csv, .xlsx, .xls or .docx');
}

/** Writes the annotated rows back to the original file (File System Access API) or downloads a copy. */
async function writeResults(file, fileHandle, rows) {
  const XLSX = await import('xlsx');
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  const isCsv = file.name.toLowerCase().endsWith('.csv');

  if (fileHandle) {
    try {
      const writable = await fileHandle.createWritable();
      await writable.write(isCsv ? XLSX.utils.sheet_to_csv(ws) : XLSX.write(wb, { bookType: 'xlsx', type: 'array' }));
      await writable.close();
      return { savedInPlace: true, outputName: file.name };
    } catch (err) {
      console.warn('In-place save failed (file may be open in Excel). Falling back to download:', err);
    }
  }

  const base = file.name.replace(/\.[^/.]+$/, '');
  const outputName = `${base}_with_remarks${isCsv ? '.csv' : '.xlsx'}`;
  if (isCsv) {
    const blob = new Blob([XLSX.utils.sheet_to_csv(ws)], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = outputName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  } else {
    XLSX.writeFile(wb, outputName);
  }
  return { savedInPlace: false, outputName };
}

/**
 * Imports a data file into `entity`: matches existing rows by id (or product title / category name),
 * then ADDs new rows and EDITs or RESTOCKs existing ones. Every row gets a Remark column, which is
 * saved back to the file. Returns { summary, highlightMap, savedInPlace, outputName }.
 */
export async function importRecordsFromFile({ file, fileHandle = null, entity, mode = 'EDIT' }) {
  const rows = await parseFile(file);
  if (rows.length === 0) throw new Error('No valid data rows found in file.');

  const pkField = PK_MAP[entity];
  const selectedMode = entity === 'product' ? mode : 'EDIT';
  const [existingRows, lookups] = await Promise.all([fetchRows(entity), entity === 'product' ? createLookups() : null]);

  const counts = { added: 0, edited: 0, restocked: 0, failed: 0 };
  const highlightMap = {};

  const recordSuccess = (row, targetId, kind) => {
    const map = { add: ['added', 'Added'], restock: ['restocked', 'Restocked'], edit: ['edited', 'Edited'] };
    counts[map[kind][0]]++;
    row.Remark = map[kind][1];
    if (targetId) highlightMap[targetId] = kind;
  };

  for (const row of rows) {
    delete row.Remark;
    const values = normalizeRowData(row);

    if (entity === 'product') {
      const rawCat = values.category_id ?? values.category_name ?? values.category;
      if (!isBlank(rawCat)) {
        const catId = await resolveOrCreateCategory(rawCat, lookups);
        if (!catId) {
          counts.failed++;
          row.Remark = `Validation Error: Category '${rawCat}' could not be matched or created.`;
          continue;
        }
        values.category_id = catId;
        delete values.category_name;
        delete values.category;
      }
      const rawMake = values.m_id ?? values.make_name ?? values.make;
      if (!isBlank(rawMake)) {
        const makeId = await resolveOrCreateMake(rawMake, lookups);
        if (makeId) {
          values.m_id = makeId;
          delete values.make_name;
          delete values.make;
        }
      }
    }

    Object.assign(row, values);

    let idVal = values[pkField];
    // eslint-disable-next-line eqeqeq
    let exists = !isBlank(idVal) && existingRows.some(r => r[pkField] == idVal);

    // Avoid duplicates when the id column is omitted: match by product title / category name
    if (!exists && (entity === 'product' || entity === 'category')) {
      const label = String((entity === 'product' ? (values.title || values.name) : values.name) || '').trim().toLowerCase();
      const match = label && existingRows.find(r => String((entity === 'product' ? (r.title || r.name) : r.name) || '').trim().toLowerCase() === label);
      if (match) {
        idVal = match[pkField];
        values[pkField] = idVal;
        exists = true;
      }
    }

    const opr = exists ? selectedMode : 'ADD';
    try {
      const res = await callProc(entity, opr, values, exists ? String(idVal) : null);
      if (res.success) {
        let targetId = idVal;
        if (!targetId && res.data?.length) {
          const first = res.data[0];
          targetId = first.NewProductId || first.NewCategoryId || first.NewImageId || first.NewMId || first[Object.keys(first)[0]];
        }
        if (targetId && isBlank(row[pkField])) row[pkField] = targetId;
        recordSuccess(row, targetId, !exists ? 'add' : opr === 'RESTOCK' ? 'restock' : 'edit');
      } else if (opr === 'ADD' && String(res.status || '').includes('already exists') && idVal) {
        // Record exists although it was not in the snapshot: retry as EDIT / RESTOCK
        const retry = await callProc(entity, selectedMode, values, String(idVal));
        if (retry.success) recordSuccess(row, idVal, selectedMode === 'RESTOCK' ? 'restock' : 'edit');
        else {
          counts.failed++;
          row.Remark = cleanErrorMessage(retry.status || retry.error) || 'Operation Failed';
        }
      } else {
        counts.failed++;
        row.Remark = cleanErrorMessage(res.status || res.error) || 'Operation Failed';
      }
    } catch (err) {
      counts.failed++;
      row.Remark = err.message || 'Processing Error';
    }
  }

  // Keep "Remark" as the final column
  const formattedRows = rows.map(({ Remark, ...rest }) => (Remark !== undefined ? { ...rest, Remark } : rest));
  const { savedInPlace, outputName } = await writeResults(file, fileHandle, formattedRows);

  const summary = [
    counts.added && `Added: ${counts.added}`,
    counts.edited && `Edited: ${counts.edited}`,
    counts.restocked && `Restocked: ${counts.restocked}`,
    counts.failed && `Errors: ${counts.failed}`
  ].filter(Boolean).join(', ') || 'No changes made';

  return { summary, highlightMap, savedInPlace, outputName, failed: counts.failed };
}
