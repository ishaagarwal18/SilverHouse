const { sql, poolPromise } = require('./db');

async function runMigration() {
    console.log('[Migration] Starting custom orders schema update on dbo.orders...');
    try {
        const pool = await poolPromise;
        if (!pool) {
            throw new Error('Could not connect to database.');
        }

        // 1. Add 'image' column if not exists
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns 
                WHERE object_id = OBJECT_ID('dbo.orders') AND name = 'image'
            )
            BEGIN
                ALTER TABLE dbo.orders ADD [image] NVARCHAR(MAX) NULL;
                PRINT 'Added column [image] to dbo.orders';
            END
            ELSE
            BEGIN
                PRINT 'Column [image] already exists in dbo.orders';
            END
        `);

        // 2. Add 'confirm' column first
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns 
                WHERE object_id = OBJECT_ID('dbo.orders') AND name = 'confirm'
            )
            BEGIN
                ALTER TABLE dbo.orders ADD [confirm] VARCHAR(20) NOT NULL CONSTRAINT DF_orders_confirm DEFAULT 'processing';
            END
        `);

        // Add check constraint in a separate batch / query
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM sys.check_constraints 
                WHERE parent_object_id = OBJECT_ID('dbo.orders') AND name = 'CK_orders_confirm'
            )
            BEGIN
                EXEC('ALTER TABLE dbo.orders WITH CHECK ADD CONSTRAINT CK_orders_confirm CHECK (confirm IN (''processing'', ''rejected'', ''accepted''))');
            END
        `);

        // 3. Add custom category column if not exists
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns 
                WHERE object_id = OBJECT_ID('dbo.orders') AND name = 'custom_category'
            )
            BEGIN
                ALTER TABLE dbo.orders ADD [custom_category] NVARCHAR(100) NULL;
                PRINT 'Added column [custom_category] to dbo.orders';
            END
        `);

        // 4. Add description column if not exists
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns 
                WHERE object_id = OBJECT_ID('dbo.orders') AND name = 'description'
            )
            BEGIN
                ALTER TABLE dbo.orders ADD [description] NVARCHAR(MAX) NULL;
                PRINT 'Added column [description] to dbo.orders';
            END
        `);

        // 5. Add customer contact info columns if not exists
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns 
                WHERE object_id = OBJECT_ID('dbo.orders') AND name = 'customer_name'
            )
            BEGIN
                ALTER TABLE dbo.orders ADD [customer_name] NVARCHAR(150) NULL;
            END

            IF NOT EXISTS (
                SELECT 1 FROM sys.columns 
                WHERE object_id = OBJECT_ID('dbo.orders') AND name = 'customer_phone'
            )
            BEGIN
                ALTER TABLE dbo.orders ADD [customer_phone] NVARCHAR(50) NULL;
            END

            IF NOT EXISTS (
                SELECT 1 FROM sys.columns 
                WHERE object_id = OBJECT_ID('dbo.orders') AND name = 'customer_email'
            )
            BEGIN
                ALTER TABLE dbo.orders ADD [customer_email] NVARCHAR(150) NULL;
            END
        `);

        // 6. Add is_custom flag if not exists
        await pool.request().query(`
            IF NOT EXISTS (
                SELECT 1 FROM sys.columns 
                WHERE object_id = OBJECT_ID('dbo.orders') AND name = 'is_custom'
            )
            BEGIN
                ALTER TABLE dbo.orders ADD [is_custom] BIT NOT NULL CONSTRAINT DF_orders_is_custom DEFAULT 0;
                PRINT 'Added column [is_custom] to dbo.orders';
            END
        `);

        // 7. Make user_id nullable on dbo.orders to allow guest custom requests
        await pool.request().query(`
            IF EXISTS (
                SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = 'orders' AND COLUMN_NAME = 'user_id' AND IS_NULLABLE = 'NO'
            )
            BEGIN
                ALTER TABLE dbo.orders ALTER COLUMN user_id INT NULL;
                PRINT 'Altered column [user_id] on dbo.orders to allow NULL';
            END
        `);

        const colResult = await pool.request().query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = 'orders'
            ORDER BY ORDINAL_POSITION
        `);
        console.log('[Orders Schema Columns]:', colResult.recordset);

        const checkResult = await pool.request().query(`
            SELECT name, definition 
            FROM sys.check_constraints 
            WHERE parent_object_id = OBJECT_ID('dbo.orders')
        `);
        console.log('[Orders Check Constraints]:', checkResult.recordset);

        console.log('[Migration] Schema migration completed successfully!');
    } catch (err) {
        console.error('[Migration Error]:', err);
        process.exit(1);
    } finally {
        process.exit(0);
    }
}

runMigration();
