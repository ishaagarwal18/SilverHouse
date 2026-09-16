require('dotenv').config();
const { poolPromise: mssqlPoolPromise } = require('./db');
const { Pool: PgPool } = require('pg');

const neonConnectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_f2vpj7NTeYaE@ep-soft-wildflower-b488k38l-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require';

const pgPool = new PgPool({
    connectionString: neonConnectionString,
    ssl: { rejectUnauthorized: false }
});

async function migrate() {
    console.log("=== Starting MSSQL to Neon PostgreSQL Migration ===");

    const mssqlPool = await mssqlPoolPromise;
    console.log("Connected to MSSQL Database.");

    const pgClient = await pgPool.connect();
    console.log("Connected to Neon PostgreSQL.");

    try {
        await pgClient.query('BEGIN');

        // 1. Create Tables
        console.log("Creating PostgreSQL tables in Neon...");

        await pgClient.query(`
            -- Categories
            CREATE TABLE IF NOT EXISTS category (
                category_id SERIAL PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                slug VARCHAR(150),
                description TEXT,
                ideal_for VARCHAR(50) DEFAULT 'ALL'
            );

            -- Make Master (Crafting type)
            CREATE TABLE IF NOT EXISTS make_master (
                m_id SERIAL PRIMARY KEY,
                type VARCHAR(100) NOT NULL,
                description TEXT
            );

            -- Products
            CREATE TABLE IF NOT EXISTS product (
                product_id SERIAL PRIMARY KEY,
                category_id INT REFERENCES category(category_id) ON DELETE SET NULL,
                m_id INT REFERENCES make_master(m_id) ON DELETE SET NULL,
                title VARCHAR(255) NOT NULL,
                purity VARCHAR(100) DEFAULT '92.5 Sterling Silver',
                weight VARCHAR(50),
                color VARCHAR(50) DEFAULT 'Silver',
                ideal_for VARCHAR(50) DEFAULT 'ALL',
                packaging VARCHAR(100),
                priority INT DEFAULT 10,
                actual_cost NUMERIC(12, 2) DEFAULT 0,
                labour_cost NUMERIC(12, 2) DEFAULT 0,
                price NUMERIC(12, 2) NOT NULL,
                discount NUMERIC(5, 2) DEFAULT 0,
                quantity INT DEFAULT 10,
                sold INT DEFAULT 0,
                description TEXT
            );

            -- Images
            CREATE TABLE IF NOT EXISTS image (
                image_id SERIAL PRIMARY KEY,
                image_url VARCHAR(500) NOT NULL
            );

            -- Product Images Bridge
            CREATE TABLE IF NOT EXISTS product_image (
                pi_id SERIAL PRIMARY KEY,
                product_id INT REFERENCES product(product_id) ON DELETE CASCADE,
                image_id INT REFERENCES image(image_id) ON DELETE CASCADE
            );

            -- App Users
            CREATE TABLE IF NOT EXISTS "user" (
                user_id SERIAL PRIMARY KEY,
                full_name VARCHAR(150) NOT NULL,
                email VARCHAR(200) UNIQUE NOT NULL,
                phone VARCHAR(50),
                password_hash VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'CUSTOMER'
            );

            -- Cart
            CREATE TABLE IF NOT EXISTS cart (
                cart_id SERIAL PRIMARY KEY,
                user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE
            );

            -- Cart Items
            CREATE TABLE IF NOT EXISTS cart_item (
                ci_id SERIAL PRIMARY KEY,
                cart_id INT REFERENCES cart(cart_id) ON DELETE CASCADE,
                product_id INT REFERENCES product(product_id) ON DELETE CASCADE,
                quantity INT DEFAULT 1
            );

            -- Orders
            CREATE TABLE IF NOT EXISTS orders (
                order_id SERIAL PRIMARY KEY,
                user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE,
                total_amount NUMERIC(12, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'PENDING',
                shipping_address TEXT,
                payment_method VARCHAR(50) DEFAULT 'COD',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Order Items
            CREATE TABLE IF NOT EXISTS order_item (
                oi_id SERIAL PRIMARY KEY,
                order_id INT REFERENCES orders(order_id) ON DELETE CASCADE,
                product_id INT REFERENCES product(product_id) ON DELETE SET NULL,
                quantity INT NOT NULL,
                price NUMERIC(12, 2) NOT NULL
            );

            -- Wishlist
            CREATE TABLE IF NOT EXISTS wishlist (
                wishlist_id SERIAL PRIMARY KEY,
                user_id INT REFERENCES "user"(user_id) ON DELETE CASCADE,
                product_id INT REFERENCES product(product_id) ON DELETE CASCADE
            );

            -- Reviews
            CREATE TABLE IF NOT EXISTS reviews (
                review_id SERIAL PRIMARY KEY,
                product_id INT REFERENCES product(product_id) ON DELETE CASCADE,
                user_id INT REFERENCES "user"(user_id) ON DELETE SET NULL,
                rating NUMERIC(2, 1) DEFAULT 5.0,
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Schema created successfully.");

        // 2. Clear existing data in reverse FK order for clean re-sync
        await pgClient.query(`
            TRUNCATE reviews, wishlist, order_item, orders, cart_item, cart, 
                     product_image, image, product, make_master, category, "user" RESTART IDENTITY CASCADE;
        `);

        // 3. Migrate Categories
        const catRes = await mssqlPool.request().query('SELECT * FROM dbo.category');
        for (const r of catRes.recordset) {
            await pgClient.query(
                'INSERT INTO category (category_id, name, slug, description, ideal_for) VALUES ($1, $2, $3, $4, $5)',
                [r.category_id, r.name, r.slug, r.description, r.ideal_for || 'ALL']
            );
        }
        await pgClient.query(`SELECT setval('category_category_id_seq', COALESCE((SELECT MAX(category_id) FROM category), 1));`);
        console.log(`Migrated ${catRes.recordset.length} categories.`);

        // 4. Migrate Make Master
        const makeRes = await mssqlPool.request().query('SELECT * FROM dbo.make_master');
        for (const r of makeRes.recordset) {
            await pgClient.query(
                'INSERT INTO make_master (m_id, type, description) VALUES ($1, $2, $3)',
                [r.m_id, r.type, r.description]
            );
        }
        await pgClient.query(`SELECT setval('make_master_m_id_seq', COALESCE((SELECT MAX(m_id) FROM make_master), 1));`);
        console.log(`Migrated ${makeRes.recordset.length} make_master records.`);

        // 5. Migrate Products
        const prodRes = await mssqlPool.request().query('SELECT * FROM dbo.product');
        for (const r of prodRes.recordset) {
            await pgClient.query(
                `INSERT INTO product (
                    product_id, category_id, m_id, title, purity, weight, color, 
                    ideal_for, packaging, priority, actual_cost, labour_cost, 
                    price, discount, quantity, sold, description
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
                [
                    r.product_id, r.category_id, r.m_id, r.title, r.purity, r.weight, r.color || 'Silver',
                    r.ideal_for || 'ALL', r.packaging, r.priority || 10, r.actual_cost || 0, r.labour_cost || 0,
                    r.price, r.discount || 0, r.quantity || 0, r.sold || 0, r.description
                ]
            );
        }
        await pgClient.query(`SELECT setval('product_product_id_seq', COALESCE((SELECT MAX(product_id) FROM product), 1));`);
        console.log(`Migrated ${prodRes.recordset.length} products.`);

        // 6. Migrate Images
        const imgRes = await mssqlPool.request().query('SELECT * FROM dbo.image');
        for (const r of imgRes.recordset) {
            await pgClient.query(
                'INSERT INTO image (image_id, image_url) VALUES ($1, $2)',
                [r.image_id, r.image_url]
            );
        }
        await pgClient.query(`SELECT setval('image_image_id_seq', COALESCE((SELECT MAX(image_id) FROM image), 1));`);
        console.log(`Migrated ${imgRes.recordset.length} images.`);

        // 7. Migrate Product Images
        const piRes = await mssqlPool.request().query('SELECT * FROM dbo.product_image');
        for (const r of piRes.recordset) {
            await pgClient.query(
                'INSERT INTO product_image (product_id, image_id) VALUES ($1, $2)',
                [r.product_id, r.image_id]
            );
        }
        console.log(`Migrated ${piRes.recordset.length} product_image relations.`);

        // 8. Migrate Users
        try {
            const userRes = await mssqlPool.request().query('SELECT * FROM dbo.[user]');
            for (const r of userRes.recordset) {
                await pgClient.query(
                    'INSERT INTO "user" (user_id, full_name, email, phone, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
                    [r.user_id, r.full_name, r.email, r.phone, r.password_hash, r.role || 'CUSTOMER']
                );
            }
            await pgClient.query(`SELECT setval('user_user_id_seq', COALESCE((SELECT MAX(user_id) FROM "user"), 1));`);
            console.log(`Migrated ${userRes.recordset.length} users.`);
        } catch (e) {
            console.log("No users table or error migrating users:", e.message);
        }

        await pgClient.query('COMMIT');
        console.log("=== MIGRATION COMPLETED SUCCESSFULLY! ===");
    } catch (err) {
        await pgClient.query('ROLLBACK');
        console.error("Migration Failed:", err);
    } finally {
        pgClient.release();
        await pgPool.end();
        process.exit(0);
    }
}

migrate();
