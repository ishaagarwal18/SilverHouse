/**
 * Comprehensive Product Excel Export Utility for Silver House Admin.
 *
 * Generates an executive-grade, multi-sheet workbook designed to reduce admin workload:
 * - Sheet 1: "Product Inventory" — Full line-item detail with formatted pricing, margins, stock status, urgency flags.
 * - Sheet 2: "Category & Financial Summary" — Aggregated inventory units, retail value, cost value, profit margin by category.
 * - Sheet 3: "Stock Reorder List" — Pre-filtered for Low Stock (<5) and Out of Stock items for quick vendor purchase orders.
 * - Sheet 4: "Filter & Export Info" — Audit trail of applied filters and export metadata.
 */

export async function exportProductsToExcel({
  products = [],
  allProducts = [],
  categories = [],
  makes = [],
  filterInfo = {},
  scope = 'filtered', // 'filtered' | 'all' | 'selected' | 'restock'
  includeSummary = true,
  includeReorderSheet = true
}) {
  if (!products || products.length === 0) {
    throw new Error('No products available to export.');
  }

  const XLSX = await import('xlsx');

  const catMap = new Map();
  categories.forEach(c => {
    if (c.category_id !== undefined) catMap.set(String(c.category_id), c.name || c.category_name);
    if (c.name) catMap.set(String(c.name).toLowerCase(), c.name);
  });

  const makeMap = new Map();
  makes.forEach(m => {
    if (m.m_id !== undefined) makeMap.set(String(m.m_id), m.type || m.make_type);
  });

  const resolveCategory = p => {
    if (p.category_name) return p.category_name;
    if (p.category_id !== undefined && catMap.has(String(p.category_id))) {
      return catMap.get(String(p.category_id));
    }
    return 'Silver Item';
  };

  const resolveMake = p => {
    if (p.make_type) return p.make_type;
    const mid = p.make_id !== undefined ? p.make_id : p.m_id;
    if (mid !== undefined && makeMap.has(String(mid))) {
      return makeMap.get(String(mid));
    }
    return 'Handcrafted';
  };

  // -------------------------------------------------------------
  // Sheet 1: Detailed Product Inventory
  // -------------------------------------------------------------
  const inventoryData = products.map((p, idx) => {
    const qty = Number(p.quantity ?? 0);
    const mrp = Number(p.price ?? 0);
    const discount = Number(p.discount ?? 0);
    const labour = Number(p.labour_cost ?? 0);
    const cost = Number(p.actual_cost ?? 0);

    const finalPrice = p.final_price !== undefined && p.final_price !== null
      ? Number(p.final_price)
      : Math.round(mrp - (mrp * discount / 100) + labour);

    const margin = finalPrice - (cost + labour);
    const marginPct = finalPrice > 0 ? Math.round((margin / finalPrice) * 100) : 0;
    const totalCostValue = Math.round(cost * qty);
    const totalRetailValue = Math.round(finalPrice * qty);

    let stockStatus = 'IN STOCK';
    let urgency = '✅ Sufficient';
    if (qty === 0) {
      stockStatus = 'OUT OF STOCK';
      urgency = '🚨 Critical - Out of Stock';
    } else if (qty < 5) {
      stockStatus = 'LOW STOCK';
      urgency = '⚠️ Reorder Urgently (<5)';
    }

    return {
      'S.No': idx + 1,
      'Product ID': Number(p.product_id),
      'Product Title': p.product_name || p.title || p.name || `Product #${p.product_id}`,
      'Category': resolveCategory(p),
      'Craft / Make': resolveMake(p),
      'Purity': p.purity || '92.5 Sterling Silver',
      'Finish / Color': p.color || 'Silver',
      'Target Audience': p.ideal_for || 'ALL',
      'Weight (Grams)': p.weight || '-',
      'Stock Units': qty,
      'Stock Status': stockStatus,
      'Restock Urgency': urgency,
      'Retail MRP (₹)': mrp,
      'Discount (%)': discount,
      'Selling Price (₹)': finalPrice,
      'Actual Cost (₹)': cost,
      'Labour Cost (₹)': labour,
      'Gross Margin (₹)': margin,
      'Margin (%)': marginPct,
      'Inventory Cost Val (₹)': totalCostValue,
      'Inventory Retail Val (₹)': totalRetailValue,
      'Units Sold': Number(p.sold ?? 0),
      'Catalog Priority': Number(p.priority ?? 10),
      'Packaging': p.packaging || 'Standard Packaging',
      'Description': p.description ? String(p.description).replace(/\r?\n|\r/g, ' ') : ''
    };
  });

  const wb = XLSX.utils.book_new();

  // Primary Sheet
  const wsInventory = XLSX.utils.json_to_sheet(inventoryData);
  wsInventory['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 12 }, // Product ID
    { wch: 32 }, // Product Title
    { wch: 20 }, // Category
    { wch: 18 }, // Craft / Make
    { wch: 20 }, // Purity
    { wch: 16 }, // Finish / Color
    { wch: 16 }, // Target Audience
    { wch: 15 }, // Weight
    { wch: 12 }, // Stock Units
    { wch: 15 }, // Stock Status
    { wch: 28 }, // Restock Urgency
    { wch: 15 }, // Retail MRP
    { wch: 13 }, // Discount %
    { wch: 16 }, // Selling Price
    { wch: 15 }, // Actual Cost
    { wch: 15 }, // Labour Cost
    { wch: 16 }, // Gross Margin
    { wch: 13 }, // Margin %
    { wch: 22 }, // Inventory Cost Val
    { wch: 22 }, // Inventory Retail Val
    { wch: 12 }, // Units Sold
    { wch: 16 }, // Priority
    { wch: 20 }, // Packaging
    { wch: 45 }  // Description
  ];
  XLSX.utils.book_append_sheet(wb, wsInventory, 'Product Inventory');

  // -------------------------------------------------------------
  // Sheet 2: Category & Financial Summary (Executive Overview)
  // -------------------------------------------------------------
  if (includeSummary) {
    const catBuckets = new Map();

    products.forEach(p => {
      const cat = resolveCategory(p);
      if (!catBuckets.has(cat)) {
        catBuckets.set(cat, {
          name: cat,
          count: 0,
          units: 0,
          inStock: 0,
          lowStock: 0,
          outOfStock: 0,
          costVal: 0,
          retailVal: 0
        });
      }
      const b = catBuckets.get(cat);
      const qty = Number(p.quantity ?? 0);
      const mrp = Number(p.price ?? 0);
      const discount = Number(p.discount ?? 0);
      const labour = Number(p.labour_cost ?? 0);
      const cost = Number(p.actual_cost ?? 0);
      const finalPrice = p.final_price !== undefined && p.final_price !== null
        ? Number(p.final_price)
        : Math.round(mrp - (mrp * discount / 100) + labour);

      b.count += 1;
      b.units += qty;
      if (qty === 0) b.outOfStock += 1;
      else if (qty < 5) b.lowStock += 1;
      else b.inStock += 1;

      b.costVal += Math.round(cost * qty);
      b.retailVal += Math.round(finalPrice * qty);
    });

    const summaryRows = [];
    let totProds = 0;
    let totUnits = 0;
    let totIn = 0;
    let totLow = 0;
    let totOut = 0;
    let totCost = 0;
    let totRetail = 0;

    Array.from(catBuckets.values())
      .sort((a, b) => b.retailVal - a.retailVal)
      .forEach(b => {
        totProds += b.count;
        totUnits += b.units;
        totIn += b.inStock;
        totLow += b.lowStock;
        totOut += b.outOfStock;
        totCost += b.costVal;
        totRetail += b.retailVal;

        const estProfit = b.retailVal - b.costVal;
        const marginPct = b.retailVal > 0 ? Math.round((estProfit / b.retailVal) * 100) : 0;

        summaryRows.push({
          'Category Name': b.name,
          'Total Products': b.count,
          'Total Stock Units': b.units,
          'Healthy Stock (>=5)': b.inStock,
          'Low Stock (<5)': b.lowStock,
          'Out of Stock (0)': b.outOfStock,
          'Total Cost Value (₹)': b.costVal,
          'Total Retail Value (₹)': b.retailVal,
          'Potential Profit (₹)': estProfit,
          'Overall Margin (%)': marginPct
        });
      });

    // Total Row
    const grandProfit = totRetail - totCost;
    const grandMarginPct = totRetail > 0 ? Math.round((grandProfit / totRetail) * 100) : 0;
    summaryRows.push({
      'Category Name': '⭐ TOTAL / OVERALL CATALOG',
      'Total Products': totProds,
      'Total Stock Units': totUnits,
      'Healthy Stock (>=5)': totIn,
      'Low Stock (<5)': totLow,
      'Out of Stock (0)': totOut,
      'Total Cost Value (₹)': totCost,
      'Total Retail Value (₹)': totRetail,
      'Potential Profit (₹)': grandProfit,
      'Overall Margin (%)': grandMarginPct
    });

    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [
      { wch: 28 }, // Category Name
      { wch: 15 }, // Total Products
      { wch: 18 }, // Total Stock Units
      { wch: 20 }, // Healthy Stock
      { wch: 16 }, // Low Stock
      { wch: 18 }, // Out of Stock
      { wch: 22 }, // Total Cost Value
      { wch: 22 }, // Total Retail Value
      { wch: 20 }, // Potential Profit
      { wch: 18 }  // Overall Margin
    ];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Category Summary');
  }

  // -------------------------------------------------------------
  // Sheet 3: Stock Reorder List (Actionable Purchasing Sheet)
  // -------------------------------------------------------------
  if (includeReorderSheet) {
    const reorderProds = products
      .filter(p => Number(p.quantity ?? 0) < 5)
      .sort((a, b) => Number(a.quantity ?? 0) - Number(b.quantity ?? 0));

    if (reorderProds.length > 0) {
      const reorderRows = reorderProds.map((p, idx) => {
        const qty = Number(p.quantity ?? 0);
        const cost = Number(p.actual_cost ?? 0);
        const suggestedReorderQty = Math.max(10, 15 - qty);

        return {
          'Reorder Priority': idx + 1,
          'Product ID': Number(p.product_id),
          'Product Title': p.product_name || p.title || p.name || `Product #${p.product_id}`,
          'Category': resolveCategory(p),
          'Craft / Make': resolveMake(p),
          'Purity': p.purity || '92.5',
          'Color / Finish': p.color || 'Silver',
          'Current Stock Units': qty,
          'Urgency Status': qty === 0 ? '🚨 CRITICAL (0 In Stock)' : '⚠️ LOW STOCK (<5 In Stock)',
          'Suggested Reorder Qty': suggestedReorderQty,
          'Estimated Unit Cost (₹)': cost,
          'Est. Reorder Budget (₹)': cost * suggestedReorderQty,
          'Vendor / Artisan Notes': 'Inward stock urgently'
        };
      });

      const wsReorder = XLSX.utils.json_to_sheet(reorderRows);
      wsReorder['!cols'] = [
        { wch: 16 }, // Reorder Priority
        { wch: 12 }, // Product ID
        { wch: 32 }, // Product Title
        { wch: 20 }, // Category
        { wch: 18 }, // Craft / Make
        { wch: 16 }, // Purity
        { wch: 16 }, // Finish
        { wch: 18 }, // Current Stock
        { wch: 26 }, // Urgency Status
        { wch: 22 }, // Suggested Qty
        { wch: 22 }, // Unit Cost
        { wch: 22 }, // Reorder Budget
        { wch: 25 }  // Notes
      ];
      XLSX.utils.book_append_sheet(wb, wsReorder, 'Stock Reorder List');
    }
  }

  // -------------------------------------------------------------
  // Sheet 4: Filter Criteria & Export Info
  // -------------------------------------------------------------
  const now = new Date();
  const formattedDateTime = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }) + ' ' + now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const filterAuditRows = [
    { 'Parameter': 'Report Title', 'Filter Setting': 'Silver House - Product Inventory & Stock Report' },
    { 'Parameter': 'Export Timestamp', 'Filter Setting': formattedDateTime },
    { 'Parameter': 'Export Scope', 'Filter Setting': scope.toUpperCase() },
    { 'Parameter': 'Total Products in Catalog', 'Filter Setting': allProducts.length || products.length },
    { 'Parameter': 'Products Exported in Sheet', 'Filter Setting': products.length },
    { 'Parameter': 'Keyword / Search', 'Filter Setting': filterInfo.search || 'None (All Items)' },
    { 'Parameter': 'Stock Status Filter', 'Filter Setting': filterInfo.stock || 'All Stock Statuses' },
    { 'Parameter': 'Category Filter', 'Filter Setting': filterInfo.categoryName || filterInfo.category || 'All Categories' },
    { 'Parameter': 'Craft / Make Filter', 'Filter Setting': filterInfo.makeType || filterInfo.make || 'All Crafts' },
    { 'Parameter': 'Target Audience', 'Filter Setting': filterInfo.audience || 'All Audiences' },
    { 'Parameter': 'Signature Finish', 'Filter Setting': filterInfo.color || 'All Finishes' },
    { 'Parameter': 'Silver Purity', 'Filter Setting': filterInfo.purity || 'All Purities' },
    { 'Parameter': 'Price Range', 'Filter Setting': filterInfo.priceRange || 'Entire Catalog Range' },
    { 'Parameter': 'Sort Order Applied', 'Filter Setting': filterInfo.sort || 'Default (Priority)' },
    { 'Parameter': 'Generated By', 'Filter Setting': 'Silver House Admin Portal' }
  ];

  const wsAudit = XLSX.utils.json_to_sheet(filterAuditRows);
  wsAudit['!cols'] = [
    { wch: 28 }, // Parameter
    { wch: 45 }  // Filter Setting
  ];
  XLSX.utils.book_append_sheet(wb, wsAudit, 'Export Info & Filters');

  // -------------------------------------------------------------
  // Write File Download
  // -------------------------------------------------------------
  const dateStamp = now.toISOString().slice(0, 10);
  let nameTag = scope;
  if (filterInfo.stock) nameTag += `_${filterInfo.stock}`;
  if (filterInfo.categoryName) nameTag += `_${filterInfo.categoryName.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const cleanNameTag = nameTag.replace(/_+/g, '_').slice(0, 35);
  const finalFilename = `SilverHouse_Products_${cleanNameTag}_${dateStamp}.xlsx`;

  XLSX.writeFile(wb, finalFilename);

  return {
    filename: finalFilename,
    count: products.length
  };
}
