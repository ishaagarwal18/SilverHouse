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

        // Special handler: When selecting products, use SP_Fetchdata to guarantee full joined dataset (categories & images)
        if (proc_name.toLowerCase() === 'product' && opr.toUpperCase() === 'SELECT') {
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
        request.input('proc_name', sql.NVarChar(50), proc_name);
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