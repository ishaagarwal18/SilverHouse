const { sql, poolPromise } = require('./db');

async function migrate() {
    try {
        console.log('Connecting to database...');
        const pool = await poolPromise;
        if (!pool) {
            console.error('Failed to connect to pool');
            process.exit(1);
        }

        console.log('Checking and adding columns to dbo.[user] table...');

        const query = `
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.[user]') AND name = 'birthday_date')
            BEGIN
                ALTER TABLE dbo.[user] ADD birthday_date DATE NULL;
                PRINT 'Added birthday_date column';
            END

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.[user]') AND name = 'anniversary_date')
            BEGIN
                ALTER TABLE dbo.[user] ADD anniversary_date DATE NULL;
                PRINT 'Added anniversary_date column';
            END

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.[user]') AND name = 'gst_number')
            BEGIN
                ALTER TABLE dbo.[user] ADD gst_number NVARCHAR(30) NULL;
                PRINT 'Added gst_number column';
            END
        `;

        await pool.request().query(query);
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Migration error:', err);
        process.exit(1);
    }
}

migrate();
