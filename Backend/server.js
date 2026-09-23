const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { sql, poolPromise } = require('./db');
require('dotenv').config();

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

// Allowed confirmation statuses as enforced by DB constraint CK_orders_confirm
const ALLOWED_CONFIRM_STATUSES = ['processing', 'rejected', 'accepted'];

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

// PUT /api/admin/custom-orders/:id: Update quotation price and confirmation status
app.put('/api/admin/custom-orders/:id', async (req, res) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        if (isNaN(orderId)) {
            return res.status(400).json({ success: false, error: 'Invalid order ID provided.' });
        }

        const { confirm, final_payable } = req.body;

        if (confirm !== undefined && confirm !== null) {
            const normalizedStatus = String(confirm).trim().toLowerCase();
            if (!ALLOWED_CONFIRM_STATUSES.includes(normalizedStatus)) {
                return res.status(400).json({
                    success: false,
                    error: `Invalid confirm status '${confirm}'. Allowed values are strictly: 'processing', 'rejected', 'accepted'.`
                });
            }
        }

        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, error: 'Database connection unavailable.' });
        }

        // Fetch current order to ensure it exists
        const checkReq = pool.request();
        checkReq.input('order_id', sql.Int, orderId);
        const existing = await checkReq.query('SELECT order_id, [confirm], final_payable, total_amount FROM dbo.orders WHERE order_id = @order_id');
        if (!existing.recordset || existing.recordset.length === 0) {
            return res.status(404).json({ success: false, error: 'Custom order not found.' });
        }

        const current = existing.recordset[0];
        const newStatus = confirm !== undefined ? String(confirm).trim().toLowerCase() : current.confirm;
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
    let cleaned = String(rawPhone).replace(/[^\d+]/g, '').trim();
    // If 10 digits without prefix, default to India (+91)
    if (/^\d{10}$/.test(cleaned)) {
        cleaned = '+91' + cleaned;
    } else if (/^91\d{10}$/.test(cleaned)) {
        cleaned = '+' + cleaned;
    }
    return cleaned;
}

async function sendWhatsAppOtp(phone, otp) {
    const message = `✨ *SilverHouse Fine Jewelry*\n\nYour one-time WhatsApp verification code is: *${otp}*\n\nValid for 5 minutes. Please do not share this sacred code with anyone.\n\n_Pure 925 & 999 Artisanal Silver_`;

    console.log(`\n======================================================`);
    console.log(`[WhatsApp OTP Gateway] 💬 Outgoing WhatsApp Message:`);
    console.log(`To: ${phone}`);
    console.log(`OTP: ${otp}`);
    console.log(`Message:\n${message}`);
    console.log(`======================================================\n`);

    // Dispatches via external WhatsApp API gateway if configured
    if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN) {
        try {
            await fetch(process.env.WHATSAPP_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`
                },
                body: JSON.stringify({
                    to: phone,
                    message: message
                })
            });
            console.log(`[WhatsApp Gateway] Successfully dispatched to provider for ${phone}`);
        } catch (apiErr) {
            console.warn(`[WhatsApp Gateway Warning] Provider dispatch failed:`, apiErr.message);
        }
    }
    return true;
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

        // Send via WhatsApp
        await sendWhatsAppOtp(cleanedPhone, otp);

        return res.status(200).json({
            success: true,
            message: `Verification code sent to WhatsApp (${cleanedPhone})`,
            phone: cleanedPhone,
            devOtp: otp
        });
    } catch (err) {
        console.error('[Send OTP Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// 2. POST /api/auth/verify-otp: Verify WhatsApp OTP & Login/Register Customer
app.post('/api/auth/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        const cleanedPhone = cleanPhoneNumber(phone);

        if (!cleanedPhone || !otp) {
            return res.status(400).json({ success: false, error: 'Phone number and 6-digit OTP are required.' });
        }

        const pool = await poolPromise;
        if (!pool) {
            return res.status(500).json({ success: false, error: 'Database connection unavailable.' });
        }

        // Verify OTP against dbo.phone_otp
        const otpResult = await pool.request()
            .input('phone', sql.NVarChar(20), cleanedPhone)
            .query('SELECT phone, otp_code, expires_at, attempts FROM dbo.phone_otp WHERE phone = @phone');

        if (!otpResult.recordset || otpResult.recordset.length === 0) {
            return res.status(400).json({ success: false, error: 'No active OTP found for this phone number. Please request a new code.' });
        }

        const record = otpResult.recordset[0];

        if (new Date() > new Date(record.expires_at)) {
            return res.status(400).json({ success: false, error: 'OTP has expired. Please request a new code on WhatsApp.' });
        }

        if (record.attempts >= 5) {
            return res.status(429).json({ success: false, error: 'Too many incorrect attempts. Please request a new OTP.' });
        }

        if (record.otp_code.trim() !== String(otp).trim()) {
            await pool.request()
                .input('phone', sql.NVarChar(20), cleanedPhone)
                .query('UPDATE dbo.phone_otp SET attempts = attempts + 1 WHERE phone = @phone');
            return res.status(400).json({ success: false, error: 'Invalid verification code. Please check your WhatsApp.' });
        }

        // OTP is valid! Clean up consumed OTP
        await pool.request()
            .input('phone', sql.NVarChar(20), cleanedPhone)
            .query('DELETE FROM dbo.phone_otp WHERE phone = @phone');

        // Lookup user in dbo.[user] by phone or last 10 digits
        const digitsOnly = cleanedPhone.replace(/\D/g, '');
        const last10Digits = digitsOnly.slice(-10);

        const userResult = await pool.request()
            .input('phone', sql.NVarChar(20), cleanedPhone)
            .input('last10', sql.NVarChar(20), '%' + last10Digits)
            .query('SELECT TOP 1 user_id, full_name, email, phone, role FROM dbo.[user] WHERE phone = @phone OR phone LIKE @last10');

        let user;
        if (userResult.recordset && userResult.recordset.length > 0) {
            user = userResult.recordset[0];
        } else {
            // Auto-create patron account
            const defaultName = `Patron ${cleanedPhone.slice(-4)}`;
            const insertResult = await pool.request()
                .input('full_name', sql.NVarChar(100), defaultName)
                .input('phone', sql.NVarChar(20), cleanedPhone)
                .input('role', sql.NVarChar(20), 'CUSTOMER')
                .query('INSERT INTO dbo.[user] (full_name, phone, role) OUTPUT INSERTED.user_id, INSERTED.full_name, INSERTED.email, INSERTED.phone, INSERTED.role VALUES (@full_name, @phone, @role)');
            user = insertResult.recordset[0];
        }

        const roleStr = (user.role || 'CUSTOMER').toUpperCase();
        const isAdmin = roleStr === 'ADMIN';

        const userObj = {
            userId: user.user_id,
            fullName: user.full_name,
            email: user.email || '',
            phone: user.phone || cleanedPhone,
            role: roleStr
        };

        const token = Buffer.from(JSON.stringify(userObj)).toString('base64');

        return res.status(200).json({
            success: true,
            message: 'Phone verified successfully',
            token: token,
            user: userObj,
            role: userObj.role,
            isAdmin: isAdmin,
            redirectUrl: isAdmin ? (process.env.ADMIN_URL || 'https://silverhouse-pap9.onrender.com/') : '/'
        });
    } catch (err) {
        console.error('[Verify OTP Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// AUTHENTICATION ENDPOINTS (Login, Register, Session Verification)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.NVarChar(150), email.trim())
            .query('SELECT user_id, full_name, email, phone, password_hash, role FROM dbo.[user] WHERE LOWER(email) = LOWER(@email)');

        if (!result.recordset || result.recordset.length === 0) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        const user = result.recordset[0];
        if (password.trim() !== user.password_hash.trim()) {
            return res.status(401).json({ success: false, error: 'Invalid email or password.' });
        }

        const isAdmin = user.role.toUpperCase() === 'ADMIN';
        const userObj = {
            userId: user.user_id,
            fullName: user.full_name,
            email: user.email,
            phone: user.phone || '',
            role: user.role.toUpperCase()
        };

        const token = Buffer.from(JSON.stringify(userObj)).toString('base64');

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: userObj,
            role: userObj.role,
            isAdmin: isAdmin,
            redirectUrl: isAdmin ? (process.env.ADMIN_URL || 'https://silverhouse-pap9.onrender.com/') : '/'
        });
    } catch (err) {
        console.error('[Auth Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { fullName, email, phone, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ success: false, error: 'Full name, email, and password are required.' });
        }

        const pool = await poolPromise;
        const checkResult = await pool.request()
            .input('email', sql.NVarChar(150), email.trim())
            .query('SELECT user_id FROM dbo.[user] WHERE LOWER(email) = LOWER(@email)');

        if (checkResult.recordset && checkResult.recordset.length > 0) {
            return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
        }

        const insertResult = await pool.request()
            .input('full_name', sql.NVarChar(100), fullName.trim())
            .input('email', sql.NVarChar(150), email.trim())
            .input('phone', sql.NVarChar(20), phone ? phone.trim() : null)
            .input('password_hash', sql.NVarChar(255), password.trim())
            .input('role', sql.NVarChar(20), 'CUSTOMER')
            .query('INSERT INTO dbo.[user] (full_name, email, phone, password_hash, role) OUTPUT INSERTED.user_id VALUES (@full_name, @email, @phone, @password_hash, @role)');

        const newUserId = insertResult.recordset[0].user_id;

        const userObj = {
            userId: newUserId,
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone ? phone.trim() : '',
            role: 'CUSTOMER'
        };

        const token = Buffer.from(JSON.stringify(userObj)).toString('base64');

        return res.status(201).json({
            success: true,
            message: 'Registration successful',
            token: token,
            user: userObj,
            role: 'CUSTOMER',
            isAdmin: false,
            redirectUrl: '/'
        });
    } catch (err) {
        console.error('[Register Error]:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.get('/api/auth/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }
        const token = authHeader.substring(7);
        const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
        return res.status(200).json({ success: true, user: decoded });
    } catch {
        return res.status(401).json({ success: false, error: 'Invalid token' });
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
        if (mutationProc === 'custom_orders' || mutationProc === 'custom_order') mutationProc = 'orders';

        // Strict Customer Authentication for Order Creation
        if (mutationProc === 'orders' && (operation === 'ADD' || operation === 'INSERT')) {
            const parsedUserId = table_values && (table_values.user_id || table_values.userId);
            if (!parsedUserId || isNaN(parseInt(parsedUserId, 10)) || parseInt(parsedUserId, 10) <= 0) {
                return res.status(401).json({
                    success: false,
                    error: 'Customer must be logged in to place an order. Please sign in or register.'
                });
            }
        }

        const request = pool.request();
        request.input('proc_name', sql.NVarChar(50), mutationProc);
        request.input('Opr', sql.NVarChar(20), operation);
        request.input('JSONstr', sql.NVarChar(sql.MAX), jsonStr);
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

// 2. Static assets & HTML views
// Serve Backend/public (uploads, images, html, scripts)
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
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