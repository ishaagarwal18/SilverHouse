const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { sql, poolPromise } = require('./db');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Ensure public/uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage for uploaded images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname) || '.jpg';
        cb(null, 'img-' + uniqueSuffix + ext);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// File upload endpoint for Chrome / Web browser uploads
app.post('/api/upload', upload.single('imageFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image file uploaded.' });
        }
        const imageUrl = `/uploads/${req.file.filename}`;
        return res.status(200).json({
            success: true,
            imageUrl: imageUrl
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// MULTI-IMAGE UPLOAD ENDPOINT FOR INSPIRATION / CUSTOM ORDERS
app.post('/api/upload-multiple', upload.array('images', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, error: 'No image files uploaded.' });
        }
        const urls = req.files.map(f => `/uploads/${f.filename}`);
        return res.status(200).json({
            success: true,
            imageUrls: urls
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// =========================================================================
// CUSTOM ARTISANAL ORDERS APIs
// =========================================================================

// Allowed confirmation statuses as enforced by DB constraint CK_orders_confirm (supports 'approved' as alias for 'accepted')
const ALLOWED_CONFIRM_STATUSES = ['processing', 'rejected', 'accepted', 'approved'];

// POST /api/custom-orders: Customer places custom order request with multi-image upload
app.post('/api/custom-orders', upload.array('images', 10), async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, error: 'Database connection unavailable.' });
        }

        const {
            custom_category,
            description,
            customer_name,
            customer_phone,
            customer_email,
            user_id
        } = req.body;

        if (!custom_category || !custom_category.trim()) {
            return res.status(400).json({ success: false, error: 'Custom item category is required.' });
        }

        if (!description || !description.trim()) {
            return res.status(400).json({ success: false, error: 'Detailed description of custom requirement is required.' });
        }

        if (!customer_name || !customer_name.trim()) {
            return res.status(400).json({ success: false, error: 'Customer name is required.' });
        }

        if (!customer_phone || !customer_phone.trim()) {
            return res.status(400).json({ success: false, error: 'Customer phone number is required.' });
        }

        // Strict customer login requirement
        const parsedUserId = user_id && !isNaN(parseInt(user_id, 10)) ? parseInt(user_id, 10) : null;
        if (!parsedUserId || parsedUserId <= 0) {
            return res.status(401).json({
                success: false,
                error: 'Customer must be logged in to place a custom order. Please sign in or create an account.'
            });
        }

        // Collect uploaded files and any existing URLs passed
        let imageUrls = [];
        if (req.files && req.files.length > 0) {
            imageUrls = req.files.map(f => `/uploads/${f.filename}`);
        }
        if (req.body.imageUrls) {
            try {
                const parsed = typeof req.body.imageUrls === 'string' ? JSON.parse(req.body.imageUrls) : req.body.imageUrls;
                if (Array.isArray(parsed)) {
                    imageUrls = imageUrls.concat(parsed);
                }
            } catch (e) {
                if (typeof req.body.imageUrls === 'string') {
                    imageUrls.push(req.body.imageUrls);
                }
            }
        }

        const imagesJson = JSON.stringify(imageUrls);

        // Generate custom order identifier
        const orderNumber = `CUST-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

        const insertQuery = `
            INSERT INTO dbo.orders (
                order_number,
                user_id,
                total_amount,
                discount_amount,
                final_payable,
                payment_status,
                [confirm],
                custom_category,
                [description],
                customer_name,
                customer_phone,
                customer_email,
                is_custom,
                [image],
                created_at
            )
            OUTPUT 
                INSERTED.order_id,
                INSERTED.order_number,
                INSERTED.[confirm],
                INSERTED.created_at
            VALUES (
                @order_number,
                @user_id,
                0.00,
                0.00,
                0.00,
                'PENDING',
                'processing',
                @custom_category,
                @description,
                @customer_name,
                @customer_phone,
                @customer_email,
                1,
                @image,
                SYSUTCDATETIME()
            );
        `;

        const request = pool.request();
        request.input('order_number', sql.NVarChar(50), orderNumber);
        request.input('user_id', sql.Int, parsedUserId);
        request.input('custom_category', sql.NVarChar(100), custom_category.trim());
        request.input('description', sql.NVarChar(sql.MAX), description.trim());
        request.input('customer_name', sql.NVarChar(150), customer_name.trim());
        request.input('customer_phone', sql.NVarChar(50), customer_phone.trim());
        request.input('customer_email', sql.NVarChar(150), customer_email ? customer_email.trim() : null);
        request.input('image', sql.NVarChar(sql.MAX), imagesJson);

        const result = await request.query(insertQuery);
        const inserted = result.recordset[0];

        return res.status(201).json({
            success: true,
            message: 'Custom order request received successfully. Our master artisans will review your requirements and provide a price quotation.',
            order: {
                order_id: inserted.order_id,
                order_number: inserted.order_number,
                confirm: inserted.confirm,
                created_at: inserted.created_at,
                imageUrls: imageUrls
            }
        });

    } catch (err) {
        console.error('[Custom Orders Post Error]:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/admin/custom-orders: Fetch all custom orders for admin panel
app.get('/api/admin/custom-orders', async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, error: 'Database connection unavailable.' });
        }

        const { status } = req.query;
        let query = `
            SELECT 
                order_id,
                order_number,
                user_id,
                total_amount,
                discount_amount,
                final_payable,
                payment_status,
                [confirm],
                custom_category,
                [description],
                customer_name,
                customer_phone,
                customer_email,
                is_custom,
                [image],
                created_at
            FROM dbo.orders
            WHERE is_custom = 1
        `;

        if (status && ALLOWED_CONFIRM_STATUSES.includes(status.toLowerCase())) {
            query += ` AND [confirm] = @status`;
        }

        query += ` ORDER BY created_at DESC`;

        const request = pool.request();
        if (status && ALLOWED_CONFIRM_STATUSES.includes(status.toLowerCase())) {
            request.input('status', sql.VarChar(20), status.toLowerCase());
        }

        const result = await request.query(query);

        const formatted = result.recordset.map(row => {
            let images = [];
            if (row.image) {
                try {
                    const parsed = JSON.parse(row.image);
                    if (Array.isArray(parsed)) {
                        images = parsed;
                    } else if (typeof parsed === 'string') {
                        images = [parsed];
                    }
                } catch (e) {
                    // Fallback to comma-separated or plain string
                    images = row.image.split(',').map(s => s.trim()).filter(Boolean);
                }
            }
            images = images.map(img => (img && !img.startsWith('http') && !img.startsWith('/') && !img.startsWith('data:')) ? `/${img}` : img);
            return {
                ...row,
                images: images
            };
        });

        return res.status(200).json({
            success: true,
            total: formatted.length,
            orders: formatted
        });

    } catch (err) {
        console.error('[Custom Orders Fetch Error]:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// PUT /api/admin/custom-orders/:id: Update quotation price and confirmation status with automated customer notification
app.put('/api/admin/custom-orders/:id', async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        if (isNaN(orderId)) {
            return res.status(400).json({ success: false, error: 'Invalid order ID provided.' });
        }

        const { confirm, final_payable } = req.body;

        if (confirm !== undefined && confirm !== null) {
            let normalizedStatus = String(confirm).trim().toLowerCase();
            if (normalizedStatus === 'approved') normalizedStatus = 'accepted';
            if (!['processing', 'rejected', 'accepted'].includes(normalizedStatus)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid confirm status '${confirm}'. Allowed values are strictly: 'processing', 'rejected', 'accepted' (or 'approved').`
                });
            }
        }

        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, error: 'Database connection unavailable.' });
        }

        // Fetch current order to ensure it exists and get customer contact info
        const checkReq = pool.request();
        checkReq.input('order_id', sql.Int, orderId);
        const existing = await checkReq.query(`
            SELECT 
                order_id, 
                order_number, 
                [confirm], 
                final_payable, 
                total_amount,
                customer_name,
                customer_phone,
                customer_email,
                custom_category,
                is_custom
            FROM dbo.orders 
            WHERE order_id = @order_id
        `);

        if (!existing.recordset || existing.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'Custom order not found.' });
        }

        const current = existing.recordset[0];
        if (!current.is_custom) {
            return res.status(400).json({
                success: false,
                error: `Order #${orderId} is a standard/ready-made order. Order decision statuses ('processing', 'accepted', 'rejected') are strictly for customized orders only.`
            });
        }
        let newStatus = confirm !== undefined ? String(confirm).trim().toLowerCase() : current.confirm;
        if (newStatus === 'approved') newStatus = 'accepted';
        const newPrice = final_payable !== undefined && !isNaN(parseFloat(final_payable)) ? parseFloat(final_payable) : current.final_payable;

        const updateReq = pool.request();
        updateReq.input('order_id', sql.Int, orderId);
        updateReq.input('confirm', sql.VarChar(20), newStatus);
        updateReq.input('final_payable', sql.Decimal(18, 2), newPrice);
        updateReq.input('total_amount', sql.Decimal(18, 2), newPrice);

        await updateReq.query(`
            UPDATE dbo.orders
            SET 
                [confirm] = @confirm,
                final_payable = @final_payable,
                total_amount = @total_amount
            WHERE order_id = @order_id;
        `);

        // Send Automated Decision & Price Notification to Customer via WhatsApp
        if (current.customer_phone) {
            try {
                const customerName = current.customer_name || 'Valued Patron';
                const orderNum = current.order_number || `CUST-#${orderId}`;
                const category = current.custom_category || 'Sacred Silver Artwork';
                const formattedPrice = Number(newPrice).toLocaleString('en-IN');

                let notificationMsg = '';
                if (newStatus === 'accepted') {
                    notificationMsg = `✨ *SilverHouse Artisanal Studio*\n\nNamaste ${customerName},\n\n👑 *Great News! Your Custom Order Request is APPROVED!*\n\n• *Order Number:* ${orderNum}\n• *Design / Category:* ${category}\n• *Approved Price Quotation:* ₹${formattedPrice}\n\nOur master silversmiths have reviewed your specifications and approved the commission. Hand-crafting in pure 925 hallmarked silver will commence upon your confirmation.\n\n👉 *View Details & Confirm Your Order:*\nhttps://silverhouse-silver.vercel.app/orders\n\n_Pure 925 & 999 Artisanal Silver_`;
                } else if (newStatus === 'rejected') {
                    notificationMsg = `✨ *SilverHouse Artisanal Studio*\n\nNamaste ${customerName},\n\nRegarding your custom order request (*${orderNum}* - ${category}):\n\nOur master silversmiths have carefully reviewed your design specifications. We regret to inform you that our workshop is unable to fulfill this particular custom commission at this time due to structural/casting constraints.\n\nYou are welcome to submit an alternate design or explore our ready-to-ship collections.\n\n_Pure 925 & 999 Artisanal Silver_`;
                } else if (newStatus === 'processing') {
                    notificationMsg = `✨ *SilverHouse Artisanal Studio*\n\nNamaste ${customerName},\n\nYour custom order (*${orderNum}* - ${category}) is currently *Under Artisan Review*.\n\nOur head silversmith is calculating silver weight and crafting hours. You will receive an official decision and price quotation shortly.\n\n_Pure 925 & 999 Artisanal Silver_`;
                }

                if (notificationMsg) {
                    await sendWhatsAppMessage(current.customer_phone, notificationMsg);
                }
            } catch (notifyErr) {
                console.warn('[WhatsApp Custom Order Notification Warning]:', notifyErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: `Custom order #${orderId} updated successfully. Status: '${newStatus}', Price: ₹${newPrice}`,
            order: {
                order_id: orderId,
                confirm: newStatus,
                final_payable: newPrice
            }
        });

    } catch (err) {
        console.error('[Custom Orders Update Error]:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/custom-orders/my-orders: Customer fetches their custom orders
app.get('/api/custom-orders/my-orders', async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, error: 'Database connection unavailable.' });
        }

        const userId = req.query.userId ? parseInt(req.query.userId, 10) : null;
        const phone = req.query.phone ? String(req.query.phone).trim() : null;
        const last10 = phone ? phone.replace(/\D/g, '').slice(-10) : '';

        if (!userId && !last10) {
            return res.status(400).json({ success: false, error: 'userId or phone is required to retrieve custom orders.' });
        }

        let query = `
            SELECT 
                order_id,
                order_number,
                user_id,
                total_amount,
                discount_amount,
                final_payable,
                payment_status,
                [confirm],
                custom_category,
                [description],
                customer_name,
                customer_phone,
                customer_email,
                is_custom,
                [image],
                created_at
            FROM dbo.orders
            WHERE is_custom = 1
        `;

        const request = pool.request();
        if (userId && last10) {
            request.input('userId', sql.Int, userId);
            request.input('phonePattern', sql.NVarChar(20), '%' + last10);
            query += ` AND (user_id = @userId OR customer_phone LIKE @phonePattern)`;
        } else if (userId) {
            request.input('userId', sql.Int, userId);
            query += ` AND user_id = @userId`;
        } else if (last10) {
            request.input('phonePattern', sql.NVarChar(20), '%' + last10);
            query += ` AND customer_phone LIKE @phonePattern`;
        }

        query += ` ORDER BY created_at DESC`;

        const result = await request.query(query);

        const formatted = result.recordset.map(row => {
            let images = [];
            if (row.image) {
                try {
                    const parsed = JSON.parse(row.image);
                    if (Array.isArray(parsed)) {
                        images = parsed;
                    } else if (typeof parsed === 'string') {
                        images = [parsed];
                    }
                } catch (e) {
                    images = row.image.split(',').map(s => s.trim()).filter(Boolean);
                }
            }
            images = images.map(img => (img && !img.startsWith('http') && !img.startsWith('/') && !img.startsWith('data:')) ? `/${img}` : img);
            return {
                ...row,
                images: images
            };
        });

        return res.status(200).json({
            success: true,
            total: formatted.length,
            orders: formatted
        });
    } catch (err) {
        console.error('[Customer Custom Orders Fetch Error]:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/custom-orders/:id/pay: Customer confirms and pays for approved custom order
app.post('/api/custom-orders/:id/pay', async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        if (isNaN(orderId)) {
            return res.status(400).json({ success: false, error: 'Invalid order ID.' });
        }

        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, error: 'Database connection unavailable.' });
        }

        const checkReq = pool.request();
        checkReq.input('order_id', sql.Int, orderId);
        const existing = await checkReq.query(`
            SELECT order_id, order_number, [confirm], final_payable, payment_status, customer_name, customer_phone 
            FROM dbo.orders 
            WHERE order_id = @order_id
        `);

        if (!existing.recordset || existing.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'Custom order not found.' });
        }

        const order = existing.recordset[0];
        if (order.confirm !== 'accepted') {
            return res.status(400).json({
                success: false,
                error: 'Cannot confirm payment for an order that has not been approved by the workshop yet.'
            });
        }

        const updateReq = pool.request();
        updateReq.input('order_id', sql.Int, orderId);
        await updateReq.query(`
            UPDATE dbo.orders
            SET payment_status = 'PAID'
            WHERE order_id = @order_id;
        `);

        // Send payment confirmation message
        if (order.customer_phone) {
            try {
                const message = `✨ *SilverHouse Artisanal Studio*\n\nNamaste ${order.customer_name || 'Patron'},\n\nPayment confirmed for your custom order (*${order.order_number}*)! 🎉\n\n• *Amount:* ₹${Number(order.final_payable).toLocaleString('en-IN')}\n• *Status:* Confirmed & In Production\n\nOur master silversmiths have scheduled hand-crafting and hallmarking. You will receive tracking details upon completion.\n\n_Pure 925 & 999 Artisanal Silver_`;
                await sendWhatsAppMessage(order.customer_phone, message);
            } catch (payNotifyErr) {
                console.warn('[WhatsApp Payment Confirmation Warning]:', payNotifyErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Custom order quotation accepted & payment confirmed successfully!',
            order: {
                order_id: orderId,
                payment_status: 'PAID',
                confirm: 'accepted',
                final_payable: order.final_payable
            }
        });
    } catch (err) {
        console.error('[Pay Custom Order Error]:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// =========================================================================
// ADMIN ANALYTICS & P&L API
// =========================================================================
app.get('/api/admin/analytics', async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, error: 'Database connection unavailable.' });
        }

        // 1. Catalog P&L Aggregation (Selling Price vs Actual Cost vs Labour Cost)
        const catalogPnlQuery = `
            SELECT 
                COUNT(*) AS total_products,
                ISNULL(SUM(price), 0) AS total_catalog_revenue_potential,
                ISNULL(SUM(actual_cost), 0) AS total_catalog_actual_cost,
                ISNULL(SUM(labour_cost), 0) AS total_catalog_labour_cost,
                ISNULL(SUM(price - actual_cost - labour_cost), 0) AS total_catalog_gross_margin,
                ISNULL(SUM(sold), 0) AS total_units_sold,
                ISNULL(SUM(sold * price), 0) AS realized_revenue,
                ISNULL(SUM(sold * actual_cost), 0) AS realized_actual_cost,
                ISNULL(SUM(sold * labour_cost), 0) AS realized_labour_cost,
                ISNULL(SUM(sold * (price - actual_cost - labour_cost)), 0) AS realized_gross_profit
            FROM dbo.product;
        `;
        const catalogPnlResult = await pool.request().query(catalogPnlQuery);
        const pnl = catalogPnlResult.recordset[0] || {};

        // 2. Custom Orders KPIs & Status Ratio
        const customOrdersQuery = `
            SELECT 
                COUNT(*) AS total_custom_orders,
                SUM(CASE WHEN [confirm] = 'processing' THEN 1 ELSE 0 END) AS processing_count,
                SUM(CASE WHEN [confirm] = 'accepted' THEN 1 ELSE 0 END) AS accepted_count,
                SUM(CASE WHEN [confirm] = 'rejected' THEN 1 ELSE 0 END) AS rejected_count,
                ISNULL(SUM(CASE WHEN [confirm] = 'accepted' THEN final_payable ELSE 0 END), 0) AS accepted_quoted_revenue,
                ISNULL(SUM(final_payable), 0) AS total_quoted_revenue
            FROM dbo.orders
            WHERE is_custom = 1;
        `;
        const customOrdersResult = await pool.request().query(customOrdersQuery);
        const customStats = customOrdersResult.recordset[0] || {};

        // 3. Custom Orders Category Breakdown
        const categoryBreakdownQuery = `
            SELECT 
                ISNULL(NULLIF(custom_category, ''), 'Other') AS category,
                COUNT(*) AS count,
                ISNULL(SUM(final_payable), 0) AS total_value,
                SUM(CASE WHEN [confirm] = 'accepted' THEN 1 ELSE 0 END) AS accepted_count
            FROM dbo.orders
            WHERE is_custom = 1
            GROUP BY custom_category
            ORDER BY count DESC;
        `;
        const categoryResult = await pool.request().query(categoryBreakdownQuery);

        // 4. Product Category Profitability Breakdown
        const productCategoryPnlQuery = `
            SELECT 
                ISNULL(c.name, 'Uncategorized') AS category_name,
                COUNT(p.product_id) AS product_count,
                ISNULL(SUM(p.price), 0) AS total_selling_price,
                ISNULL(SUM(p.actual_cost), 0) AS total_actual_cost,
                ISNULL(SUM(p.labour_cost), 0) AS total_labour_cost,
                ISNULL(SUM(p.price - p.actual_cost - p.labour_cost), 0) AS total_margin,
                ISNULL(SUM(p.sold), 0) AS units_sold
            FROM dbo.product p
            LEFT JOIN dbo.category c ON p.category_id = c.category_id
            GROUP BY c.name
            ORDER BY total_margin DESC;
        `;
        const productCatResult = await pool.request().query(productCategoryPnlQuery);

        // 5. Recent Custom Orders (last 10 for table overview)
        const recentOrdersQuery = `
            SELECT TOP 10
                order_id,
                order_number,
                custom_category,
                customer_name,
                customer_phone,
                [confirm],
                final_payable,
                created_at
            FROM dbo.orders
            WHERE is_custom = 1
            ORDER BY created_at DESC;
        `;
        const recentResult = await pool.request().query(recentOrdersQuery);

        // Calculate key financial percentages
        const catalogTotalCost = Number(pnl.total_catalog_actual_cost) + Number(pnl.total_catalog_labour_cost);
        const catalogMarginPct = pnl.total_catalog_revenue_potential > 0
            ? ((pnl.total_catalog_gross_margin / pnl.total_catalog_revenue_potential) * 100).toFixed(1)
            : 0;

        const totalCustom = Number(customStats.total_custom_orders) || 0;
        const acceptedCount = Number(customStats.accepted_count) || 0;
        const rejectedCount = Number(customStats.rejected_count) || 0;
        const processingCount = Number(customStats.processing_count) || 0;

        const acceptanceRate = totalCustom > 0 ? ((acceptedCount / totalCustom) * 100).toFixed(1) : 0;
        const rejectionRate = totalCustom > 0 ? ((rejectedCount / totalCustom) * 100).toFixed(1) : 0;

        return res.status(200).json({
            success: true,
            pnl: {
                totalProducts: Number(pnl.total_products) || 0,
                potentialRevenue: Number(pnl.total_catalog_revenue_potential) || 0,
                actualMaterialCost: Number(pnl.total_catalog_actual_cost) || 0,
                labourCost: Number(pnl.total_catalog_labour_cost) || 0,
                totalCost: catalogTotalCost,
                grossMargin: Number(pnl.total_catalog_gross_margin) || 0,
                marginPercentage: Number(catalogMarginPct),
                realizedRevenue: Number(pnl.realized_revenue) || 0,
                realizedProfit: Number(pnl.realized_gross_profit) || 0,
                unitsSold: Number(pnl.total_units_sold) || 0
            },
            customOrders: {
                total: totalCustom,
                processing: processingCount,
                accepted: acceptedCount,
                rejected: rejectedCount,
                acceptanceRate: Number(acceptanceRate),
                rejectionRate: Number(rejectionRate),
                acceptedRevenue: Number(customStats.accepted_quoted_revenue) || 0,
                totalQuotedRevenue: Number(customStats.total_quoted_revenue) || 0
            },
            categoryBreakdown: categoryResult.recordset,
            productCategoriesPnl: productCatResult.recordset,
            recentOrders: recentResult.recordset
        });

    } catch (err) {
        console.error('[Admin Analytics Error]:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// =========================================================================
// WHATSAPP OTP AUTHENTICATION HELPERS & APIS
// =========================================================================

function cleanPhoneNumber(rawPhone) {
    if (!rawPhone) return '';
    let digits = String(rawPhone).replace(/\D/g, '').trim();
    if (digits.length === 11 && digits.startsWith('0')) {
        digits = digits.substring(1);
    }
    if (digits.length === 12 && digits.startsWith('91')) {
        digits = digits.substring(2);
    }
    if (digits.length === 10) {
        return '+91' + digits;
    }
    return '+' + digits;
}

// Format phone specifically for WhatsApp gateway (91XXXXXXXXXX without +)
function formatWhatsAppPhone(rawPhone) {
    if (!rawPhone) return '';
    let digits = String(rawPhone).replace(/\D/g, '').trim();
    if (digits.length === 11 && digits.startsWith('0')) {
        digits = digits.substring(1);
    }
    if (digits.length === 10) {
        digits = '91' + digits;
    } else if (digits.length === 12 && digits.startsWith('91')) {
        // already valid 91XXXXXXXXXX
    }
    return digits;
}

// Fetch WhatsApp API URL from store_parameter table (or fallback to env)
async function getWhatsAppApiUrl(pool) {
    let url = null;
    try {
        const activePool = pool || (await poolPromise);
        if (activePool) {
            const result = await activePool.request().query(
                'SELECT TOP 1 wp_api FROM dbo.store_parameter WHERE wp_api IS NOT NULL AND LEN(RTRIM(wp_api)) > 0 ORDER BY id DESC'
            );
            if (result.recordset && result.recordset.length > 0 && result.recordset[0].wp_api) {
                url = result.recordset[0].wp_api.trim();
            }
        }
    } catch (err) {
        console.warn('[WhatsApp] Could not fetch wp_api from store_parameter:', err.message);
    }

    if (!url) {
        url = process.env.WHATSAPP_API_URL || null;
    }

    // Always ensure HTTPS for cloud VPS outbound security & fast delivery
    if (url && url.startsWith('http://wtsapp.aronertech.com')) {
        url = url.replace('http://', 'https://');
    }

    return url;
}

async function sendWhatsAppMessage(phone, message, pool = null) {
    const waPhone = formatWhatsAppPhone(phone);
    const cleaned = cleanPhoneNumber(phone) || phone;
    console.log(`\n======================================================`);
    console.log(`[WhatsApp Gateway] 💬 Outgoing WhatsApp Message:`);
    console.log(`To: ${cleaned} (WA: ${waPhone})`);
    console.log(`Message:\n${message}`);
    console.log(`======================================================\n`);

    const apiUrl = await getWhatsAppApiUrl(pool);

    if (apiUrl) {
        try {
            const urlObj = new URL(apiUrl);
            const token = urlObj.searchParams.get('token') || '';

            const queryParams = new URLSearchParams();
            if (token) queryParams.set('token', token);
            queryParams.set('phone', waPhone);
            queryParams.set('message', message);

            const targetUrl = `${urlObj.origin}${urlObj.pathname}?${queryParams.toString().replace(/\+/g, '%20')}`;

            console.log(`[WhatsApp Gateway] Dispatching to: ${urlObj.origin}${urlObj.pathname}?phone=${waPhone}`);
            const response = await fetch(targetUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json, text/plain, */*' }
            });
            const data = await response.json().catch(() => ({}));
            console.log(`[WhatsApp Gateway] Provider response:`, JSON.stringify(data));
            return { success: true, data };
        } catch (apiErr) {
            console.warn(`[WhatsApp Gateway Warning] Provider dispatch failed:`, apiErr.message);
            return { success: false, error: apiErr.message };
        }
    }
    return { success: true };
}

async function sendWhatsAppOtp(phone, otp, pool = null) {
    const waPhone = formatWhatsAppPhone(phone);
    const cleaned = cleanPhoneNumber(phone) || phone;
    console.log(`\n======================================================`);
    console.log(`[WhatsApp Gateway] 🔐 Dispatching WhatsApp OTP:`);
    console.log(`To: ${cleaned} (WA Phone: ${waPhone})`);
    console.log(`OTP Code: ${otp}`);
    console.log(`======================================================\n`);

    const apiUrl = await getWhatsAppApiUrl(pool);

    if (!apiUrl) {
        console.warn(`[WhatsApp Gateway] No wp_api found in store_parameter or environment.`);
        return { success: false, error: 'No WhatsApp API gateway configured in store_parameter.' };
    }

    try {
        const urlObj = new URL(apiUrl);
        const token = urlObj.searchParams.get('token') || '';

        // Use message template configured in store_parameter or provide standard SilverHouse text
        const existingMsg = (urlObj.searchParams.get('message') || '').trim();
        const baseMsg = existingMsg || 'your SilverHouse Mobile verification OTP is';
        const finalMsg = `${baseMsg} ${otp}. Valid for 5 minutes. Please do not share this OTP.`;

        // Explicitly format query string with %20 encoding for spaces instead of '+'
        const queryParams = new URLSearchParams();
        if (token) queryParams.set('token', token);
        queryParams.set('phone', waPhone);
        queryParams.set('message', finalMsg);

        // Replace '+' with '%20' so all third-party WhatsApp parsers decode correctly
        const targetUrl = `${urlObj.origin}${urlObj.pathname}?${queryParams.toString().replace(/\+/g, '%20')}`;

        console.log(`[WhatsApp Gateway] Calling provider URL for ${waPhone}...`);
        
        // 15-second timeout to prevent requests from hanging indefinitely
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json, text/plain, */*' },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        const data = await response.json().catch(() => ({}));
        console.log(`[WhatsApp Gateway] Provider response (${response.status}):`, JSON.stringify(data));

        if (!response.ok || (data.status && data.status !== 'success')) {
            const errDetail = data.message || `Provider returned HTTP ${response.status}`;
            return { success: false, error: errDetail, data };
        }

        return { success: true, data };
    } catch (apiErr) {
        console.warn(`[WhatsApp Gateway Warning] OTP dispatch failed:`, apiErr.message);
        return { 
            success: false, 
            error: apiErr.name === 'AbortError' ? 'WhatsApp gateway timed out after 15s' : apiErr.message 
        };
    }
}

// 1. POST /api/auth/send-otp: Send OTP on WhatsApp
app.post('/api/auth/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        const cleanedPhone = cleanPhoneNumber(phone);

        if (!cleanedPhone || cleanedPhone.replace(/\D/g, '').length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Please enter a valid 10-digit mobile number.'
            });
        }

        // Generate 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, error: 'Database connection unavailable.' });
        }

        // Clean up any previously expired OTPs from dbo.phone_otp before upserting
        try {
            await pool.request().query('DELETE FROM dbo.phone_otp WHERE expires_at < SYSUTCDATETIME()');
        } catch (cleanupErr) {
            console.warn('[Send OTP Cleanup Warning]:', cleanupErr.message);
        }

        // Upsert OTP in dbo.phone_otp
        await pool.request()
            .input('phone', sql.NVarChar(20), cleanedPhone)
            .input('otp_code', sql.NVarChar(10), otp)
            .input('expires_at', sql.DateTime2, expiresAt)
            .query(`
                MERGE dbo.phone_otp AS target
                USING (SELECT @phone AS phone) AS source
                ON (target.phone = source.phone)
                WHEN MATCHED THEN
                    UPDATE SET otp_code = @otp_code, expires_at = @expires_at, attempts = 0, created_at = SYSUTCDATETIME()
                WHEN NOT MATCHED THEN
                    INSERT (phone, otp_code, expires_at, attempts, created_at)
                    VALUES (@phone, @otp_code, @expires_at, 0, SYSUTCDATETIME());
            `);

        // Send real OTP to customer WhatsApp using wp_api from store_parameter
        const waDispatch = await sendWhatsAppOtp(cleanedPhone, otp, pool);

        if (!waDispatch.success) {
            console.error(`[Send OTP Warning] WhatsApp gateway dispatch failed: ${waDispatch.error}`);
            return res.status(502).json({
                success: false,
                error: `Unable to deliver WhatsApp message: ${waDispatch.error}. Please check your phone number or try again.`,
                phone: cleanedPhone
            });
        }

        return res.status(200).json({
            success: true,
            message: `Verification code sent to WhatsApp (${cleanedPhone})`,
            phone: cleanedPhone,
            formattedPhone: cleanedPhone
        });
    } catch (err) {
        console.error('[Send OTP Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 2. POST /api/auth/verify-otp: Verify WhatsApp OTP & Login/Register Customer
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { phone, otp, fullName, userName, name } = req.body;
        const cleanedPhone = cleanPhoneNumber(phone);
        const rawPhone = (phone || '').toString().trim();
        const providedName = (fullName || userName || name || '').trim();

        if (!cleanedPhone || !otp) {
            return res.status(400).json({ success: false, error: 'Phone number and 6-digit OTP are required.' });
        }

        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, error: 'Database connection unavailable.' });
        }

        // Delete any expired OTP records for this phone number right away
        await pool.request()
            .input('phone', sql.NVarChar(20), cleanedPhone)
            .input('rawPhone', sql.NVarChar(20), rawPhone)
            .query('DELETE FROM dbo.phone_otp WHERE (phone = @phone OR phone = @rawPhone) AND expires_at < SYSUTCDATETIME()');

        // Verify OTP against dbo.phone_otp
        const otpResult = await pool.request()
            .input('phone', sql.NVarChar(20), cleanedPhone)
            .input('rawPhone', sql.NVarChar(20), rawPhone)
            .query('SELECT phone, otp_code, expires_at, attempts FROM dbo.phone_otp WHERE phone = @phone OR phone = @rawPhone');

        if (!otpResult.recordset || otpResult.recordset.length === 0) {
            return res.status(400).json({ success: false, error: 'No active OTP found for this phone number or code has expired. Please request a new code.' });
        }

        const record = otpResult.recordset[0];

        // Check if expired
        if (new Date() > new Date(record.expires_at)) {
            // Delete expired record immediately from dbo.phone_otp
            await pool.request()
                .input('phone', sql.NVarChar(20), record.phone)
                .query('DELETE FROM dbo.phone_otp WHERE phone = @phone');
            return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new code on WhatsApp.' });
        }

        // Check maximum attempts limit
        if (record.attempts >= 5) {
            // Delete exhausted OTP record so user must request a fresh OTP
            await pool.request()
                .input('phone', sql.NVarChar(20), record.phone)
                .query('DELETE FROM dbo.phone_otp WHERE phone = @phone');
            return res.status(429).json({ success: false, error: 'Too many incorrect attempts. Please request a new OTP.' });
        }

        if (record.otp_code.trim() !== String(otp).trim()) {
            await pool.request()
                .input('phone', sql.NVarChar(20), record.phone)
                .query('UPDATE dbo.phone_otp SET attempts = attempts + 1 WHERE phone = @phone');
            return res.status(400).json({ success: false, error: 'Invalid verification code. Please check your WhatsApp.' });
        }

        // OTP is valid! Clean up consumed OTP immediately
        await pool.request()
            .input('phone', sql.NVarChar(20), record.phone)
            .query('DELETE FROM dbo.phone_otp WHERE phone = @phone');

        // Dynamic DB lookup in dbo.[user] by phone or last 10 digits
        const digitsOnly = cleanedPhone.replace(/\D/g, '');
        const last10Digits = digitsOnly.slice(-10);

        const userResult = await pool.request()
            .input('phone', sql.NVarChar(20), cleanedPhone)
            .input('last10', sql.NVarChar(20), '%' + last10Digits)
            .query('SELECT TOP 1 user_id, full_name, phone, role FROM dbo.[user] WHERE phone = @phone OR phone LIKE @last10');

        let user;
        if (userResult.recordset && userResult.recordset.length > 0) {
            user = userResult.recordset[0];
            // If user provided a name, update full_name if changed or previously default
            if (providedName && (providedName !== user.full_name || !user.full_name || user.full_name.startsWith('Patron '))) {
                await pool.request()
                    .input('user_id', sql.Int, user.user_id)
                    .input('full_name', sql.NVarChar(100), providedName)
                    .query('UPDATE dbo.[user] SET full_name = @full_name WHERE user_id = @user_id');
                user.full_name = providedName;
            }
        } else {
            // Dynamically register new user with provided name or default CUSTOMER role
            const displayName = providedName || `Patron ${last10Digits.slice(-4)}`;
            const insertResult = await pool.request()
                .input('full_name', sql.NVarChar(100), displayName)
                .input('phone', sql.NVarChar(20), cleanedPhone)
                .input('role', sql.NVarChar(20), 'CUSTOMER')
                .query('INSERT INTO dbo.[user] (full_name, phone, role) OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.phone, INSERTED.role VALUES (@full_name, @phone, @role)');
            user = insertResult.recordset[0];
        }

        // Role is determined dynamically and exclusively from the database record
        const roleStr = (user.role || 'CUSTOMER').toUpperCase();
        const isAdmin = roleStr === 'ADMIN';

        const userObj = {
            userId: user.user_id,
            fullName: user.full_name,
            email: '',
            phone: user.phone || cleanedPhone,
            role: roleStr
        };

        const token = Buffer.from(JSON.stringify(userObj)).toString('base64');

        let adminRedirectUrl = '/';
        if (isAdmin) {
            const baseAdmin = (process.env.ADMIN_URL || 'https://api.silverhouseindia.com/').trim();
            const delim = baseAdmin.includes('?') ? '&' : '?';
            adminRedirectUrl = `${baseAdmin}${delim}auth_token=${encodeURIComponent(token)}`;
        }

        return res.status(200).json({
            success: true,
            message: 'Phone verified successfully',
            token: token,
            user: userObj,
            role: userObj.role,
            isAdmin: isAdmin,
            redirectUrl: adminRedirectUrl
        });
    } catch (err) {
        console.error('[Verify OTP Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/auth/me: Verify active session dynamically against DB
app.get('/api/auth/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        } catch {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ success: false, error: 'Invalid token payload' });
        }

        const pool = await poolPromise;
        const userRes = await pool.request()
            .input('user_id', sql.Int, decoded.userId)
            .query('SELECT TOP 1 user_id, full_name, phone, role FROM dbo.[user] WHERE user_id = @user_id');

        if (!userRes.recordset || userRes.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = userRes.recordset[0];
        const roleStr = (user.role || 'CUSTOMER').toUpperCase();
        return res.status(200).json({
            success: true,
            user: {
                userId: user.user_id,
                fullName: user.full_name,
                phone: user.phone,
                role: roleStr
            },
            isAdmin: roleStr === 'ADMIN'
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// ADMIN PORTAL DIRECT CREDENTIALS AUTHENTICATION
// (Username / Phone & Password for Admins only)
// ==========================================
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const cleanUser = String(username || '').trim();
        const cleanPass = String(password || '').trim();

        if (!cleanUser || !cleanPass) {
            return res.status(400).json({
                success: false,
                error: 'Both username/phone and password are required.'
            });
        }

        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, error: 'Database connection unavailable.' });
        }

        // Match admin by full_name or phone
        const digitsOnly = cleanUser.replace(/\D/g, '');
        const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : null;

        let query = `
            SELECT TOP 1 user_id, full_name, phone, role, password 
            FROM dbo.[user] 
            WHERE UPPER(role) = 'ADMIN' 
              AND (LOWER(full_name) = LOWER(@username) OR phone = @username
        `;
        const request = pool.request()
            .input('username', sql.NVarChar(100), cleanUser);

        if (last10) {
            query += ` OR phone LIKE @last10`;
            request.input('last10', sql.NVarChar(20), '%' + last10);
        }
        query += `)`;

        const result = await request.query(query);
        if (!result.recordset || result.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid admin username or password.'
            });
        }

        const adminUser = result.recordset[0];
        if (!adminUser.password) {
            return res.status(401).json({
                success: false,
                error: 'This admin account does not have a password configured. Please contact the administrator.'
            });
        }

        const sha256 = crypto.createHash('sha256').update(cleanPass).digest('hex');
        const isMatch = (adminUser.password === cleanPass) || (adminUser.password === sha256);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid admin username or password.'
            });
        }

        const userObj = {
            userId: adminUser.user_id,
            fullName: adminUser.full_name,
            phone: adminUser.phone,
            role: 'ADMIN'
        };
        const token = Buffer.from(JSON.stringify(userObj)).toString('base64');

        return res.status(200).json({
            success: true,
            message: `Welcome back, ${adminUser.full_name}!`,
            token,
            user: userObj,
            isAdmin: true
        });
    } catch (err) {
        console.error('[Admin Login Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/admin/me: Verify active admin token session
app.get('/api/admin/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Admin authorization header required' });
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        } catch {
            return res.status(401).json({ success: false, error: 'Invalid admin token' });
        }

        if (!decoded || !decoded.userId) {
            return res.status(401).json({ success: false, error: 'Invalid admin token payload' });
        }

        const pool = await poolPromise;
        const userRes = await pool.request()
            .input('user_id', sql.Int, decoded.userId)
            .query('SELECT TOP 1 user_id, full_name, phone, role FROM dbo.[user] WHERE user_id = @user_id AND UPPER(role) = \'ADMIN\'');

        if (!userRes.recordset || userRes.recordset.length === 0) {
            return res.status(403).json({ success: false, error: 'User is not an authorized administrator.' });
        }

        const admin = userRes.recordset[0];
        return res.status(200).json({
            success: true,
            isAdmin: true,
            user: {
                userId: admin.user_id,
                fullName: admin.full_name,
                phone: admin.phone,
                role: 'ADMIN'
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// POST /api/admin/change-password: Change admin account password
app.post('/api/admin/change-password', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'Admin authorization required' });
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        } catch {
            return res.status(401).json({ success: false, error: 'Invalid token' });
        }

        const { currentPassword, newPassword } = req.body;
        if (!newPassword || newPassword.trim().length < 4) {
            return res.status(400).json({ success: false, error: 'New password must be at least 4 characters long.' });
        }

        const pool = await poolPromise;
        const adminCheck = await pool.request()
            .input('user_id', sql.Int, decoded.userId)
            .query('SELECT TOP 1 user_id, full_name, role, password FROM dbo.[user] WHERE user_id = @user_id AND UPPER(role) = \'ADMIN\'');

        if (!adminCheck.recordset || adminCheck.recordset.length === 0) {
            return res.status(403).json({ success: false, error: 'Unauthorized admin user' });
        }

        const admin = adminCheck.recordset[0];
        if (currentPassword) {
            const sha256 = crypto.createHash('sha256').update(currentPassword.trim()).digest('hex');
            const isMatch = (admin.password === currentPassword.trim()) || (admin.password === sha256);
            if (!isMatch) {
                return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
            }
        }

        await pool.request()
            .input('user_id', sql.Int, admin.user_id)
            .input('new_password', sql.NVarChar(255), newPassword.trim())
            .query('UPDATE dbo.[user] SET [password] = @new_password WHERE user_id = @user_id');

        return res.status(200).json({
            success: true,
            message: 'Admin password updated successfully.'
        });
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

// AUTHENTICATION ENDPOINTS (Legacy redirects to WhatsApp OTP)
app.post('/api/auth/login', async (req, res) => {
    return res.status(400).json({
        success: false,
        error: 'Customer login uses WhatsApp OTP. If you are an admin, please sign in via the Admin Studio.'
    });
});

app.post('/api/auth/register', async (req, res) => {
    return res.status(400).json({
        success: false,
        error: 'Registration is now instant via WhatsApp OTP. Please enter your mobile number on the login page.'
    });
});

// POST & PUT /api/auth/profile: Update user profile details
async function handleUpdateProfile(req, res) {
    try {
        const authHeader = req.headers.authorization;
        let userId = req.body.userId;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
                if (decoded && decoded.userId) {
                    userId = decoded.userId;
                }
            } catch { }
        }

        if (!userId) {
            return res.status(401).json({ success: false, error: 'User session required to edit profile' });
        }

        const { fullName, phone } = req.body;
        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, error: 'Database connection unavailable' });
        }

        const trimmedName = fullName ? fullName.trim() : null;
        const cleanedPhone = phone ? cleanPhoneNumber(phone) : null;

        await pool.request()
            .input('userId', sql.Int, userId)
            .input('fullName', sql.NVarChar(100), trimmedName)
            .input('phone', sql.NVarChar(20), cleanedPhone)
            .query(`
                UPDATE dbo.[user]
                SET full_name = COALESCE(@fullName, full_name),
                    phone = COALESCE(@phone, phone)
                WHERE user_id = @userId
            `);

        const updatedResult = await pool.request()
            .input('userId', sql.Int, userId)
            .query('SELECT TOP 1 user_id, full_name, phone, role FROM dbo.[user] WHERE user_id = @userId');

        if (!updatedResult.recordset || updatedResult.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        const user = updatedResult.recordset[0];
        const roleStr = (user.role || 'CUSTOMER').toUpperCase();
        const userObj = {
            userId: user.user_id,
            fullName: user.full_name,
            phone: user.phone,
            role: roleStr
        };
        const token = Buffer.from(JSON.stringify(userObj)).toString('base64');

        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: userObj,
            token: token
        });
    } catch (err) {
        console.error('[Update Profile Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
}

app.post('/api/auth/profile', handleUpdateProfile);
app.put('/api/auth/profile', handleUpdateProfile);

// =========================================================================
// RECENTLY VIEWED PRODUCTS API (dbo.viewed)
// =========================================================================

// POST /api/viewed: Record a product view for a customer
app.post('/api/viewed', async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) return res.status(500).json({ success: false, error: 'Database connection unavailable' });

        let userId = req.body.userId || req.body.userid || null;
        const productId = parseInt(req.body.productId || req.body.productid, 10);

        if (!productId || isNaN(productId)) {
            return res.status(400).json({ success: false, error: 'Valid productId is required' });
        }

        // Try extracting userId from Bearer token if not explicitly provided in body
        if (!userId) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const token = authHeader.split(' ')[1];
                    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
                    if (decoded && decoded.userId) userId = decoded.userId;
                } catch { }
            }
        }

        const parsedUserId = userId && !isNaN(parseInt(userId, 10)) ? parseInt(userId, 10) : null;

        const spReq = pool.request();
        spReq.input('Opr', sql.NVarChar(10), 'INSERT');
        spReq.input('JSONstr', sql.NVarChar(sql.MAX), JSON.stringify({
            table_values: {
                productid: productId,
                userid: parsedUserId
            }
        }));

        await spReq.execute('dbo.SP_viewed');

        return res.status(200).json({
            success: true,
            message: 'Product view recorded in dbo.viewed',
            data: { productId, userId: parsedUserId }
        });
    } catch (err) {
        console.error('[Record Product View Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/viewed: Fetch recently viewed products for a customer (or list of productIds for guests)
app.get('/api/viewed', async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) return res.status(500).json({ success: false, error: 'Database connection unavailable' });

        let userId = req.query.userId || req.query.userid || null;

        // Try extracting userId from Bearer token if not in query
        if (!userId) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const token = authHeader.split(' ')[1];
                    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
                    if (decoded && decoded.userId) userId = decoded.userId;
                } catch { }
            }
        }

        const parsedUserId = userId && !isNaN(parseInt(userId, 10)) ? parseInt(userId, 10) : null;

        // If user is logged in, query from dbo.viewed via SP_viewed
        if (parsedUserId) {
            const spReq = pool.request();
            spReq.input('Opr', sql.NVarChar(10), 'SELECT');
            spReq.input('Condition', sql.NVarChar(255), String(parsedUserId));

            const result = await spReq.execute('dbo.SP_viewed');
            let items = result.recordset || [];

            items = items.map(item => {
                if (item.images_json) {
                    try {
                        const parsed = JSON.parse(item.images_json);
                        item.images = Array.isArray(parsed)
                            ? parsed.map(img => typeof img === 'string' ? img : (img.image_url || img.url || ''))
                            : [];
                    } catch {
                        item.images = [];
                    }
                    delete item.images_json;
                } else if (!item.images) {
                    item.images = [];
                }
                item.product_name = item.title;
                return item;
            });

            return res.status(200).json({
                success: true,
                count: items.length,
                data: items
            });
        }

        // If guest provided productIds (comma-separated: ?productIds=1,2,3)
        const productIdsStr = req.query.productIds || req.query.ids;
        if (productIdsStr) {
            const ids = productIdsStr.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id) && id > 0);
            if (ids.length > 0) {
                const idList = ids.slice(0, 20).join(',');
                const guestQuery = `
                    SELECT 
                        p.product_id,
                        p.product_id AS id,
                        p.category_id,
                        p.title,
                        p.title AS name,
                        p.title AS product_name,
                        p.description,
                        p.price,
                        p.discount,
                        p.quantity,
                        p.purity,
                        p.weight,
                        p.ideal_for,
                        p.color,
                        p.review,
                        p.sold,
                        c.[name] AS category_name,
                        c.slug AS category_slug,
                        (
                            SELECT img.image_url 
                            FROM dbo.product_image pi2 
                            JOIN dbo.image img ON pi2.image_id = img.image_id 
                            WHERE pi2.product_id = p.product_id 
                            FOR JSON PATH
                        ) AS images_json
                    FROM dbo.product p
                    LEFT JOIN dbo.category c ON p.category_id = c.category_id
                    WHERE p.product_id IN (${idList});
                `;
                const guestRes = await pool.request().query(guestQuery);
                let guestItems = guestRes.recordset || [];
                guestItems = guestItems.map(item => {
                    if (item.images_json) {
                        try {
                            const parsed = JSON.parse(item.images_json);
                            item.images = Array.isArray(parsed)
                                ? parsed.map(img => typeof img === 'string' ? img : (img.image_url || img.url || ''))
                                : [];
                        } catch {
                            item.images = [];
                        }
                        delete item.images_json;
                    }
                    return item;
                });

                // Preserve original order of IDs
                guestItems.sort((a, b) => ids.indexOf(a.product_id) - ids.indexOf(b.product_id));

                return res.status(200).json({
                    success: true,
                    count: guestItems.length,
                    data: guestItems
                });
            }
        }

        return res.status(200).json({ success: true, count: 0, data: [] });
    } catch (err) {
        console.error('[Fetch Recently Viewed Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ========================================================
// REVIEW SYSTEM REST ENDPOINTS
// ========================================================

// POST /api/reviews: Submit a customer review
app.post(['/api/reviews', '/api/review'], async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) return res.status(500).json({ success: false, error: 'Database connection unavailable' });

        const productId = parseInt(req.body.productId || req.body.productid, 10);
        if (!productId || isNaN(productId)) {
            return res.status(400).json({ success: false, error: 'Valid productId is required to submit a review' });
        }

        let userId = req.body.userId || req.body.userid || null;
        if (!userId) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                try {
                    const token = authHeader.split(' ')[1];
                    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
                    if (decoded && decoded.userId) userId = decoded.userId;
                } catch { }
            }
        }
        const parsedUserId = userId && !isNaN(parseInt(userId, 10)) ? parseInt(userId, 10) : null;

        const description = (req.body.description || req.body.comment || '').trim();
        let star = parseInt(req.body.star || req.body.rating || 5, 10);
        if (isNaN(star) || star < 1) star = 1;
        if (star > 5) star = 5;

        // Photos handling: accept array of URLs or string, limited to max 5
        let rawPhotos = req.body.photo || req.body.photos || [];
        let photosJson = null;
        if (Array.isArray(rawPhotos)) {
            const trimmed = rawPhotos.filter(Boolean).slice(0, 5);
            photosJson = trimmed.length > 0 ? JSON.stringify(trimmed) : null;
        } else if (typeof rawPhotos === 'string' && rawPhotos.trim()) {
            if (rawPhotos.trim().startsWith('[')) {
                try {
                    const parsed = JSON.parse(rawPhotos);
                    photosJson = JSON.stringify(parsed.slice(0, 5));
                } catch {
                    photosJson = JSON.stringify([rawPhotos.trim()]);
                }
            } else {
                photosJson = JSON.stringify(rawPhotos.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5));
            }
        }

        const spReq = pool.request();
        spReq.input('proc_name', sql.NVarChar(50), 'review');
        spReq.input('Opr', sql.NVarChar(10), 'INSERT');
        spReq.input('JSONstr', sql.NVarChar(sql.MAX), JSON.stringify({
            table_values: {
                productid: productId,
                userid: parsedUserId,
                description,
                photo: photosJson,
                star
            }
        }));

        const result = await spReq.execute('dbo.SP_GETDATA');
        const inserted = result.recordsets?.[0]?.[0] || {};

        return res.status(200).json({
            success: true,
            message: 'Review submitted successfully',
            data: {
                reviewId: inserted.reviewid,
                productId,
                userId: parsedUserId,
                star,
                description
            }
        });
    } catch (err) {
        console.error('[Submit Review Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/reviews or /api/reviews/:productId: Fetch reviews for a product or user
app.get(['/api/reviews', '/api/reviews/:productId', '/api/review'], async (req, res) => {
    try {
        const pool = await poolPromise;
        if (!pool) return res.status(500).json({ success: false, error: 'Database connection unavailable' });

        const productId = req.params.productId || req.query.productId || req.query.productid || null;
        const userId = req.query.userId || req.query.userid || null;
        const reviewId = req.query.reviewId || req.query.reviewid || null;

        const condition = reviewId || productId || null;

        const fetchReq = pool.request();
        fetchReq.input('proc_name', sql.NVarChar(50), 'review');
        fetchReq.input('Condition', sql.NVarChar(255), condition ? String(condition) : null);
        if (userId) {
            fetchReq.input('JSONstr', sql.NVarChar(sql.MAX), JSON.stringify({
                table_values: { userid: parseInt(userId, 10) }
            }));
        }

        const fetchResult = await fetchReq.execute('dbo.SP_Fetchdata');
        let reviews = fetchResult.recordsets?.[0] || [];

        reviews = reviews.map(item => {
            if (item.photo) {
                try {
                    const parsed = JSON.parse(item.photo);
                    item.photos = Array.isArray(parsed)
                        ? parsed.map(p => typeof p === 'string' ? p : (p.value || p.url || ''))
                        : [item.photo];
                } catch {
                    item.photos = typeof item.photo === 'string' && item.photo.includes(',')
                        ? item.photo.split(',').map(s => s.trim())
                        : [item.photo];
                }
            } else {
                item.photos = [];
            }
            return item;
        });

        // Compute aggregate metrics if reviews exist
        const total = reviews.length;
        const avgRating = total > 0
            ? parseFloat((reviews.reduce((sum, r) => sum + (Number(r.star) || 5), 0) / total).toFixed(1))
            : 5.0;

        return res.status(200).json({
            success: true,
            total,
            averageRating: avgRating,
            data: reviews
        });
    } catch (err) {
        console.error('[Fetch Reviews Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 1. Single unified endpoint handling all operations from forms & API
app.post('/api/data', async (req, res) => {
    try {
        const { proc_name, opr, table_values, condition } = req.body;

        if (!proc_name || !opr) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: proc_name and opr are mandatory.'
            });
        }

        const jsonStr = table_values ? JSON.stringify({ table_values }) : null;

        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({
                success: false,
                error: 'Database connection is not available.'
            });
        }

        let normalizedProc = (proc_name || '').trim().toLowerCase();
        if (normalizedProc === 'order') normalizedProc = 'orders';
        const operation = (opr || '').trim().toUpperCase();

        // 1. ALL FETCHING / QUERYING IS ROUTED THROUGH dbo.SP_Fetchdata
        if (operation === 'SELECT') {
            const fetchReq = pool.request();
            fetchReq.input('proc_name', sql.NVarChar(50), normalizedProc);
            fetchReq.input('JSONstr', sql.NVarChar(sql.MAX), jsonStr);
            fetchReq.input('Condition', sql.NVarChar(255), condition !== undefined && condition !== null ? String(condition) : null);

            const fetchResult = await fetchReq.execute('dbo.SP_Fetchdata');
            const recordsets = fetchResult.recordsets;
            let data = recordsets.length > 1
                ? recordsets[0]
                : (recordsets.length === 1 && !recordsets[0][0]?.Response_Status ? recordsets[0] : []);

            if (Array.isArray(data)) {
                data = data.map(item => {
                    if (item.images_json) {
                        try {
                            const parsed = JSON.parse(item.images_json);
                            item.images = Array.isArray(parsed)
                                ? parsed.map(img => typeof img === 'string' ? img : (img.image_url || img.url || ''))
                                : [];
                        } catch (e) {
                            item.images = [];
                        }
                        delete item.images_json;
                    } else if (normalizedProc === 'product' && !item.images) {
                        item.images = [];
                    }
                    if (item.items_json) {
                        try {
                            item.items = JSON.parse(item.items_json);
                        } catch (e) {
                            item.items = [];
                        }
                        delete item.items_json;
                    }
                    if (!item.product_name && item.title) {
                        item.product_name = item.title;
                    }
                    if (!item.category_name && item.category) {
                        item.category_name = item.category;
                    }
                    if (normalizedProc === 'product') {
                        item.color = item.color || 'Silver';
                        item.review = item.review !== undefined ? Number(item.review) : (item.reviewsCount || 0);
                        item.sold = item.sold !== undefined ? Number(item.sold) : 0;
                    }
                    if (normalizedProc === 'review' || normalizedProc === 'reviews') {
                        if (item.photo) {
                            try {
                                const parsed = JSON.parse(item.photo);
                                item.photos = Array.isArray(parsed)
                                    ? parsed.map(p => typeof p === 'string' ? p : (p.value || p.url || ''))
                                    : [item.photo];
                            } catch {
                                item.photos = typeof item.photo === 'string' && item.photo.includes(',')
                                    ? item.photo.split(',').map(s => s.trim())
                                    : [item.photo];
                            }
                        } else {
                            item.photos = [];
                        }
                    }
                    return item;
                });
            }

            return res.status(200).json({
                success: true,
                status: 'OK',
                total: data.length,
                data: data
            });
        }

        // 2. ALL CALLING / MUTATIONS (ADD, INSERT, EDIT, DELETE, UPDATE_QTY, RESTOCK) ARE ROUTED THROUGH dbo.SP_GETDATA
        let mutationProc = normalizedProc;
        const isCustomOrderProc = (mutationProc === 'custom_orders' || mutationProc === 'custom_order');
        if (isCustomOrderProc) mutationProc = 'orders';

        // Ready-made orders strictly DO NOT have confirm status ('processing', 'accepted', 'rejected')
        if (mutationProc === 'orders' && !isCustomOrderProc && table_values) {
            if (!table_values.is_custom) {
                delete table_values.confirm;
                delete table_values.custom_category;
            }
        }

        // Only ADMINs are permitted to have password; customers are strictly NULL
        if (mutationProc === 'user' && table_values) {
            const userRole = (table_values.role || '').toUpperCase();
            if (userRole !== 'ADMIN') {
                table_values.password = null;
            } else if (table_values.password) {
                table_values.password = String(table_values.password).trim();
            }
        }

        // Review payload sanitization (max 5 photos, 1-5 star bounds)
        if ((mutationProc === 'review' || mutationProc === 'reviews') && table_values) {
            if (table_values.photo && Array.isArray(table_values.photo)) {
                table_values.photo = JSON.stringify(table_values.photo.filter(Boolean).slice(0, 5));
            }
            if (table_values.star !== undefined) {
                let s = parseInt(table_values.star, 10);
                if (isNaN(s) || s < 1) s = 1;
                if (s > 5) s = 5;
                table_values.star = s;
            }
        }

        const effectiveJsonStr = table_values ? JSON.stringify({ table_values }) : jsonStr;

        // Customer Order Validation (Supports verified accounts and guest checkout)
        if (mutationProc === 'orders' && (operation === 'ADD' || operation === 'INSERT')) {
            const parsedUserId = table_values && (table_values.user_id || table_values.userId);
            const isGuest = !parsedUserId || isNaN(parseInt(parsedUserId, 10)) || parseInt(parsedUserId, 10) <= 0;
            const paymentMethod = ((table_values && table_values.payment_method) || '').trim().toLowerCase();

            if (isGuest) {
                // Strictly disallow Cash on Delivery (COD) for guest orders to eliminate fake orders
                if (paymentMethod === 'cod') {
                    return res.status(400).json({
                        success: false,
                        error: 'Cash on Delivery (COD) is disabled for guest checkout to prevent fake orders. Please pay online or sign in to your account.'
                    });
                }

                // Guest orders must provide customer contact information
                const custPhone = table_values && (table_values.customer_phone || table_values.phone);
                const custName = table_values && (table_values.customer_name || table_values.name);
                if (!custPhone || !custName) {
                    return res.status(400).json({
                        success: false,
                        error: 'Customer name and phone number are required for guest checkout.'
                    });
                }
            }
        }

        const request = pool.request();
        request.input('proc_name', sql.NVarChar(50), mutationProc);
        request.input('Opr', sql.NVarChar(20), operation);
        request.input('JSONstr', sql.NVarChar(sql.MAX), effectiveJsonStr);
        request.input('Condition', sql.NVarChar(255), condition !== undefined && condition !== null ? String(condition) : null);

        const result = await request.execute('dbo.SP_GETDATA');

        const recordsets = result.recordsets;
        const statusRecord = recordsets.length > 0 ? recordsets[recordsets.length - 1] : null;
        const status = statusRecord && statusRecord[0] ? statusRecord[0].Response_Status : 'OK';

        if (typeof status === 'string' && (
            status.startsWith('ERROR') ||
            status.startsWith('VALIDATION') ||
            status.startsWith('SECURITY') ||
            status.startsWith('DATABASE') ||
            status.startsWith('Not Found') ||
            status.startsWith('Constraint Error')
        )) {
            return res.status(400).json({
                success: false,
                status: status,
                error: status
            });
        }

        let data = recordsets.length > 1 ? recordsets[0] : (recordsets.length === 1 && !recordsets[0][0]?.Response_Status ? recordsets[0] : null);

        return res.status(200).json({
            success: true,
            status: status,
            data: data
        });

    } catch (err) {
        console.error('[API Error]:', err.message);
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

// ==========================================
// STORE PARAMETERS API (Directly from store_parameter database table)
// ==========================================
app.get('/api/parameters', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT TOP 1 * FROM store_parameter ORDER BY id DESC');
        if (!result.recordset || result.recordset.length === 0) {
            return res.status(200).json({
                success: true,
                parameters: null
            });
        }

        const row = result.recordset[0];
        return res.status(200).json({
            success: true,
            parameters: row
        });
    } catch (err) {
        console.error('[Store Parameters GET Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// ==========================================
// COMPANY DETAILS API (Directly from dbo.SP_Fetchdata / dbo.company)
// ==========================================
app.get('/api/company', async (req, res) => {
    try {
        const pool = await poolPromise;
        const fetchReq = pool.request();
        fetchReq.input('proc_name', sql.NVarChar(50), 'company');
        fetchReq.input('JSONstr', sql.NVarChar(sql.MAX), null);
        fetchReq.input('Condition', sql.NVarChar(255), null);

        const fetchResult = await fetchReq.execute('dbo.SP_Fetchdata');
        const company = (fetchResult.recordset && fetchResult.recordset[0]) || null;

        return res.status(200).json({
            success: true,
            company
        });
    } catch (err) {
        console.error('[Company Details GET Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/admin/parameters', async (req, res) => {
    try {
        const pool = await poolPromise;
        const {
            default_theme,
            wp_api,
            wp_api_url,
            current_festival
        } = req.body;

        const effectiveWpApi = wp_api || wp_api_url || null;
        const request = pool.request();
        const countRes = await pool.request().query('SELECT COUNT(*) as count FROM store_parameter');
        const hasRow = countRes.recordset[0].count > 0;

        let query = '';
        if (hasRow) {
            query = `
                UPDATE TOP(1) store_parameter
                SET default_theme = COALESCE(@default_theme, default_theme),
                    wp_api = COALESCE(@wp_api, wp_api),
                    current_festival = COALESCE(@current_festival, current_festival),
                    updated_at = GETDATE();
            `;
        } else {
            query = `
                INSERT INTO store_parameter (
                    default_theme, wp_api, current_festival
                ) VALUES (
                    COALESCE(@default_theme, 'royal-gold'),
                    @wp_api,
                    COALESCE(@current_festival, 'Diwali Festive Sale')
                );
            `;
        }

        request.input('default_theme', sql.NVarChar(50), default_theme || null);
        request.input('wp_api', sql.NVarChar(500), effectiveWpApi);
        request.input('current_festival', sql.NVarChar(100), current_festival || null);

        await request.query(query);
        const updated = await pool.request().query('SELECT TOP 1 * FROM store_parameter ORDER BY id DESC');
        return res.status(200).json({
            success: true,
            message: 'Store parameters updated successfully.',
            parameters: updated.recordset[0]
        });
    } catch (err) {
        console.error('[Store Parameters UPDATE Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Static assets & HTML views
// Serve Backend/public (uploads, images, html, scripts)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

// Fallback to parent repository public assets if running from monorepo root
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'catalog.html'));
});

app.get('/custom-orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'custom-orders.html'));
});

app.get('/admin/custom-orders', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'custom-orders.html'));
});

app.get('/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
});

app.get('/admin/analytics', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
});

app.get('/api/data', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/api/:file', (req, res, next) => {
    const file = req.params.file;
    const filePath = path.join(__dirname, 'public', file);
    if (file.endsWith('.html') && fs.existsSync(filePath)) {
        return res.sendFile(filePath);
    }
    next();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Admin Dashboard: http://localhost:${PORT}`);
    console.log(`Product Catalog: http://localhost:${PORT}/catalog`);
    console.log(`Data API Endpoint: http://localhost:${PORT}/api/data`);
});

// =========================================================================
// AUTOMATIC EXPIRED OTP CLEANUP JOB
// =========================================================================
async function cleanupExpiredOtps() {
    try {
        const pool = await poolPromise;
        if (pool) {
            const cleanupResult = await pool.request().query('DELETE FROM dbo.phone_otp WHERE expires_at < SYSUTCDATETIME()');
            if (cleanupResult.rowsAffected && cleanupResult.rowsAffected[0] > 0) {
                console.log(`[OTP Auto-Cleanup] Purged ${cleanupResult.rowsAffected[0]} expired OTP record(s) from dbo.phone_otp.`);
            }
        }
    } catch (err) {
        console.warn('[OTP Auto-Cleanup Warning]:', err.message);
    }
}

// Initial purge after startup and recurring every 30 seconds
setTimeout(cleanupExpiredOtps, 3000);
setInterval(cleanupExpiredOtps, 30 * 1000);