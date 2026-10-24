import { callProc, cleanErrorMessage, fetchRows } from '../api/adminApi.js';
import { PK_MAP } from '../config/entities.js';

/** Header aliases accepted in import files, mapped to their database column. */
const FIELD_ALIASES = {
  product_id: ['product_id', 'productid', 'product id', 'p_id', 'pid'],
  category_id: ['category_id', 'categoryid', 'category id', 'cat_id', 'catid'],
  category_name: ['category_name', 'category name', 'categoryname', 'category_i', 'category', 'cat_name', 'catname'],
  m_id: ['m_id', 'mid', 'make_id', 'make id', 'make_master', 'makemaster', 'make', 'make_name', 'makename', 'make name', 'making_type', 'making type'],
  make_type: ['make_type', 'maketype', 'craft', 'craft_make', 'craft / make', 'craft_type'],
  name: ['name', 'category_name_val'],
  title: ['title', 'product_name', 'product name', 'productname', 'title_name', 'product title'],
  purity: ['purity', 'silver_purity', 'purity_grade'],
  weight: ['weight', 'item_weight', 'wt', 'weight_gm', 'weight_g', 'weight (grams)', 'weight_grams'],
  description: ['description', 'desc', 'details', 'item_description'],
  price: ['price', 'unit_price', 'mrp', 'rate', 'product_price', 'retail mrp', 'retail mrp (₹)', 'retail mrp (inr)'],
  discount: ['discount', 'disc', 'discount_percent', 'discount_%', 'discount (%)'],
  final_price: ['final_price', 'selling_price', 'selling price', 'selling price (₹)'],
  quantity: ['quantity', 'qty', 'stock', 'stock_qty', 'count', 'stock units', 'stock_units'],
  stock_status: ['stock_status', 'stock status'],
  ideal_for: ['ideal_for', 'idealfor', 'ideal for', 'gender', 'target_audience', 'audience', 'for', 'target audience'],
  packaging: ['packaging', 'package', 'pack_type', 'box_type'],
  labour_cost: ['labour_cost', 'labourcost', 'labour cost', 'making_charge', 'making_cost', 'making charges', 'labour cost (₹)'],
  actual_cost: ['actual_cost', 'actualcost', 'actual cost', 'cost_price', 'cost', 'actual cost (₹)'],
  margin: ['margin', 'gross_margin', 'gross margin', 'gross margin (₹)'],
  margin_pct: ['margin_pct', 'margin (%)', 'margin percent'],
  total_cost_val: ['total_cost_val', 'inventory cost val', 'inventory cost val (₹)'],
  total_retail_val: ['total_retail_val', 'inventory retail val', 'inventory retail val (₹)'],
  priority: ['priority', 'display_priority', 'prio', 'catalog priority'],
  color: ['color', 'colour', 'shade', 'finish', 'finish / color', 'color / finish'],
  review: ['review', 'rating', 'stars', 'reviews'],
  sold: ['sold', 'sales', 'units_sold', 'items_sold', 'units sold'],
  image_id: ['image_id', 'imageid', 'image id', 'img_id'],
  image_url: ['image_url', 'imageurl', 'image url', 'url', 'image', 'link']
};

/** Valid database columns accepted in Row 1 for each entity. */
export const ENTITY_VALID_COLUMNS = {
  product: [
    'product_id', 'productid', 'p_id', 'pid',
    'title', 'product_name', 'name', 'product title', 'title_name',
    'category_name', 'category_id', 'category', 'categoryid', 'cat_id', 'catid', 'cat_name',
    'make_type', 'm_id', 'mid', 'make_id', 'make', 'make_name', 'craft', 'craft_type', 'maketype',
    'purity', 'silver_purity', 'purity_grade',
    'color', 'colour', 'shade', 'finish', 'finish_color', 'color_finish',
    'ideal_for', 'idealfor', 'gender', 'target_audience', 'audience',
    'weight', 'item_weight', 'wt', 'weight_gm', 'weight_g', 'weight_grams',
    'quantity', 'qty', 'stock', 'stock_qty', 'stock_units', 'count',
    'stock_status',
    'price', 'unit_price', 'mrp', 'rate', 'product_price', 'retail_mrp',
    'discount', 'disc', 'discount_percent',
    'final_price', 'selling_price',
    'actual_cost', 'cost_price', 'cost',
    'labour_cost', 'labourcost', 'making_charge', 'making_cost', 'making_charges',
    'margin', 'gross_margin',
    'margin_pct', 'margin_percent',
    'total_cost_val', 'inventory_cost_val',
    'total_retail_val', 'inventory_retail_val',
    'sold', 'sales', 'units_sold', 'items_sold',
    'priority', 'display_priority', 'prio', 'catalog_priority',
    'packaging', 'package', 'pack_type', 'box_type',
    'description', 'desc', 'details', 'item_description',
    'review', 'rating', 'stars', 'reviews',
    'image_id', 'img_id',
    'image_url', 'imageurl', 'url', 'image', 'link',
    'remark'
  ],
  category: [
    'category_id', 'categoryid', 'cat_id',
    'name', 'category_name', 'category_name_val',
    'description', 'desc',
    'slug',
    'ideal_for', 'idealfor', 'target_audience', 'audience',
    'image_id', 'image_url', 'url', 'image',
    'custom',
    'remark'
  ],
  image: [
    'image_id', 'imageid',
    'image_url', 'imageurl', 'url', 'image', 'link',
    'remark'
  ],
  make_master: [
    'm_id', 'mid', 'make_id',
    'type', 'make_type', 'make', 'maketype', 'craft',
    'remark'
  ],
  purity: [
    'id', 'purity_id',
    'purity', 'silver_purity', 'purity_code',
    'remark'
  ],
  color: [
    'id', 'color_id',
    'color', 'colour', 'shade', 'finish',
    'remark'
  ],
  ideal_for: [
    'id',
    'ideal_for', 'idealfor', 'target_audience', 'audience',
    'remark'
  ],
  product_image: [
    'product_id', 'productid',
    'image_id', 'imageid',
    'image_url', 'url', 'image',
    'remark'
  ]
};

export function isColumnValidForEntity(rawStr, entity = 'product') {
  if (!rawStr) return true;
  const lowerKey = normalizeKey(String(rawStr).trim());
  if (lowerKey === 'remark') return true;

  const allowedList = ENTITY_VALID_COLUMNS[entity] || ENTITY_VALID_COLUMNS.product;
  if (!allowedList) return true;

  // Direct match
  if (allowedList.some(col => normalizeKey(col) === lowerKey)) return true;

  // Check if mapped via FIELD_ALIASES
  const standard = Object.entries(FIELD_ALIASES).find(([canonical, aliases]) => 
    canonical === lowerKey || aliases.some(a => normalizeKey(a) === lowerKey)
  )?.[0];

  if (standard && allowedList.some(col => normalizeKey(col) === standard)) return true;

  return false;
}

/** Admin display labels used when writing 2-row standard files. */
const DB_ADMIN_LABELS = {
  product_id: 'Product ID',
  title: 'Product Title',
  category_name: 'Category Name',
  category_id: 'Category ID',
  make_type: 'Craft / Make',
  m_id: 'Make ID',
  purity: 'Purity',
  color: 'Finish / Color',
  ideal_for: 'Target Audience',
  weight: 'Weight (Grams)',
  quantity: 'Stock Units',
  stock_status: 'Stock Status',
  price: 'Retail MRP (₹)',
  discount: 'Discount (%)',
  final_price: 'Selling Price (₹)',
  actual_cost: 'Actual Cost (₹)',
  labour_cost: 'Labour Cost (₹)',
  margin: 'Gross Margin (₹)',
  margin_pct: 'Margin (%)',
  total_cost_val: 'Inventory Cost Val (₹)',
  total_retail_val: 'Inventory Retail Val (₹)',
  sold: 'Units Sold',
  priority: 'Catalog Priority',
  packaging: 'Packaging',
  description: 'Description',
  Remark: 'Import Remark / Status'
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
      clean[key] = (s.includes('99') || s.includes('pure') || s.includes('fine'))
        ? '99.9 Pure Silver (Fine 999)'
        : '92.5 Sterling Silver (Standard 925)';
    } else if (key === 'color' && typeof val === 'string') {
      const s = val.toLowerCase();
      if (s.includes('rose')) clean[key] = 'Rose Gold';
      else if (s.includes('oxid') || s.includes('black') || s.includes('antique')) clean[key] = 'Oxidised';
      else clean[key] = 'Silver';
    } else if (key === 'ideal_for' && typeof val === 'string') {
      const s = val.toLowerCase();
      if (s.startsWith('all')) clean[key] = 'All';
      else if (s.includes('women') || s.includes('female') || s.includes('lady') || s.includes('ladies')) clean[key] = 'Women';
      else if (s.includes('men') || s.includes('male') || s.includes('gent')) clean[key] = 'Men';
      else if (s.includes('kid') || s.includes('child') || s.includes('baby')) clean[key] = 'Kids';
      else if (['puja', 'pooja', 'home', 'mandir', 'temple', 'idol'].some(w => s.includes(w))) clean[key] = 'Puja';
      else clean[key] = 'Unisex';
    } else {
      clean[key] = !isNaN(val) ? Number(val) : val;
    }
  });
  return clean;
}

/**
 * Converts a 2D sheet matrix into structured row objects:
 * - Row 1 (headerRowIdx): Contains the DATABASE COLUMN NAMES (e.g. product_id, title, price, etc.)
 *   Column checking is done against this 1st row.
 *   The column order DOES NOT matter (e.g. product_id can be in column 0, middle, or last column).
 * - Row 2 (headerRowIdx + 1): Checked to see if it contains admin display names / friendly labels.
 *   If it is an admin display label row, it is skipped and data rows begin from Row 3.
 *   If it contains actual product data (single-header file), data rows begin from Row 2.
 */
export function parseMatrixToObjects(rawMatrix, entity = 'product') {
  if (!Array.isArray(rawMatrix) || rawMatrix.length === 0) {
    const empty = [];
    empty.invalidCols = [];
    empty.colMap = {};
    return empty;
  }

  // 1. Locate Row 1: the first non-empty row containing database column names
  const headerRowIdx = rawMatrix.findIndex(row => 
    Array.isArray(row) && row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '')
  );

  if (headerRowIdx === -1) {
    const empty = [];
    empty.invalidCols = [];
    empty.colMap = {};
    return empty;
  }

  const row1 = rawMatrix[headerRowIdx];

  // 2. Map every column index to its canonical DB column name using Row 1!
  // Column checking is done strictly using this 1st row. Column order does NOT matter.
  const colMap = {};
  const invalidCols = [];

  row1.forEach((cell, idx) => {
    const rawStr = String(cell ?? '').trim();
    if (!rawStr) return;
    const lowerKey = normalizeKey(rawStr);

    if (lowerKey === 'remark') {
      colMap[idx] = 'Remark';
      return;
    }

    if (!isColumnValidForEntity(rawStr, entity)) {
      invalidCols.push(rawStr);
    }

    const standard = Object.entries(FIELD_ALIASES).find(([canonical, aliases]) => 
      canonical === lowerKey || aliases.some(a => normalizeKey(a) === lowerKey)
    )?.[0];

    colMap[idx] = standard || lowerKey || rawStr;
  });

  // 3. Inspect Row 2: Detect whether it's an admin display label row or real data
  let dataStartIdx = headerRowIdx + 1;
  if (dataStartIdx < rawMatrix.length) {
    const row2 = rawMatrix[dataStartIdx];
    if (Array.isArray(row2)) {
      let looksLikeAdminHeader = false;
      const numericCols = ['product_id', 'price', 'quantity', 'category_id', 'm_id', 'actual_cost', 'labour_cost', 'priority', 'sold', 'review', 'discount', 'weight'];

      for (let i = 0; i < row2.length; i++) {
        const dbCol = colMap[i];
        const val = row2[i];
        if (!dbCol || val === undefined || val === null || String(val).trim() === '') continue;

        const valStr = String(val).trim();
        // If a numeric database column has text like "Product ID" or "Retail MRP (₹)" or any string label in row 2:
        if (numericCols.includes(dbCol) && isNaN(Number(valStr))) {
          looksLikeAdminHeader = true;
          break;
        }

        // If string column matches an admin alias in FIELD_ALIASES:
        const lowerVal = normalizeKey(valStr);
        if (FIELD_ALIASES[dbCol] && FIELD_ALIASES[dbCol].some(a => normalizeKey(a) === lowerVal)) {
          looksLikeAdminHeader = true;
          break;
        }
      }

      // If rawMatrix has at least 3 rows: if Row 3 has data where Row 2 has text labels
      if (!looksLikeAdminHeader && rawMatrix.length > dataStartIdx + 1) {
        const row3 = rawMatrix[dataStartIdx + 1];
        if (Array.isArray(row3)) {
          for (let i = 0; i < row2.length; i++) {
            const dbCol = colMap[i];
            const v2 = String(row2[i] ?? '').trim();
            const v3 = String(row3[i] ?? '').trim();
            if (numericCols.includes(dbCol) && isNaN(Number(v2)) && !isNaN(Number(v3)) && v3 !== '') {
              looksLikeAdminHeader = true;
              break;
            }
          }
        }
      }

      if (looksLikeAdminHeader) {
        dataStartIdx = headerRowIdx + 2; // Row 2 is admin labels; data starts at Row 3
      }
    }
  }

  // 4. Extract data rows using the mapped column keys from Row 1
  const resultRows = [];
  for (let r = dataStartIdx; r < rawMatrix.length; r++) {
    const rowCells = rawMatrix[r];
    if (!Array.isArray(rowCells) || rowCells.every(c => c === undefined || c === null || String(c).trim() === '')) {
      continue; // Skip blank rows
    }

    const rowObj = {};
    let hasData = false;

    rowCells.forEach((cell, idx) => {
      const colName = colMap[idx];
      if (!colName || colName === 'Remark') return;

      let val = cell;
      if (typeof val === 'string') val = val.trim();
      if (!isBlank(val)) {
        hasData = true;
        rowObj[colName] = (!isNaN(val) && typeof val !== 'boolean') ? Number(val) : val;
      }
    });

    if (hasData) {
      resultRows.push(rowObj);
    }
  }

  resultRows.invalidCols = invalidCols;
  resultRows.colMap = colMap;
  resultRows.headerRow1 = row1;
  return resultRows;
}

/** Reads rows from a CSV, Excel or Word (first table) file using 2-row header parsing. */
async function parseFile(file, entity = 'product') {
  const fileName = file.name.toLowerCase();
  if (/\.(csv|xlsx|xls)$/.test(fileName)) {
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawMatrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    return parseMatrixToObjects(rawMatrix, entity);
  }
  if (fileName.endsWith('.docx')) {
    const mammoth = (await import('mammoth')).default;
    const result = await mammoth.convertToHtml({ arrayBuffer: await file.arrayBuffer() });
    const doc = new DOMParser().parseFromString(result.value, 'text/html');
    const table = doc.querySelector('table');
    if (!table) throw new Error('No table found in Word document.');
    const trs = Array.from(table.querySelectorAll('tr'));
    if (trs.length < 2) throw new Error('Word table must have at least 1 header row and 1 data row.');
    const rawMatrix = trs.map(tr => 
      Array.from(tr.querySelectorAll('th, td')).map(c => c.textContent.trim())
    );
    return parseMatrixToObjects(rawMatrix, entity);
  }
  throw new Error('Unsupported file type. Use .csv, .xlsx, .xls or .docx');
}

/** Writes the annotated rows back with 2-row header: Row 1 = DB cols, Row 2 = Admin display labels. */
async function writeResults(file, fileHandle, rows) {
  const XLSX = await import('xlsx');

  // Extract all unique column keys across rows, placing 'Remark' at the end
  const allKeys = [];
  rows.forEach(r => {
    Object.keys(r).forEach(k => {
      if (k !== 'Remark' && !allKeys.includes(k)) allKeys.push(k);
    });
  });
  if (rows.some(r => r.Remark !== undefined)) {
    allKeys.push('Remark');
  }

  // Row 1: DB Column Names (for future automated import checking)
  const row1_dbCols = allKeys;
  // Row 2: Admin Friendly Display Names
  const row2_adminLabels = allKeys.map(k => DB_ADMIN_LABELS[k] || k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
  // Row 3+: Data Rows in exact column order
  const dataRows = rows.map(r => allKeys.map(k => r[k] ?? ''));

  const ws = XLSX.utils.aoa_to_sheet([
    row1_dbCols,
    row2_adminLabels,
    ...dataRows
  ]);

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
  const rows = await parseFile(file, entity);
  if (rows.length === 0) throw new Error('No valid data rows found in file.');

  // Validate 1st Row: Column checking is compared strictly to Row 1
  if (rows.invalidCols && rows.invalidCols.length > 0) {
    const invalidList = rows.invalidCols.map(c => `'${c}'`).join(', ');
    const errMsg = `Validation Error: Column ${invalidList} in Row 1 does not exist in the '${entity}' table. ` +
      `The 1st row must strictly match valid database column names (e.g. category_name, title, price, quantity, etc.). ` +
      `The 2nd row can have any custom admin name according to the admin.`;

    rows.forEach(r => {
      r.Remark = errMsg;
    });
    try {
      await writeResults(file, fileHandle, rows);
    } catch { /* ignore */ }

    throw new Error(errMsg);
  }

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

    // Avoid duplicates when the id column is omitted: match by product title / category name / purity name / color name / ideal_for name
    if (!exists && (entity === 'product' || entity === 'category' || entity === 'purity' || entity === 'color' || entity === 'ideal_for')) {
      const label = String((entity === 'product' ? (values.title || values.name) : (values.name || values.purity || values.color || values.ideal_for)) || '').trim().toLowerCase();
      const match = label && existingRows.find(r => String((entity === 'product' ? (r.title || r.name) : (r.name || r.purity || r.color || r.ideal_for)) || '').trim().toLowerCase() === label);
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
