const { sql, poolPromise } = require('./db');

async function migrateWishesTracking() {
    try {
        console.log('Connecting to database...');
        const pool = await poolPromise;
        if (!pool) {
            console.error('Failed to connect to pool');
            process.exit(1);
        }

        console.log('Checking and adding wish tracking columns to dbo.[user] table...');

        const query = `
            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.[user]') AND name = 'last_birthday_wish_year')
            BEGIN
                ALTER TABLE dbo.[user] ADD last_birthday_wish_year INT NULL;
                PRINT 'Added last_birthday_wish_year column';
            END

            IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.[user]') AND name = 'last_anniversary_wish_year')
            BEGIN
                ALTER TABLE dbo.[user] ADD last_anniversary_wish_year INT NULL;
                PRINT 'Added last_anniversary_wish_year column';
            END
        `;

        await pool.request().query(query);
        console.log('Wish tracking columns added successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Wish tracking migration error:', err);
        process.exit(1);
    }
}

migrateWishesTracking();
