const { Pool } = require('pg');

let pgPool = null;

function getPgPool(connectionString) {
    if (!pgPool) {
        pgPool = new Pool({
            connectionString: connectionString || process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false }
        });
    }
    return pgPool;
}

const PK_MAP = {
    product: 'product_id',
    category: 'category_id',
    make_master: 'm_id',
    image: 'image_id',
    product_image: 'pi_id',
    user: 'user_id',
    users: 'user_id',
    cart: 'cart_id',
    cart_item: 'ci_id',
    orders: 'order_id',
    order_item: 'oi_id',
    wishlist: 'wishlist_id',
    reviews: 'review_id'
};

async function executePgFetch(proc_name, jsonStr, condition) {
    const pool = getPgPool();
    const entity = (proc_name || '').trim().toLowerCase();
    let filters = {};
    if (jsonStr) {
        try {
            const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
            filters = parsed.filters || parsed.table_values || parsed || {};
        } catch { }
    }

    if (entity === 'product') {
        let query = `
            SELECT 
                p.product_id,
                p.title AS product_name,
                p.title,
                p.purity,
                p.weight,
                p.description,
                p.price,
                p.discount,
                ROUND(p.price - (p.price * COALESCE(p.discount, 0) / 100.0), 2) AS final_price,
                p.quantity,
                p.ideal_for,
                p.packaging,
                p.labour_cost,
                p.actual_cost,
                p.priority,
                COALESCE(p.color, 'Silver') AS color,
                0 AS review,
                p.sold,
                p.category_id,
                c.name AS category_name,
                c.slug AS category_slug,
                p.m_id AS make_id,
                m.type AS make_type,
                COALESCE(
                    (
                        SELECT json_agg(json_build_object('image_id', img.image_id, 'image_url', img.image_url))
                        FROM product_image pi
                        JOIN image img ON pi.image_id = img.image_id
                        WHERE pi.product_id = p.product_id
                    ),
                    '[]'::json
                ) AS images
            FROM product p
            LEFT JOIN category c ON p.category_id = c.category_id
            LEFT JOIN make_master m ON p.m_id = m.m_id
            WHERE 1=1
        `;
        const params = [];
        let pIndex = 1;

        if (condition) {
            query += ` AND p.product_id = $${pIndex++}`;
            params.push(parseInt(condition));
        }
        if (filters.product_id) {
            query += ` AND p.product_id = $${pIndex++}`;
            params.push(parseInt(filters.product_id));
        }
        if (filters.category_id) {
            query += ` AND p.category_id = $${pIndex++}`;
            params.push(parseInt(filters.category_id));
        }
        if (filters.category_name && filters.category_name.toLowerCase() !== 'all') {
            query += ` AND (LOWER(c.name) = LOWER($${pIndex}) OR LOWER(c.slug) = LOWER($${pIndex}))`;
            pIndex++;
            params.push(filters.category_name);
        }
        if (filters.ideal_for && filters.ideal_for.toLowerCase() !== 'all') {
            query += ` AND (LOWER(p.ideal_for) = LOWER($${pIndex}) OR LOWER(p.ideal_for) = 'all')`;
            pIndex++;
            params.push(filters.ideal_for);
        }
        if (filters.search) {
            query += ` AND (p.title ILIKE $${pIndex} OR p.description ILIKE $${pIndex})`;
            pIndex++;
            params.push(`%${filters.search}%`);
        }

        query += ` ORDER BY p.priority DESC, p.product_id ASC`;

        const res = await pool.query(query, params);
        return res.rows;
    }

    if (entity === 'category') {
        let query = `SELECT * FROM category`;
        const params = [];
        if (condition) {
            query += ` WHERE category_id = $1`;
            params.push(parseInt(condition));
        }
        query += ` ORDER BY category_id ASC`;
        const res = await pool.query(query, params);
        return res.rows;
    }

    if (entity === 'make_master') {
        let query = `SELECT * FROM make_master`;
        const params = [];
        if (condition) {
            query += ` WHERE m_id = $1`;
            params.push(parseInt(condition));
        }
        query += ` ORDER BY m_id ASC`;
        const res = await pool.query(query, params);
        return res.rows;
    }

    if (entity === 'image') {
        let query = `SELECT * FROM image`;
        const params = [];
        if (condition) {
            query += ` WHERE image_id = $1`;
            params.push(parseInt(condition));
        }
        query += ` ORDER BY image_id ASC`;
        const res = await pool.query(query, params);
        return res.rows;
    }

    if (entity === 'product_image') {
        let query = `
            SELECT pi.pi_id, pi.product_id, pi.image_id, p.title as product_title, img.image_url
            FROM product_image pi
            LEFT JOIN product p ON pi.product_id = p.product_id
            LEFT JOIN image img ON pi.image_id = img.image_id
        `;
        const params = [];
        if (condition) {
            query += ` WHERE pi.pi_id = $1`;
            params.push(parseInt(condition));
        }
        query += ` ORDER BY pi.pi_id ASC`;
        const res = await pool.query(query, params);
        return res.rows;
    }

    if (entity === 'orders') {
        let query = `SELECT * FROM orders ORDER BY order_id DESC`;
        const res = await pool.query(query);
        return res.rows;
    }

    if (entity === 'user' || entity === 'users') {
        let query = `SELECT user_id, full_name, email, phone, role FROM "user" ORDER BY user_id ASC`;
        const res = await pool.query(query);
        return res.rows;
    }

    // Default fallback
    try {
        const res = await pool.query(`SELECT * FROM ${entity}`);
        return res.rows;
    } catch {
        return [];
    }
}

async function executePgMutation(proc_name, opr, table_values, condition) {
    const pool = getPgPool();
    let entity = (proc_name || '').trim().toLowerCase();
    if (entity === 'users') entity = 'user';
    const tableName = entity === 'user' ? '"user"' : entity;
    const pk = PK_MAP[entity] || `${entity}_id`;
    const operation = (opr || '').trim().toUpperCase();

    if (operation === 'DELETE') {
        if (!condition) throw new Error("Delete requires a condition (ID)");
        await pool.query(`DELETE FROM ${tableName} WHERE ${pk} = $1`, [parseInt(condition)]);
        return { status: 'OK', data: [{ deleted: condition }] };
    }

    if (operation === 'ADD' || operation === 'INSERT') {
        const keys = Object.keys(table_values).filter(k => k !== pk);
        const vals = keys.map(k => table_values[k]);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const cols = keys.map(k => k === 'user' ? '"user"' : k).join(', ');

        const query = `INSERT INTO ${tableName} (${cols}) VALUES (${placeholders}) RETURNING *`;
        const res = await pool.query(query, vals);
        return { status: 'OK', data: res.rows };
    }

    if (operation === 'EDIT' || operation === 'UPDATE') {
        if (!condition && !table_values[pk]) throw new Error("Update requires ID");
        const targetId = condition || table_values[pk];
        const keys = Object.keys(table_values).filter(k => k !== pk);
        const setClauses = keys.map((k, i) => `${k === 'user' ? '"user"' : k} = $${i + 1}`).join(', ');
        const vals = keys.map(k => table_values[k]);
        vals.push(parseInt(targetId));

        const query = `UPDATE ${tableName} SET ${setClauses} WHERE ${pk} = $${vals.length} RETURNING *`;
        const res = await pool.query(query, vals);
        return { status: 'OK', data: res.rows };
    }

    if (operation === 'RESTOCK') {
        if (!condition && !table_values[pk]) throw new Error("Restock requires ID");
        const targetId = condition || table_values[pk];
        const addQty = parseInt(table_values.quantity || 0);
        const query = `UPDATE product SET quantity = quantity + $1 WHERE product_id = $2 RETURNING *`;
        const res = await pool.query(query, [addQty, parseInt(targetId)]);
        return { status: 'OK', data: res.rows };
    }

    return { status: 'OK', data: [] };
}

module.exports = {
    getPgPool,
    executePgFetch,
    executePgMutation
};
