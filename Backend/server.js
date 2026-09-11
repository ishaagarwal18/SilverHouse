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
                const orderNum = vals.order_number || ('SH-' + Math.floor(100000 + Math.random() * 900000));
                let userId = vals.user_id ? Number(vals.user_id) : null;
                const addressId = vals.address_id ? Number(vals.address_id) : null;
                const totalAmt = Number(vals.total_amount || 0);
                const discountAmt = Number(vals.discount_amount || 0);
                const finalPayable = Number(vals.final_payable || (totalAmt - discountAmt));
                const paymentStatus = vals.payment_status || 'PAID';
                const custName = vals.customer_name || 'Valued Patron';
                const custEmail = vals.customer_email || 'customer@silverhouse.com';
                const custPhone = vals.customer_phone || null;
                const guestToken = vals.guest_token || null;

                // Ensure user_id is valid because dbo.orders.user_id is NOT NULL
                if (!userId || isNaN(userId)) {
                    if (custEmail) {
                        const findUserReq = pool.request();
                        findUserReq.input('email', sql.NVarChar(255), custEmail);
                        const userFound = await findUserReq.query('SELECT TOP 1 user_id FROM dbo.[user] WHERE email = @email;');
                        if (userFound.recordset.length > 0) {
                            userId = userFound.recordset[0].user_id;
                        }
                    }

                    if (!userId) {
                        try {
                            const createUserReq = pool.request();
                            createUserReq.input('full_name', sql.NVarChar(200), custName);
                            createUserReq.input('email', sql.NVarChar(255), custEmail);
                            createUserReq.input('phone', sql.NVarChar(20), custPhone);
                            const newUserRes = await createUserReq.query(`
                                INSERT INTO dbo.[user] (full_name, email, phone, role, created_at)
                                OUTPUT INSERTED.user_id
                                VALUES (@full_name, @email, @phone, 'CUSTOMER', SYSDATETIME());
                            `);
                            userId = newUserRes.recordset[0]?.user_id;
                        } catch (createErr) {
                            console.warn('[User Auto-Create Notice]:', createErr.message);
                        }
                    }

                    if (!userId) {
                        const firstUserRes = await pool.request().query('SELECT TOP 1 user_id FROM dbo.[user] ORDER BY user_id ASC;');
                        if (firstUserRes.recordset.length > 0) {
                            userId = firstUserRes.recordset[0].user_id;
                        }
                    }
                }

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

                // Insert items into dbo.order_item
                if (newOrderId && Array.isArray(vals.items) && vals.items.length > 0) {
                    for (const itm of vals.items) {
                        try {
                            const rawId = itm.product_id || itm.id;
                            let validPId = null;
                            if (rawId && !isNaN(Number(rawId))) {
                                const pCheck = await pool.request().input('pid', sql.Int, Number(rawId)).query('SELECT TOP 1 product_id FROM dbo.product WHERE product_id = @pid;');
                                if (pCheck.recordset.length > 0) validPId = pCheck.recordset[0].product_id;
                            }
                            if (!validPId && (itm.product_name || itm.title)) {
                                const pNameCheck = await pool.request().input('title', sql.NVarChar(255), '%' + (itm.product_name || itm.title) + '%').query('SELECT TOP 1 product_id FROM dbo.product WHERE title LIKE @title;');
                                if (pNameCheck.recordset.length > 0) validPId = pNameCheck.recordset[0].product_id;
                            }
                            if (!validPId) {
                                const pFirst = await pool.request().query('SELECT TOP 1 product_id FROM dbo.product ORDER BY product_id ASC;');
                                if (pFirst.recordset.length > 0) validPId = pFirst.recordset[0].product_id;
                            }

                            if (validPId) {
                                const itemReq = pool.request();
                                itemReq.input('order_id', sql.Int, newOrderId);
                                itemReq.input('product_id', sql.Int, validPId);
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

                // Clear customer's cart in dbo.cart_item upon successful order placement
                try {
                    const clearCartReq = pool.request();
                    clearCartReq.input('uid', sql.Int, userId);
                    clearCartReq.input('gtoken', sql.NVarChar(100), guestToken);
                    await clearCartReq.query(`
                        DELETE ci 
                        FROM dbo.cart_item ci
                        INNER JOIN dbo.cart c ON ci.cart_id = c.cart_id
                        WHERE (c.user_id = @uid AND @uid IS NOT NULL) OR (c.guest_token = @gtoken AND @gtoken IS NOT NULL);
                    `);
                } catch (clearErr) {
                    console.warn('[Clear Cart after Order Warning]:', clearErr.message);
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

        // Direct handler for editing orders
        if (normalizedProc === 'orders' && opr.toUpperCase() === 'EDIT' && condition) {
            try {
                const vals = table_values || {};
                const orderId = Number(condition);
                const editReq = pool.request();
                editReq.input('order_id', sql.Int, orderId);
                editReq.input('user_id', sql.Int, vals.user_id ? Number(vals.user_id) : null);
                editReq.input('address_id', sql.Int, vals.address_id ? Number(vals.address_id) : null);
                editReq.input('total_amount', sql.Decimal(18, 2), vals.total_amount ? Number(vals.total_amount) : null);
                editReq.input('discount_amount', sql.Decimal(18, 2), vals.discount_amount ? Number(vals.discount_amount) : null);
                editReq.input('final_payable', sql.Decimal(18, 2), vals.final_payable ? Number(vals.final_payable) : null);
                editReq.input('payment_status', sql.NVarChar(20), vals.payment_status || null);
                editReq.input('order_number', sql.NVarChar(50), vals.order_number || null);

                await editReq.query(`
                    UPDATE dbo.orders
                    SET user_id = COALESCE(@user_id, user_id),
                        address_id = COALESCE(@address_id, address_id),
                        total_amount = COALESCE(@total_amount, total_amount),
                        discount_amount = COALESCE(@discount_amount, discount_amount),
                        final_payable = COALESCE(@final_payable, final_payable),
                        payment_status = COALESCE(@payment_status, payment_status),
                        order_number = COALESCE(@order_number, order_number)
                    WHERE order_id = @order_id;
                `);
                return res.status(200).json({ success: true, status: 'OK', message: 'Order updated successfully' });
            } catch (err) {
                return res.status(500).json({ success: false, error: err.message });
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

        // Direct handler for adding cart
        if (normalizedProc === 'cart' && (opr.toUpperCase() === 'ADD' || opr.toUpperCase() === 'INSERT')) {
            try {
                const vals = table_values || {};
                const addReq = pool.request();
                addReq.input('user_id', sql.Int, vals.user_id ? Number(vals.user_id) : null);
                addReq.input('guest_token', sql.NVarChar(100), vals.guest_token || null);
                const insRes = await addReq.query(`
                    INSERT INTO dbo.cart (user_id, guest_token, updated_at)
                    OUTPUT INSERTED.cart_id
                    VALUES (@user_id, @guest_token, SYSDATETIME());
                `);
                const newId = insRes.recordset[0]?.cart_id;
                return res.status(200).json({ success: true, status: 'OK', data: [{ cart_id: newId }], message: 'Cart created successfully' });
            } catch (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
        }

        // Direct handler for editing cart
        if (normalizedProc === 'cart' && opr.toUpperCase() === 'EDIT' && condition) {
            try {
                const vals = table_values || {};
                const editReq = pool.request();
                editReq.input('cart_id', sql.Int, Number(condition));
                editReq.input('user_id', sql.Int, vals.user_id ? Number(vals.user_id) : null);
                editReq.input('guest_token', sql.NVarChar(100), vals.guest_token || null);
                await editReq.query(`
                    UPDATE dbo.cart
                    SET user_id = COALESCE(@user_id, user_id),
                        guest_token = COALESCE(@guest_token, guest_token),
                        updated_at = SYSDATETIME()
                    WHERE cart_id = @cart_id;
                `);
                return res.status(200).json({ success: true, status: 'OK', message: 'Cart updated successfully' });
            } catch (err) {
                return res.status(500).json({ success: false, error: err.message });
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
                const uid = table_values?.user_id;
                const gtoken = table_values?.guest_token;

                if (cartId && !isNaN(Number(cartId))) {
                    ciReq.input('cartId', sql.Int, Number(cartId));
                    filterClause = 'WHERE ci.cart_id = @cartId';
                } else if (uid && !isNaN(Number(uid))) {
                    ciReq.input('uid', sql.Int, Number(uid));
                    filterClause = 'WHERE c.user_id = @uid';
                } else if (gtoken) {
                    ciReq.input('gtoken', sql.NVarChar(100), gtoken);
                    filterClause = 'WHERE c.guest_token = @gtoken';
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

        // Direct handler for adding cart_item (supports direct cart_id or auto-resolving via user_id / guest_token)
        if (normalizedProc === 'cart_item' && (opr.toUpperCase() === 'ADD' || opr.toUpperCase() === 'INSERT')) {
            try {
                const vals = table_values || {};
                let cartId = vals.cart_id ? Number(vals.cart_id) : null;
                const userId = vals.user_id ? Number(vals.user_id) : null;
                const guestToken = vals.guest_token || null;
                const rawProductId = vals.product_id || vals.id;
                const quantity = Math.max(1, Number(vals.quantity || 1));

                let validProductId = null;
                if (rawProductId && !isNaN(Number(rawProductId))) {
                    const pCheck = await pool.request().input('pid', sql.Int, Number(rawProductId)).query('SELECT TOP 1 product_id FROM dbo.product WHERE product_id = @pid;');
                    if (pCheck.recordset.length > 0) validProductId = pCheck.recordset[0].product_id;
                }
                if (!validProductId && (vals.product_name || vals.title)) {
                    const pNameCheck = await pool.request().input('title', sql.NVarChar(255), '%' + (vals.product_name || vals.title) + '%').query('SELECT TOP 1 product_id FROM dbo.product WHERE title LIKE @title;');
                    if (pNameCheck.recordset.length > 0) validProductId = pNameCheck.recordset[0].product_id;
                }
                if (!validProductId) {
                    const pFirst = await pool.request().query('SELECT TOP 1 product_id FROM dbo.product ORDER BY product_id ASC;');
                    if (pFirst.recordset.length > 0) validProductId = pFirst.recordset[0].product_id;
                }

                if (!cartId && (userId || guestToken)) {
                    const cLookupReq = pool.request();
                    cLookupReq.input('uid', sql.Int, userId);
                    cLookupReq.input('gtoken', sql.NVarChar(100), guestToken);

                    let findQuery = userId
                        ? 'SELECT TOP 1 cart_id FROM dbo.cart WHERE user_id = @uid ORDER BY cart_id DESC;'
                        : 'SELECT TOP 1 cart_id FROM dbo.cart WHERE guest_token = @gtoken ORDER BY cart_id DESC;';

                    const existingCartRes = await cLookupReq.query(findQuery);
                    if (existingCartRes.recordset.length > 0) {
                        cartId = existingCartRes.recordset[0].cart_id;
                        const upReq = pool.request();
                        upReq.input('cid', sql.Int, cartId);
                        await upReq.query('UPDATE dbo.cart SET updated_at = SYSDATETIME() WHERE cart_id = @cid;');
                    } else {
                        const createCartReq = pool.request();
                        createCartReq.input('uid', sql.Int, userId);
                        createCartReq.input('gtoken', sql.NVarChar(100), guestToken);
                        const newCartRes = await createCartReq.query(`
                            INSERT INTO dbo.cart (user_id, guest_token, updated_at)
                            OUTPUT INSERTED.cart_id
                            VALUES (@uid, @gtoken, SYSDATETIME());
                        `);
                        cartId = newCartRes.recordset[0]?.cart_id;
                    }
                }

                if (!cartId || !validProductId) {
                    return res.status(400).json({ success: false, error: 'cart_id (or user_id/guest_token) and a valid product are required' });
                }

                // Check if product already exists in this cart -> increment quantity
                const checkReq = pool.request();
                checkReq.input('cart_id', sql.Int, cartId);
                checkReq.input('product_id', sql.Int, validProductId);
                const checkRes = await checkReq.query('SELECT cart_item_id, quantity FROM dbo.cart_item WHERE cart_id = @cart_id AND product_id = @product_id;');

                if (checkRes.recordset.length > 0) {
                    const existingItemId = checkRes.recordset[0].cart_item_id;
                    const newQty = checkRes.recordset[0].quantity + quantity;
                    const updateItemReq = pool.request();
                    updateItemReq.input('cart_item_id', sql.Int, existingItemId);
                    updateItemReq.input('quantity', sql.Int, newQty);
                    await updateItemReq.query('UPDATE dbo.cart_item SET quantity = @quantity WHERE cart_item_id = @cart_item_id;');
                    return res.status(200).json({ success: true, status: 'OK', data: [{ cart_id: cartId, cart_item_id: existingItemId, quantity: newQty }], message: 'Cart item quantity updated' });
                } else {
                    const addReq = pool.request();
                    addReq.input('cart_id', sql.Int, cartId);
                    addReq.input('product_id', sql.Int, validProductId);
                    addReq.input('quantity', sql.Int, quantity);
                    const insRes = await addReq.query(`
                        INSERT INTO dbo.cart_item (cart_id, product_id, quantity, created_at)
                        OUTPUT INSERTED.cart_item_id
                        VALUES (@cart_id, @product_id, @quantity, SYSDATETIME());
                    `);
                    const newId = insRes.recordset[0]?.cart_item_id;
                    return res.status(200).json({ success: true, status: 'OK', data: [{ cart_id: cartId, cart_item_id: newId, quantity }], message: 'Cart item added successfully' });
                }
            } catch (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
        }

        // Direct handler for editing cart_item
        if (normalizedProc === 'cart_item' && opr.toUpperCase() === 'EDIT' && condition) {
            try {
                const vals = table_values || {};
                const editReq = pool.request();
                editReq.input('cart_item_id', sql.Int, Number(condition));
                editReq.input('cart_id', sql.Int, vals.cart_id ? Number(vals.cart_id) : null);
                editReq.input('product_id', sql.Int, vals.product_id ? Number(vals.product_id) : null);
                editReq.input('quantity', sql.Int, vals.quantity ? Number(vals.quantity) : null);
                await editReq.query(`
                    UPDATE dbo.cart_item
                    SET cart_id = COALESCE(@cart_id, cart_id),
                        product_id = COALESCE(@product_id, product_id),
                        quantity = COALESCE(@quantity, quantity)
                    WHERE cart_item_id = @cart_item_id;
                `);
                return res.status(200).json({ success: true, status: 'OK', message: 'Cart item updated successfully' });
            } catch (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
        }

        // Direct handler for updating cart item quantity directly by user/guest and product
        if (normalizedProc === 'cart_item' && opr.toUpperCase() === 'UPDATE_QTY') {
            try {
                const vals = table_values || {};
                const userId = vals.user_id ? Number(vals.user_id) : null;
                const guestToken = vals.guest_token || null;
                const productId = Number(vals.product_id);
                const quantity = Number(vals.quantity);

                let cartId = vals.cart_id ? Number(vals.cart_id) : null;
                if (!cartId && (userId || guestToken)) {
                    const cReq = pool.request();
                    cReq.input('uid', sql.Int, userId);
                    cReq.input('gtoken', sql.NVarChar(100), guestToken);
                    const q = userId
                        ? 'SELECT TOP 1 cart_id FROM dbo.cart WHERE user_id = @uid ORDER BY cart_id DESC;'
                        : 'SELECT TOP 1 cart_id FROM dbo.cart WHERE guest_token = @gtoken ORDER BY cart_id DESC;';
                    const cRes = await cReq.query(q);
                    if (cRes.recordset.length > 0) cartId = cRes.recordset[0].cart_id;
                }

                if (cartId && productId) {
                    if (quantity <= 0) {
                        const delReq = pool.request();
                        delReq.input('cart_id', sql.Int, cartId);
                        delReq.input('product_id', sql.Int, productId);
                        await delReq.query('DELETE FROM dbo.cart_item WHERE cart_id = @cart_id AND product_id = @product_id;');
                        return res.status(200).json({ success: true, status: 'OK', message: 'Item removed from cart' });
                    } else {
                        const upReq = pool.request();
                        upReq.input('cart_id', sql.Int, cartId);
                        upReq.input('product_id', sql.Int, productId);
                        upReq.input('quantity', sql.Int, quantity);
                        await upReq.query('UPDATE dbo.cart_item SET quantity = @quantity WHERE cart_id = @cart_id AND product_id = @product_id;');
                        return res.status(200).json({ success: true, status: 'OK', message: 'Cart item quantity updated' });
                    }
                }
                return res.status(400).json({ success: false, error: 'cart_id and product_id required' });
            } catch (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
        }

        // Direct handler for deleting cart_item
        if (normalizedProc === 'cart_item' && opr.toUpperCase() === 'DELETE') {
            try {
                const vals = table_values || {};
                const userId = vals.user_id ? Number(vals.user_id) : null;
                const guestToken = vals.guest_token || null;
                const productId = vals.product_id ? Number(vals.product_id) : null;

                if (condition && !isNaN(Number(condition))) {
                    const delReq = pool.request();
                    delReq.input('cart_item_id', sql.Int, Number(condition));
                    await delReq.query(`
                        DELETE FROM dbo.cart_item WHERE cart_item_id = @cart_item_id;
                    `);
                    return res.status(200).json({ success: true, status: 'OK', message: 'Cart item deleted successfully' });
                }

                if (productId && (userId || guestToken)) {
                    const cReq = pool.request();
                    cReq.input('uid', sql.Int, userId);
                    cReq.input('gtoken', sql.NVarChar(100), guestToken);
                    const q = userId
                        ? 'SELECT TOP 1 cart_id FROM dbo.cart WHERE user_id = @uid ORDER BY cart_id DESC;'
                        : 'SELECT TOP 1 cart_id FROM dbo.cart WHERE guest_token = @gtoken ORDER BY cart_id DESC;';
                    const cRes = await cReq.query(q);
                    if (cRes.recordset.length > 0) {
                        const cId = cRes.recordset[0].cart_id;
                        const dReq = pool.request();
                        dReq.input('cart_id', sql.Int, cId);
                        dReq.input('product_id', sql.Int, productId);
                        await dReq.query('DELETE FROM dbo.cart_item WHERE cart_id = @cart_id AND product_id = @product_id;');
                        return res.status(200).json({ success: true, status: 'OK', message: 'Cart item removed successfully' });
                    }
                }

                return res.status(200).json({ success: true, status: 'OK', message: 'No item removed' });
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

        // Direct handler for adding order_item
        if (normalizedProc === 'order_item' && (opr.toUpperCase() === 'ADD' || opr.toUpperCase() === 'INSERT')) {
            try {
                const vals = table_values || {};
                const addReq = pool.request();
                addReq.input('order_id', sql.Int, Number(vals.order_id));
                addReq.input('product_id', sql.Int, Number(vals.product_id));
                addReq.input('unit_price', sql.Decimal(18, 2), Number(vals.unit_price || 0));
                addReq.input('discount_percent', sql.Decimal(18, 2), Number(vals.discount_percent || 0));
                addReq.input('quantity', sql.Int, Number(vals.quantity || 1));
                addReq.input('subtotal', sql.Decimal(18, 2), Number(vals.subtotal || ((vals.unit_price || 0) * (vals.quantity || 1))));
                const insRes = await addReq.query(`
                    INSERT INTO dbo.order_item (order_id, product_id, unit_price, discount_percent, quantity, subtotal)
                    OUTPUT INSERTED.order_item_id
                    VALUES (@order_id, @product_id, @unit_price, @discount_percent, @quantity, @subtotal);
                `);
                const newId = insRes.recordset[0]?.order_item_id;
                return res.status(200).json({ success: true, status: 'OK', data: [{ order_item_id: newId }], message: 'Order item added successfully' });
            } catch (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
        }

        // Direct handler for editing order_item
        if (normalizedProc === 'order_item' && opr.toUpperCase() === 'EDIT' && condition) {
            try {
                const vals = table_values || {};
                const editReq = pool.request();
                editReq.input('order_item_id', sql.Int, Number(condition));
                editReq.input('order_id', sql.Int, vals.order_id ? Number(vals.order_id) : null);
                editReq.input('product_id', sql.Int, vals.product_id ? Number(vals.product_id) : null);
                editReq.input('unit_price', sql.Decimal(18, 2), vals.unit_price !== undefined ? Number(vals.unit_price) : null);
                editReq.input('discount_percent', sql.Decimal(18, 2), vals.discount_percent !== undefined ? Number(vals.discount_percent) : null);
                editReq.input('quantity', sql.Int, vals.quantity !== undefined ? Number(vals.quantity) : null);
                editReq.input('subtotal', sql.Decimal(18, 2), vals.subtotal !== undefined ? Number(vals.subtotal) : null);
                await editReq.query(`
                    UPDATE dbo.order_item
                    SET order_id = COALESCE(@order_id, order_id),
                        product_id = COALESCE(@product_id, product_id),
                        unit_price = COALESCE(@unit_price, unit_price),
                        discount_percent = COALESCE(@discount_percent, discount_percent),
                        quantity = COALESCE(@quantity, quantity),
                        subtotal = COALESCE(@subtotal, subtotal)
                    WHERE order_item_id = @order_item_id;
                `);
                return res.status(200).json({ success: true, status: 'OK', message: 'Order item updated successfully' });
            } catch (err) {
                return res.status(500).json({ success: false, error: err.message });
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

        // Direct handler for editing wishlist
        if (normalizedProc === 'wishlist' && opr.toUpperCase() === 'EDIT' && condition) {
            try {
                const vals = table_values || {};
                const editReq = pool.request();
                editReq.input('wishlist_id', sql.Int, Number(condition));
                editReq.input('user_id', sql.Int, Number(vals.user_id));
                editReq.input('product_id', sql.Int, Number(vals.product_id));
                await editReq.query(`
                    UPDATE dbo.wishlist
                    SET user_id = @user_id,
                        product_id = @product_id
                    WHERE wishlist_id = @wishlist_id;
                `);
                return res.status(200).json({ success: true, status: 'OK', message: 'Wishlist updated successfully' });
            } catch (err) {
                return res.status(500).json({ success: false, error: err.message });
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