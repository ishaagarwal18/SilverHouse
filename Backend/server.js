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
            redirectUrl: isAdmin ? 'http://localhost:5000' : '/'
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

        // Direct handler for querying categories with joined image_url
        if (normalizedProc === 'category' && opr.toUpperCase() === 'SELECT') {
            try {
                const catResult = await pool.request().query(`
                    SELECT 
                        c.category_id,
                        c.name,
                        c.description,
                        c.slug,
                        c.ideal_for,
                        c.image_id,
                        i.image_url
                    FROM dbo.category c
                    LEFT JOIN dbo.image i ON c.image_id = i.image_id
                    ORDER BY c.category_id ASC;
                `);
                return res.status(200).json({
                    success: true,
                    status: 'OK',
                    total: catResult.recordset.length,
                    data: catResult.recordset
                });
            } catch (err) {
                console.warn('[Category Select Fallback]:', err.message);
            }
        }

        // Direct handler for creating orders and order items from checkout
        if (normalizedProc === 'orders' && (opr.toUpperCase() === 'ADD' || opr.toUpperCase() === 'INSERT')) {
            try {
                const vals = table_values || {};
                const orderNum = vals.order_number || ('SH-' + Date.now().toString().slice(-6));
                const userId = vals.user_id ? Number(vals.user_id) : null;
                const addressId = vals.address_id ? Number(vals.address_id) : null;
                const totalAmt = Number(vals.total_amount || 0);
                const discountAmt = Number(vals.discount_amount || 0);
                const finalPayable = Number(vals.final_payable || (totalAmt - discountAmt));
                const paymentStatus = vals.payment_status || 'PAID';

                const insertReq = pool.request();
                insertReq.input('order_number', sql.NVarChar(50), orderNum);
                insertReq.input('user_id', sql.Int, userId);
                insertReq.input('address_id', sql.Int, addressId);
                insertReq.input('total_amount', sql.Decimal(18, 2), totalAmt);
                insertReq.input('discount_amount', sql.Decimal(18, 2), discountAmt);
                insertReq.input('final_payable', sql.Decimal(18, 2), finalPayable);
                insertReq.input('payment_status', sql.NVarChar(20), paymentStatus);

                const insResult = await insertReq.query(`
                    INSERT INTO dbo.orders (order_number, user_id, address_id, total_amount, discount_amount, final_payable, payment_status, created_at)
                    OUTPUT INSERTED.order_id
                    VALUES (@order_number, @user_id, @address_id, @total_amount, @discount_amount, @final_payable, @payment_status, SYSDATETIME());
                `);

                const newOrderId = insResult.recordset[0]?.order_id;

                // Insert items into order_item if provided
                if (newOrderId && Array.isArray(vals.items)) {
                    for (const itm of vals.items) {
                        try {
                            const pId = itm.product_id || itm.id;
                            if (pId) {
                                const itemReq = pool.request();
                                itemReq.input('order_id', sql.Int, newOrderId);
                                itemReq.input('product_id', sql.Int, Number(pId));
                                itemReq.input('unit_price', sql.Decimal(18, 2), Number(itm.unit_price || itm.price || 0));
                                itemReq.input('discount_percent', sql.Decimal(18, 2), Number(itm.discount_percent || 0));
                                itemReq.input('quantity', sql.Int, Number(itm.quantity || itm.qty || 1));
                                itemReq.input('subtotal', sql.Decimal(18, 2), Number(itm.subtotal || ((itm.unit_price || itm.price || 0) * (itm.quantity || itm.qty || 1))));

                                await itemReq.query(`
                                    INSERT INTO dbo.order_item (order_id, product_id, unit_price, discount_percent, quantity, subtotal)
                                    VALUES (@order_id, @product_id, @unit_price, @discount_percent, @quantity, @subtotal);
                                `);
                            }
                        } catch (itemErr) {
                            console.warn('[Order Item Insert Warning]:', itemErr.message);
                        }
                    }
                }

                return res.status(200).json({
                    success: true,
                    status: 'OK',
                    data: [{ order_id: newOrderId, order_number: orderNum, final_payable: finalPayable, message: 'Order placed successfully' }]
                });
            } catch (orderErr) {
                console.error('[Order Insert Error]:', orderErr.message);
                return res.status(500).json({ success: false, error: orderErr.message });
            }
        }

        // Direct handler for querying orders with user & address details
        if (normalizedProc === 'orders' && opr.toUpperCase() === 'SELECT') {
            try {
                const selectReq = pool.request();
                let filterClause = '';
                const uid = condition || table_values?.user_id;
                if (uid && !isNaN(Number(uid))) {
                    selectReq.input('uid', sql.Int, Number(uid));
                    filterClause = 'WHERE o.user_id = @uid';
                }

                const ordersResult = await selectReq.query(`
                    SELECT 
                        o.order_id,
                        o.order_number,
                        o.user_id,
                        ISNULL(u.full_name, 'Guest Patron') AS customer_name,
                        u.email AS customer_email,
                        u.phone AS customer_phone,
                        o.address_id,
                        a.recipient_name,
                        a.city,
                        a.pincode,
                        ISNULL(a.street + ', ' + a.city + ' - ' + a.pincode, 'Registered Address') AS delivery_address,
                        o.total_amount,
                        o.discount_amount,
                        o.final_payable,
                        o.payment_status,
                        o.created_at
                    FROM dbo.orders o
                    LEFT JOIN dbo.[user] u ON o.user_id = u.user_id
                    LEFT JOIN dbo.address a ON o.address_id = a.address_id
                    ${filterClause}
                    ORDER BY o.order_id DESC;
                `);

                const orderRows = ordersResult.recordset || [];

                if (orderRows.length > 0) {
                    const orderIds = orderRows.map(o => o.order_id);
                    const itemsReq = pool.request();
                    const itemsResult = await itemsReq.query(`
                        SELECT 
                            oi.order_item_id,
                            oi.order_id,
                            oi.product_id,
                            p.title AS product_name,
                            p.price AS current_price,
                            oi.unit_price,
                            oi.discount_percent,
                            oi.quantity,
                            oi.subtotal
                        FROM dbo.order_item oi
                        LEFT JOIN dbo.product p ON oi.product_id = p.product_id
                        WHERE oi.order_id IN (${orderIds.join(',')});
                    `);

                    const itemsByOrder = {};
                    (itemsResult.recordset || []).forEach(item => {
                        if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
                        itemsByOrder[item.order_id].push(item);
                    });

                    orderRows.forEach(o => {
                        o.items = itemsByOrder[o.order_id] || [];
                    });
                }

                return res.status(200).json({
                    success: true,
                    status: 'OK',
                    total: orderRows.length,
                    data: orderRows
                });
            } catch (selectErr) {
                console.warn('[Orders Select Fallback]:', selectErr.message);
            }
        }

        // Direct handler for deleting orders
        if (normalizedProc === 'orders' && opr.toUpperCase() === 'DELETE' && condition) {
            try {
                const delReq = pool.request();
                delReq.input('order_id', sql.Int, Number(condition));
                await delReq.query(`
                    DELETE FROM dbo.order_item WHERE order_id = @order_id;
                    DELETE FROM dbo.orders WHERE order_id = @order_id;
                `);
                return res.status(200).json({ success: true, status: 'OK', message: 'Order deleted successfully' });
            } catch (delErr) {
                return res.status(500).json({ success: false, error: delErr.message });
            }
        }

        // Direct handler for querying cart in Admin Studio or with user_id filter
        if (normalizedProc === 'cart' && opr.toUpperCase() === 'SELECT') {
            try {
                const cartReq = pool.request();
                let filterClause = '';
                const uid = condition || table_values?.user_id;
                if (uid && !isNaN(Number(uid))) {
                    cartReq.input('uid', sql.Int, Number(uid));
                    filterClause = 'WHERE c.user_id = @uid';
                }

                const cartResult = await cartReq.query(`
                    SELECT 
                        c.cart_id,
                        c.user_id,
                        ISNULL(u.full_name, 'Guest Patron') AS user_name,
                        u.email AS user_email,
                        c.guest_token,
                        (SELECT COUNT(*) FROM dbo.cart_item ci WHERE ci.cart_id = c.cart_id) AS total_items,
                        (SELECT ISNULL(SUM(ci.quantity), 0) FROM dbo.cart_item ci WHERE ci.cart_id = c.cart_id) AS total_quantity,
                        c.updated_at
                    FROM dbo.cart c
                    LEFT JOIN dbo.[user] u ON c.user_id = u.user_id
                    ${filterClause}
                    ORDER BY c.cart_id DESC;
                `);

                return res.status(200).json({
                    success: true,
                    status: 'OK',
                    total: cartResult.recordset.length,
                    data: cartResult.recordset
                });
            } catch (cartErr) {
                console.warn('[Cart Select Error]:', cartErr.message);
            }
        }

        // Direct handler for deleting cart
        if (normalizedProc === 'cart' && opr.toUpperCase() === 'DELETE' && condition) {
            try {
                const delReq = pool.request();
                delReq.input('cart_id', sql.Int, Number(condition));
                await delReq.query(`
                    DELETE FROM dbo.cart_item WHERE cart_id = @cart_id;
                    DELETE FROM dbo.cart WHERE cart_id = @cart_id;
                `);
                return res.status(200).json({ success: true, status: 'OK', message: 'Cart deleted successfully' });
            } catch (delErr) {
                return res.status(500).json({ success: false, error: delErr.message });
            }
        }

        // Direct handler for querying cart_item
        if (normalizedProc === 'cart_item' && opr.toUpperCase() === 'SELECT') {
            try {
                const ciReq = pool.request();
                let filterClause = '';
                const cartId = condition || table_values?.cart_id;
                if (cartId && !isNaN(Number(cartId))) {
                    ciReq.input('cartId', sql.Int, Number(cartId));
                    filterClause = 'WHERE ci.cart_id = @cartId';
                }

                const ciResult = await ciReq.query(`
                    SELECT 
                        ci.cart_item_id,
                        ci.cart_id,
                        c.user_id,
                        ISNULL(u.full_name, 'Guest Patron') AS user_name,
                        ci.product_id,
                        p.title AS product_name,
                        p.price AS unit_price,
                        ci.quantity,
                        CAST(p.price * ci.quantity AS DECIMAL(18,2)) AS subtotal,
                        ci.created_at
                    FROM dbo.cart_item ci
                    LEFT JOIN dbo.cart c ON ci.cart_id = c.cart_id
                    LEFT JOIN dbo.[user] u ON c.user_id = u.user_id
                    LEFT JOIN dbo.product p ON ci.product_id = p.product_id
                    ${filterClause}
                    ORDER BY ci.cart_item_id DESC;
                `);

                return res.status(200).json({
                    success: true,
                    status: 'OK',
                    total: ciResult.recordset.length,
                    data: ciResult.recordset
                });
            } catch (ciErr) {
                console.warn('[Cart Item Select Error]:', ciErr.message);
            }
        }

        // Direct handler for deleting cart_item
        if (normalizedProc === 'cart_item' && opr.toUpperCase() === 'DELETE' && condition) {
            try {
                const delReq = pool.request();
                delReq.input('cart_item_id', sql.Int, Number(condition));
                await delReq.query(`
                    DELETE FROM dbo.cart_item WHERE cart_item_id = @cart_item_id;
                `);
                return res.status(200).json({ success: true, status: 'OK', message: 'Cart item deleted successfully' });
            } catch (delErr) {
                return res.status(500).json({ success: false, error: delErr.message });
            }
        }

        // Direct handler for querying order_item
        if (normalizedProc === 'order_item' && opr.toUpperCase() === 'SELECT') {
            try {
                const oiReq = pool.request();
                let filterClause = '';
                const orderId = condition || table_values?.order_id;
                if (orderId && !isNaN(Number(orderId))) {
                    oiReq.input('orderId', sql.Int, Number(orderId));
                    filterClause = 'WHERE oi.order_id = @orderId';
                }

                const oiResult = await oiReq.query(`
                    SELECT 
                        oi.order_item_id,
                        oi.order_id,
                        o.order_number,
                        oi.product_id,
                        p.title AS product_name,
                        oi.unit_price,
                        oi.discount_percent,
                        oi.quantity,
                        oi.subtotal
                    FROM dbo.order_item oi
                    LEFT JOIN dbo.orders o ON oi.order_id = o.order_id
                    LEFT JOIN dbo.product p ON oi.product_id = p.product_id
                    ${filterClause}
                    ORDER BY oi.order_item_id DESC;
                `);

                return res.status(200).json({
                    success: true,
                    status: 'OK',
                    total: oiResult.recordset.length,
                    data: oiResult.recordset
                });
            } catch (oiErr) {
                console.warn('[Order Item Select Error]:', oiErr.message);
            }
        }

        // Direct handler for deleting order_item
        if (normalizedProc === 'order_item' && opr.toUpperCase() === 'DELETE' && condition) {
            try {
                const delReq = pool.request();
                delReq.input('order_item_id', sql.Int, Number(condition));
                await delReq.query(`
                    DELETE FROM dbo.order_item WHERE order_item_id = @order_item_id;
                `);
                return res.status(200).json({ success: true, status: 'OK', message: 'Order item deleted successfully' });
            } catch (delErr) {
                return res.status(500).json({ success: false, error: delErr.message });
            }
        }

        // Special handler: When selecting products, use SP_Fetchdata to guarantee full joined dataset (categories & images)
        if (normalizedProc === 'product' && opr.toUpperCase() === 'SELECT') {
            try {
                const fetchReq = pool.request();
                fetchReq.input('proc_name', sql.NVarChar(50), 'product');
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
                        } else if (!item.images) {
                            item.images = [];
                        }
                        if (!item.product_name && item.title) {
                            item.product_name = item.title;
                        }
                        if (!item.category_name && item.category) {
                            item.category_name = item.category;
                        }
                        item.color = item.color || 'Silver';
                        item.review = item.review !== undefined ? Number(item.review) : (item.reviewsCount || 0);
                        item.sold = item.sold !== undefined ? Number(item.sold) : 0;
                        return item;
                    });
                }

                return res.status(200).json({
                    success: true,
                    status: 'OK',
                    total: data.length,
                    data: data
                });
            } catch (fetchErr) {
                console.warn('[API Data] SP_Fetchdata execution fallback to SP_GETDATA:', fetchErr.message);
            }
        }

        const request = pool.request();
        request.input('proc_name', sql.NVarChar(50), normalizedProc);
        request.input('Opr', sql.NVarChar(10), opr);
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
                status: status
            });
        }

        let data = recordsets.length > 1 ? recordsets[0] : (recordsets.length === 1 && !recordsets[0][0]?.Response_Status ? recordsets[0] : null);

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
                }
                if (!item.product_name && item.title) {
                    item.product_name = item.title;
                }
                if (!item.category_name && item.category) {
                    item.category_name = item.category;
                }
                return item;
            });
        }

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
app.use(express.static(path.join(__dirname, 'public'), { index: false }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'catalog.html'));
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